import axios from 'axios'
import { useEffect, useState } from 'react'
import { Alert, Platform, ScrollView, StyleSheet } from 'react-native'
import useMealFoodItemActions from '../hooks/useMealFoodItemActions'
import { getServerUrl } from '../utils/getServerUrl'
import { clampDatesToMin } from '../utils/mealDates'
import {
    mergeUpdatedFoodItem,
    normalizeMealFoodItem,
    prepareMealFoodItemsForSave,
} from '../utils/mealFoodItem'
import {
    normalizeServings,
    scaleMealFoodItems,
} from '../utils/mealServings'
import { parseMealCategories, parseMealRoles } from '../utils/mealUtils'
import storage from '../utils/storage'
import { getFoodItemImageUrl } from '../utils/openFoodFactsMapper'
import AddFoodItemPanel from './AddFoodItemPanel'
import MealDetailsForm from './MealDetailsForm'
import PantryItemDetails from './PantryItemDetails'
import ResponsiveModal from './ResponsiveModal'
import ShoppingListPickerModal from './ShoppingListPickerModal'

const isPersistedFoodItemId = (id) =>
    typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)

const resolveCatalogId = (item) => {
    if (!item) return ''
    if (item.foodId && typeof item.foodId === 'object') {
        return String(item.foodId._id || '')
    }
    if (item.foodId) return String(item.foodId)
    if (item._id && typeof item._id === 'object') {
        return String(item._id._id || item._id)
    }
    return item._id ? String(item._id) : ''
}

const toFoodItemDetails = (item) => {
    const catalogId = resolveCatalogId(item)
    const catalog =
        item.foodId && typeof item.foodId === 'object' ? item.foodId : null
    const merged = {
        ...(catalog && typeof catalog === 'object' ? catalog : {}),
        ...item,
    }
    const imageUrl = getFoodItemImageUrl(merged)

    return {
        ...merged,
        name: item.name || catalog?.name,
        category: Array.isArray(item.category)
            ? item.category
            : catalog?.category || [],
        image: merged.image?.url
            ? merged.image
            : imageUrl
              ? { url: imageUrl }
              : merged.image,
        calories:
            item.calories ??
            catalog?.calories ??
            merged.nutrition?.calories ??
            merged.openFoodFactsData?.nutrition?.calories,
        nutrition: item.nutrition || catalog?.nutrition || merged.nutrition,
        openFoodFactsData:
            item.openFoodFactsData || catalog?.openFoodFactsData,
        _id: catalogId || item._id,
        foodId: catalogId ? { _id: catalogId } : item.foodId,
    }
}

