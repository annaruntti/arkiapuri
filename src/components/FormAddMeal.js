import axios from 'axios'
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    View,
    KeyboardAvoidingView,
} from 'react-native'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useLogin } from '../context/LoginProvider'
import useMealFoodItemActions from '../hooks/useMealFoodItemActions'
import { getServerUrl } from '../utils/getServerUrl'
import { normalizeCategoryArray } from '../utils/foodCategory'
import {
    isPersistedFoodItemId,
    resolveCatalogFoodId,
} from '../utils/foodItemId'
import { pickMealImage, uploadMealImage } from '../utils/mealImage'
import { resolveMealFoodItemRefs } from '../utils/resolveMealFoodItems'
import {
    clampDatesToMin,
    toStoredMealDate,
    toStoredMealDates,
} from '../utils/mealDates'
import { getDifficultyEnum, parseMealCategories } from '../utils/mealUtils'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

import Button from './Button'
import GuestWarningBanner from './GuestWarningBanner'
import NoticeBanner from './NoticeBanner'
import ShoppingListPickerModal from './ShoppingListPickerModal'
import {
    applyIngredientQuantity,
    getIngredientQuantity,
} from '../utils/mealFoodItem'
import {
    DEFAULT_SERVINGS,
    scaleMealFoodItems,
} from '../utils/mealServings'
import {
    checkFoodItemsAvailability,
    mapAvailabilityFromApi,
    mergeFoodItemAvailability,
} from '../utils/foodItemAvailability'
import {
    joinRecipeSteps,
    normalizeRecipeSteps,
    resolveRecipeSteps,
} from '../utils/recipeSteps'
import MealFormBasicsSection from './MealFormBasicsSection'
import MealFormIngredientsSection from './MealFormIngredientsSection'
import { scrollMealFormToFirstError } from '../utils/mealFormScroll'