const MealItemDetail = ({ meal, visible, onClose, onUpdate }) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [showFoodItemForm, setShowFoodItemForm] = useState(false)
    const [selectedFoodItem, setSelectedFoodItem] = useState(null)
    const [foodItemsWithAvailability, setFoodItemsWithAvailability] = useState(
        []
    )

    const setFoodItems = (nextFoodItems) => {
        setEditedValues((prev) => ({
            ...prev,
            foodItems: nextFoodItems,
        }))
    }

    const {
        shoppingLists,
        selectedShoppingListId,
        pendingShoppingListItem,
        showShoppingListPicker,
        isAddingToShoppingList,
        fetchShoppingLists,
        refreshAvailability,
        requestAddToShoppingList,
        addItemToShoppingList,
        addItemToPantry,
        closeShoppingListPicker,
    } = useMealFoodItemActions({
        foodItems: editedValues.foodItems || [],
        setFoodItems,
        setFoodItemsWithAvailability,
    })

    useEffect(() => {
        if (!meal) return

        const foodItems = [...(meal.foodItems || [])]
        setEditedValues({
            ...meal,
            servings: normalizeServings(meal.servings),
            foodItems,
        })
        refreshAvailability(foodItems)
        fetchShoppingLists()
    }, [meal])

    const toggleEdit = (field) => {
        setEditableFields((prev) => {
            const isEditing = !prev[field]
            if (isEditing) {
                setEditedValues((values) => ({
                    ...values,
                    [field]:
                        field === 'difficultyLevel'
                            ? meal.difficultyLevel || 'medium'
                            : meal[field],
                }))
            }
            return {
                ...prev,
                [field]: isEditing,
            }
        })
    }

    const handleChange = (field, value) => {
        setEditedValues((prev) => {
            if (field === 'plannedCookingDate') {
                return {
                    ...prev,
                    plannedCookingDate: value,
                    plannedEatingDates: clampDatesToMin(
                        prev.plannedEatingDates || [],
                        value
                    ),
                }
            }
            return {
                ...prev,
                [field]: value,
            }
        })
    }

    const handleServingsChange = (nextServings) => {
        setEditedValues((prev) => {
            const from = normalizeServings(prev.servings)
            const to = normalizeServings(nextServings)
            return {
                ...prev,
                servings: to,
                foodItems: scaleMealFoodItems(prev.foodItems || [], from, to),
            }
        })
    }

    const handleFoodItemChange = (index, field, value) => {
        setEditedValues((prev) => {
            const updatedFoodItems = [...prev.foodItems]
            const current = updatedFoodItems[index]
            const nextItem = {
                ...current,
                [field]: value,
            }
            if (field === 'quantity') {
                nextItem.quantities = {
                    ...(current.quantities || {}),
                    meal: value,
                }
            }
            updatedFoodItems[index] = nextItem
            return {
                ...prev,
                foodItems: updatedFoodItems,
            }
        })
    }

    const addFoodItemToMeal = (item) => {
        const normalized = normalizeMealFoodItem(item)
        const nextFoodItems = [...(editedValues.foodItems || []), normalized]
        setFoodItems(nextFoodItems)
        setShowFoodItemForm(false)
        refreshAvailability(nextFoodItems)
    }

    const handleRemoveFoodItem = (index) => {
        setEditedValues((prev) => ({
            ...prev,
            foodItems: prev.foodItems.filter((_, i) => i !== index),
        }))
    }

    const handleOpenFoodItem = (item) => {
        setSelectedFoodItem(toFoodItemDetails(item))
    }

    const handleUpdateFoodItem = async (itemId, updatedData) => {
        const catalogId = resolveCatalogId({
            ...updatedData,
            _id: itemId,
            foodId: updatedData.foodId || itemId,
        })
        const token = await storage.getItem('userToken')
        const isImageUpload =
            updatedData.foodId &&
            typeof updatedData.foodId === 'object' &&
            Object.keys(updatedData.foodId).length > 1

        if (token && isPersistedFoodItemId(catalogId) && !isImageUpload) {
            try {
                await axios.put(
                    getServerUrl(`/food-items/${catalogId}`),
                    {
                        name: updatedData.name,
                        isFood: updatedData.isFood !== false,
                        category: updatedData.category || [],
                        price: parseFloat(updatedData.price) || 0,
                        ...(updatedData.calories != null
                            ? {
                                  calories:
                                      parseInt(updatedData.calories, 10) || 0,
                              }
                            : {}),
                        ...(updatedData.nutrition
                            ? { nutrition: updatedData.nutrition }
                            : {}),
                        ...(updatedData.openFoodFactsData
                            ? {
                                  openFoodFactsData:
                                      updatedData.openFoodFactsData,
                              }
                            : {}),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
            } catch (error) {
                if (error.response?.status !== 404) {
                    console.error('Error updating food item:', error)
                    Alert.alert('Virhe', 'Raaka-aineen päivitys epäonnistui')
                    return
                }
            }
        }

        const nextItem = {
            ...updatedData,
            _id: catalogId || itemId,
            image:
                updatedData.image !== undefined
                    ? updatedData.image
                    : updatedData.foodId?.image,
        }
        const nextFoodItems = mergeUpdatedFoodItem(
            editedValues.foodItems || [],
            selectedFoodItem,
            nextItem
        )
        setFoodItems(nextFoodItems)

        if (isImageUpload) {
            setSelectedFoodItem(
                toFoodItemDetails({
                    ...(selectedFoodItem || {}),
                    ...nextItem,
                })
            )
            return
        }

        setSelectedFoodItem(null)
    }

    const handleSave = async () => {
        try {
            const updatedMeal = {
                ...editedValues,
                foodItems: prepareMealFoodItemsForSave(editedValues.foodItems),
                cookingTime: parseInt(editedValues.cookingTime, 10) || 0,
                difficultyLevel:
                    editedValues.difficultyLevel || meal.difficultyLevel,
                defaultRoles: parseMealRoles(
                    editedValues.defaultRoles || meal.defaultRoles,
                    ['dinner']
                ),
                mealCategory: parseMealCategories(
                    editedValues.mealCategory ?? meal.mealCategory,
                    []
                ),
                servings: normalizeServings(editedValues.servings),
                plannedEatingDates: editedValues.plannedCookingDate
                    ? clampDatesToMin(
                          editedValues.plannedEatingDates || [],
                          editedValues.plannedCookingDate
                      )
                    : editedValues.plannedEatingDates || [],
                _id: undefined,
                id: undefined,
                __v: undefined,
            }

            const didSave = await onUpdate?.(meal._id, updatedMeal)
            if (didSave === false) return

            setEditableFields({})
            setSelectedFoodItem(null)
            onClose()
        } catch (error) {
            console.error('Error saving updates:', error)
        }
    }

    return (
        <ResponsiveModal
            visible={Boolean(visible && meal)}
            onClose={() => {
                if (showShoppingListPicker) {
                    closeShoppingListPicker()
                    return
                }
                if (selectedFoodItem) {
                    setSelectedFoodItem(null)
                    return
                }
                if (showFoodItemForm) {
                    setShowFoodItemForm(false)
                    return
                }
                onClose()
            }}
            title={
                showShoppingListPicker
                    ? 'Valitse ostoslista'
                    : selectedFoodItem
                      ? selectedFoodItem.name || 'Raaka-aine'
                      : showFoodItemForm
                        ? 'Lisää raaka-aine'
                        : meal?.name
            }
            showBackButton={
                showFoodItemForm ||
                showShoppingListPicker ||
                Boolean(selectedFoodItem)
            }
            maxWidth={640}
        >
            {!meal ? null : showShoppingListPicker ? (
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
            ) : selectedFoodItem ? (
                <PantryItemDetails
                    item={selectedFoodItem}
                    embedded
                    showInventoryFields={false}
                    onClose={() => setSelectedFoodItem(null)}
                    onUpdate={handleUpdateFoodItem}
                />
            ) : showFoodItemForm ? (
                <AddFoodItemPanel
                    location="meal"
                    mealId={meal._id}
                    allowDuplicates={true}
                    onSelectItem={addFoodItemToMeal}
                    onSubmitNewItem={addFoodItemToMeal}
                    onCloseForm={() => setShowFoodItemForm(false)}
                    showFormBackButton={false}
                    servings={normalizeServings(editedValues.servings)}
                />
            ) : (
                <ScrollView
                    style={styles.detailScroll}
                    showsVerticalScrollIndicator={false}
                >
                    <MealDetailsForm
                        meal={meal}
                        editedValues={editedValues}
                        editableFields={editableFields}
                        foodItemsWithAvailability={foodItemsWithAvailability}
                        onToggleEdit={toggleEdit}
                        onChange={handleChange}
                        onFoodItemChange={handleFoodItemChange}
                        onPlannedEatingDatesChange={(dates) =>
                            handleChange('plannedEatingDates', dates)
                        }
                        onAddFoodItem={() => setShowFoodItemForm(true)}
                        onOpenFoodItem={handleOpenFoodItem}
                        onRemoveFoodItem={handleRemoveFoodItem}
                        onToggleRecipeEdit={() => toggleEdit('recipe')}
                        onAddToShoppingList={requestAddToShoppingList}
                        onAddToPantry={addItemToPantry}
                        onImageUpdate={(updatedMeal) =>
                            onUpdate(meal._id, updatedMeal)
                        }
                        onServingsChange={handleServingsChange}
                        onSave={handleSave}
                    />
                </ScrollView>
            )}
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    detailScroll: {
        paddingTop: 20,
        ...(Platform.OS === 'web' && {
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '::-webkit-scrollbar': { display: 'none' },
        }),
    },
})

export default MealItemDetail