const AddMealForm = ({
    onSubmit,
    aiDraft,
    onHeaderStateChange,
    backHandlerRef,
}) => {
    const { profile } = useLogin()
    const { isDesktop } = useResponsiveDimensions()
    const [foodItems, setFoodItems] = useState(aiDraft?.foodItems || [])
    const [recipeSteps, setRecipeSteps] = useState(
        resolveRecipeSteps(aiDraft?.recipeSteps, aiDraft?.recipe)
    )

    const {
        control,
        handleSubmit: handleRHFSubmit,
        formState: { errors: fieldErrors },
        reset: resetFields,
    } = useForm({
        defaultValues: {
            name: aiDraft?.name || '',
            cookingTime: aiDraft?.cookingTime || '',
        },
    })
    const [difficultyLevel, setDifficultyLevel] = useState(
        aiDraft?.difficultyLevel || ''
    )
    const [selectedRoles, setSelectedRoles] = useState(
        aiDraft?.defaultRoles || []
    )
    const [rolesExpanded, setRolesExpanded] = useState(
        Boolean(aiDraft?.defaultRoles?.length)
    )
    const [mealCategory, setMealCategory] = useState(
        aiDraft?.mealCategory || []
    )
    const [plannedCookingDate, setPlannedCookingDate] = useState(new Date())
    const [plannedEatingDates, setPlannedEatingDates] = useState([])
    const [servings, setServings] = useState(
        aiDraft?.servings || DEFAULT_SERVINGS
    )
    const [showItemForm, setShowItemForm] = useState(false)
    const [mealImage, setMealImage] = useState(aiDraft?.image || null)
    const [formErrors, setFormErrors] = useState({})

    // Refs scroll-to-error -toimintoa varten
    const scrollViewRef = useRef(null)
    const nameErrorRef = useRef(null)
    const rolesErrorRef = useRef(null)
    const foodItemsErrorRef = useRef(null)
    const recipeErrorRef = useRef(null)

    const {
        shoppingLists,
        selectedShoppingListId,
        pendingShoppingListItem,
        showShoppingListPicker,
        isAddingToShoppingList,
        fetchShoppingLists,
        requestAddToShoppingList,
        addItemToShoppingList,
        addItemToPantry,
        closeShoppingListPicker,
    } = useMealFoodItemActions({
        foodItems,
        setFoodItems,
        setFoodItemsWithAvailability: setFoodItems,
    })

    useEffect(() => {
        if (!aiDraft) return
        resetFields({
            name: aiDraft.name || '',
            cookingTime: aiDraft.cookingTime || '',
        })
        setDifficultyLevel(aiDraft.difficultyLevel || '')
        setSelectedRoles(aiDraft.defaultRoles || [])
        setRolesExpanded(Boolean(aiDraft.defaultRoles?.length))
        setMealCategory(aiDraft.mealCategory || [])
        setServings(aiDraft.servings || DEFAULT_SERVINGS)
        const draftItems = aiDraft.foodItems || []
        setFoodItems(draftItems)
        setRecipeSteps(resolveRecipeSteps(aiDraft.recipeSteps, aiDraft.recipe))
        if (aiDraft.image) setMealImage(aiDraft.image)

        let cancelled = false
        if (draftItems.length > 0) {
            checkFoodItemsAvailability(draftItems)
                .then((withAvailability) => {
                    if (cancelled) return
                    setFoodItems((prev) =>
                        mergeFoodItemAvailability(prev, withAvailability)
                    )
                })
                .catch((error) => {
                    console.error(
                        'Error checking draft ingredient availability:',
                        error
                    )
                })
        }

        return () => {
            cancelled = true
        }
    }, [aiDraft, resetFields])

    const pickImage = async () => {
        const asset = await pickMealImage()
        if (asset) setMealImage(asset)
    }

    const validateCustomFields = () => {
        const errors = {}
        if (!selectedRoles || selectedRoles.length === 0) {
            errors.roles = 'Valitse vähintään yksi ateriatyyppi'
            setRolesExpanded(true)
        }
        if (!foodItems || foodItems.length === 0) {
            errors.foodItems = 'Lisää vähintään yksi raaka-aine'
        }
        if (!normalizeRecipeSteps(recipeSteps).length) {
            errors.recipeSteps = 'Lisää vähintään yksi valmistusohjeen vaihe'
        }
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const scrollToFirstError = (rhfErrors, customErrors) => {
        scrollMealFormToFirstError({
            rhfErrors,
            customErrors,
            refs: {
                nameErrorRef,
                recipeErrorRef,
                rolesErrorRef,
                foodItemsErrorRef,
            },
            scrollViewRef,
        })
    }

    const handleFormSubmit = async (data) => {
        if (!validateCustomFields()) {
            return
        }
        try {
            const token = await storage.getItem('userToken')

            // Guest mode: keep meal in local UI state only
            if (!token) {
                const eatingDates =
                    plannedEatingDates.length > 0
                        ? clampDatesToMin(
                              plannedEatingDates,
                              plannedCookingDate
                          )
                        : [plannedCookingDate]
                const guestMeal = {
                    _id: `guest-meal-${Date.now()}`,
                    name: data.name,
                    recipe: joinRecipeSteps(recipeSteps),
                    recipeSteps: normalizeRecipeSteps(recipeSteps),
                    difficultyLevel: getDifficultyEnum(difficultyLevel),
                    cookingTime: parseInt(data.cookingTime) || 0,
                    foodItems: foodItems.map((item) => ({
                        ...item,
                        _id:
                            item._id ||
                            `guest-food-${Date.now()}-${Math.random()
                                .toString(36)
                                .slice(2, 8)}`,
                        quantity: getIngredientQuantity(item),
                    })),
                    defaultRoles: [...selectedRoles],
                    mealCategory: parseMealCategories(mealCategory, []),
                    plannedCookingDate: toStoredMealDate(plannedCookingDate),
                    plannedEatingDates: toStoredMealDates(eatingDates),
                    servings,
                    image: mealImage
                        ? { url: mealImage.uri || mealImage }
                        : undefined,
                    user: 'guest',
                }
                onSubmit(guestMeal)
                return
            }

            const createdFoodItemIds = await resolveMealFoodItemRefs(
                foodItems,
                token
            )

            // If no eating dates specified, default to cooking date
            const eatingDates =
                plannedEatingDates.length > 0
                    ? clampDatesToMin(plannedEatingDates, plannedCookingDate)
                    : [plannedCookingDate]

            const mealData = {
                name: data.name,
                recipe: joinRecipeSteps(recipeSteps),
                recipeSteps: normalizeRecipeSteps(recipeSteps),
                difficultyLevel: getDifficultyEnum(difficultyLevel),
                cookingTime: parseInt(data.cookingTime) || 0,
                foodItems: createdFoodItemIds,
                defaultRoles: [...selectedRoles],
                mealCategory: parseMealCategories(mealCategory, []),
                plannedCookingDate: toStoredMealDate(plannedCookingDate),
                plannedEatingDates: toStoredMealDates(eatingDates),
                servings,
                user: profile._id,
            }

            const response = await axios.post(
                getServerUrl('/meals'),
                mealData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (response.data.success) {
                const createdMeal = response.data.meal

                // Upload image if one was selected
                let finalMeal = createdMeal
                if (mealImage) {
                    try {
                        const updatedMeal = await uploadMealImage(
                            createdMeal._id,
                            mealImage
                        )
                        if (updatedMeal) {
                            finalMeal = updatedMeal
                        }
                    } catch (imageError) {
                        console.error('Error uploading meal image:', imageError)
                        Alert.alert(
                            'Varoitus',
                            'Ateria luotu, mutta kuvan lähetys epäonnistui'
                        )
                    }
                }

                onSubmit(finalMeal)
            }
        } catch (error) {
            console.error('Error creating meal:', error)
            Alert.alert(
                'Virhe',
                'Aterian lisääminen epäonnistui: ' +
                    (error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message)
            )
        }
    }

    const addSelectedItemToMeal = async (selectedItem) => {
        try {
            const token = await storage.getItem('userToken')
            const itemWithQty = applyIngredientQuantity(
                selectedItem,
                getIngredientQuantity(selectedItem),
                selectedItem.unit
            )

            if (!token) {
                const newFoodItem = {
                    ...itemWithQty,
                    tempId: `${selectedItem._id || selectedItem.name}-${Date.now()}-${Math.random()}`,
                    shoppingListId: selectedShoppingListId,
                    availability: {
                        inPantry: false,
                        inShoppingList: false,
                    },
                }
                setFoodItems((prevItems) => {
                    const updated = [...prevItems, newFoodItem]
                    if (updated.length > 0) {
                        setFormErrors((e) => ({
                            ...e,
                            foodItems: undefined,
                        }))
                    }
                    return updated
                })
                return
            }

            const catalogFoodId = resolveCatalogFoodId(selectedItem)
            const availabilityResponse = await axios.post(
                getServerUrl('/food-items/check-availability'),
                {
                    name: selectedItem.name,
                    ...(isPersistedFoodItemId(catalogFoodId)
                        ? { foodId: catalogFoodId }
                        : {}),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const availability = availabilityResponse.data
            const newFoodItem = {
                ...itemWithQty,
                tempId: `${selectedItem._id || selectedItem.name}-${Date.now()}-${Math.random()}`,
                shoppingListId: selectedShoppingListId,
                availability: mapAvailabilityFromApi(availability),
            }

            setFoodItems((prevItems) => {
                const updated = [...prevItems, newFoodItem]
                if (updated.length > 0) {
                    setFormErrors((e) => ({ ...e, foodItems: undefined }))
                }
                return updated
            })
        } catch (error) {
            console.error('Error checking availability:', error)
            const itemWithQty = applyIngredientQuantity(
                selectedItem,
                getIngredientQuantity(selectedItem),
                selectedItem.unit
            )
            const newFoodItem = {
                ...itemWithQty,
                tempId: `${selectedItem._id || selectedItem.name}-${Date.now()}-${Math.random()}`,
                shoppingListId: selectedShoppingListId,
                availability: {
                    inPantry: false,
                    inShoppingList: false,
                },
            }
            setFoodItems((prevItems) => {
                const updated = [...prevItems, newFoodItem]
                setFormErrors((e) => ({ ...e, foodItems: undefined }))
                return updated
            })
        }
    }

    const handleAddNewItem = async (itemData) => {
        try {
            const token = await storage.getItem('userToken')

            // Validate required fields
            if (!itemData.name || !itemData.unit) {
                Alert.alert('Virhe', 'Nimi ja yksikkö ovat pakollisia tietoja')
                return
            }

            // Check if item exists in pantry or shopping list
            const catalogFoodId = resolveCatalogFoodId(itemData)
            const availabilityResponse = await axios.post(
                getServerUrl('/food-items/check-availability'),
                {
                    name: itemData.name,
                    ...(isPersistedFoodItemId(catalogFoodId)
                        ? { foodId: catalogFoodId }
                        : {}),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const availability = availabilityResponse.data

            const categoryArray = normalizeCategoryArray(itemData.category)

            // Use findOrCreateFoodItem to sync
            const findOrCreateResponse = await axios.post(
                getServerUrl('/food-items/find-or-create'),
                {
                    name: itemData.name,
                    category: categoryArray,
                    unit: itemData.unit,
                    price: Number(itemData.price) || 0,
                    calories: Number(itemData.calories) || 0,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (findOrCreateResponse.data.success) {
                const quantity = Number(itemData.quantity) || 1
                const newFoodItem = {
                    ...findOrCreateResponse.data.foodItem,
                    ...applyIngredientQuantity(
                        itemData,
                        quantity,
                        itemData.unit
                    ),
                    _id: findOrCreateResponse.data.foodItem._id,
                    foodId: findOrCreateResponse.data.foodItem._id,
                    tempId: `new-${findOrCreateResponse.data.foodItem._id || itemData.name}-${Date.now()}-${Math.random()}`,
                    shoppingListId: selectedShoppingListId,
                    availability: mapAvailabilityFromApi(availability),
                }

                setFoodItems((prevItems) => {
                    const updated = [...prevItems, newFoodItem]
                    if (updated.length > 0) {
                        setFormErrors((e) => ({ ...e, foodItems: undefined }))
                    }
                    return updated
                })
                setShowItemForm(false)
            }
        } catch (error) {
            console.error('Error adding new item:', error)
            Alert.alert(
                'Virhe',
                'Tuotteen lisääminen epäonnistui: ' +
                    (error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message)
            )
        }
    }

    const handleServingsChange = (nextServings) => {
        setFoodItems((prev) => scaleMealFoodItems(prev, servings, nextServings))
        setServings(nextServings)
    }

    const handleCookingDateChange = (selectedDate) => {
        setPlannedCookingDate(selectedDate)
        setPlannedEatingDates((prev) => clampDatesToMin(prev, selectedDate))
    }

    const handleUpdateQuantity = (index, newQuantity) => {
        setFoodItems((prevItems) => {
            const updatedItems = [...prevItems]
            if (updatedItems[index]) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    quantity: newQuantity,
                    quantities: {
                        meal: newQuantity,
                        'shopping-list': 0,
                        pantry: 0,
                    },
                    // Preserve availability data
                    availability: updatedItems[index].availability || {
                        inPantry: false,
                        inShoppingList: false,
                    },
                }
            }
            return updatedItems
        })
    }

    const handleRemoveFoodItem = (index) => {
        setFoodItems((prevItems) => prevItems.filter((_, i) => i !== index))
    }

    useEffect(() => {
        fetchShoppingLists()
    }, [fetchShoppingLists])

    useEffect(() => {
        onHeaderStateChange?.({
            title: showShoppingListPicker ? 'Valitse ostoslista' : null,
            isNested: Boolean(showShoppingListPicker),
        })
        return () => {
            onHeaderStateChange?.({ title: null, isNested: false })
        }
    }, [showShoppingListPicker, onHeaderStateChange])

    if (backHandlerRef) {
        backHandlerRef.current = () => {
            if (!showShoppingListPicker) return false
            closeShoppingListPicker()
            return true
        }
    }

    if (showShoppingListPicker) {
        return (
            <View style={styles.container}>
                <ShoppingListPickerModal
                    embedded
                    shoppingLists={shoppingLists}
                    selectedShoppingListId={selectedShoppingListId}
                    pendingItemName={pendingShoppingListItem?.name}
                    loading={isAddingToShoppingList}
                    onClose={closeShoppingListPicker}
                    onSelect={(listId) =>
                        addItemToShoppingList(pendingShoppingListItem, listId)
                    }
                />
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.formScroll}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={[
                        styles.formContainer,
                        isDesktop && styles.formContainerDesktop,
                    ]}
                >
                    <GuestWarningBanner message="Tietosi eivät tallennu pysyvästi ilman käyttäjätunnusta. Kirjaudu sisään tallentaaksesi tiedot." />
                    {aiDraft ? (
                        <NoticeBanner variant="info">
                            AI:n ehdotus – tarkista raaka-aineet ja määrät.
                            Ravintoarvot haetaan omasta tietokannasta tai
                            Open Food Factsista.
                        </NoticeBanner>
                    ) : null}
                    <MealFormBasicsSection
                        control={control}
                        nameErrorRef={nameErrorRef}
                        recipeErrorRef={recipeErrorRef}
                        rolesErrorRef={rolesErrorRef}
                        recipeSteps={recipeSteps}
                        setRecipeSteps={setRecipeSteps}
                        formErrors={formErrors}
                        setFormErrors={setFormErrors}
                        mealImage={mealImage}
                        onPickImage={pickImage}
                        difficultyLevel={difficultyLevel}
                        setDifficultyLevel={setDifficultyLevel}
                        servings={servings}
                        onServingsChange={handleServingsChange}
                        selectedRoles={selectedRoles}
                        setSelectedRoles={setSelectedRoles}
                        rolesExpanded={rolesExpanded}
                        setRolesExpanded={setRolesExpanded}
                        mealCategory={mealCategory}
                        setMealCategory={setMealCategory}
                        plannedCookingDate={plannedCookingDate}
                        onCookingDateChange={handleCookingDateChange}
                        plannedEatingDates={plannedEatingDates}
                        setPlannedEatingDates={setPlannedEatingDates}
                    />

                    <MealFormIngredientsSection
                        foodItems={foodItems}
                        servings={servings}
                        showItemForm={showItemForm}
                        formErrors={formErrors}
                        isDesktop={isDesktop}
                        foodItemsErrorRef={foodItemsErrorRef}
                        onSelectItem={addSelectedItemToMeal}
                        onToggleItemForm={() => setShowItemForm((v) => !v)}
                        onAddNewItem={handleAddNewItem}
                        onRemove={handleRemoveFoodItem}
                        onUpdateQuantity={handleUpdateQuantity}
                        onAddToShoppingList={requestAddToShoppingList}
                        onAddToPantry={addItemToPantry}
                    />

                    <View style={styles.buttonGroup}>
                        <Button
                            title="Tallenna ateria"
                            onPress={() => {
                                const customErrors = {}
                                if (
                                    !selectedRoles ||
                                    selectedRoles.length === 0
                                ) {
                                    customErrors.roles =
                                        'Valitse vähintään yksi ateriatyyppi'
                                    setRolesExpanded(true)
                                }
                                if (!foodItems || foodItems.length === 0) {
                                    customErrors.foodItems =
                                        'Lisää vähintään yksi raaka-aine'
                                }
                                setFormErrors(customErrors)
                                handleRHFSubmit(
                                    (data) => handleFormSubmit(data),
                                    (rhfErrors) => {
                                        // RHF-validointi epäonnistui — scrollaa ensimmäiseen virheeseen
                                        scrollToFirstError(
                                            rhfErrors,
                                            customErrors
                                        )
                                    }
                                )()
                                // Jos custom-kentissä virheitä, scrollaa niihin
                                if (Object.keys(customErrors).length > 0) {
                                    // Pieni viive jotta ref ehtii renderöityä
                                    setTimeout(
                                        () =>
                                            scrollToFirstError(
                                                null,
                                                customErrors
                                            ),
                                        50
                                    )
                                }
                            }}
                            style={[
                                styles.primaryButton,
                                isDesktop && styles.desktopPrimaryButton,
                            ]}
                            textStyle={styles.buttonText}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
        ...(Platform.OS === 'web' && {
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '::-webkit-scrollbar': { display: 'none' },
        }),
    },
    formContainer: {
        paddingVertical: 5,
        zIndex: 1,
    },
    formContainerDesktop: {
        paddingHorizontal: 50,
    },
    formScroll: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#AE9CFC',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
        marginBottom: 10,
    },
    desktopPrimaryButton: {
        maxWidth: 300,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonGroup: {
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        paddingTop: 15,
    },
})

export default AddMealForm
