import axios from 'axios'
import { useEffect, useState } from 'react'
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'

import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import {
    getDifficultyText,
    getMealCategoryText,
    getMealTypeText,
} from '../utils/mealUtils'

import Button from './Button'
import CustomText from './CustomText'
import DateTimePicker from './DateTimePicker'
import EditableField from './EditableField'
import FormFoodItem from './FormFoodItem'
import MealImageUploader from './MealImageUploader'
import MealTabs from './MealTabs'
import PlannedEatingDates from './PlannedEatingDates'
import ResponsiveModal from './ResponsiveModal'

const MealItemDetail = ({ meal, visible, onClose, onUpdate }) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [editingFoodItem, setEditingFoodItem] = useState(null)
    const [showFoodItemForm, setShowFoodItemForm] = useState(false)
    const [shoppingLists, setShoppingLists] = useState([])
    const [selectedShoppingListId, setSelectedShoppingListId] = useState(null)
    const [pendingShoppingListItem, setPendingShoppingListItem] = useState(null)
    const [showShoppingListPicker, setShowShoppingListPicker] = useState(false)
    const [isAddingToShoppingList, setIsAddingToShoppingList] = useState(false)
    const [foodItemsWithAvailability, setFoodItemsWithAvailability] = useState([])

    useEffect(() => {
        if (meal) {
            setEditedValues({
                ...meal,
                foodItems: [...meal.foodItems],
            })
            checkFoodItemsAvailability(meal.foodItems)
            fetchShoppingLists()
        }
    }, [meal])

    const fetchShoppingLists = async () => {
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/shopping-lists'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success) {
                const lists = response.data.shoppingLists || []
                setShoppingLists(lists)
                if (lists.length === 1) {
                    setSelectedShoppingListId(lists[0]._id)
                } else if (
                    lists.length > 1 &&
                    selectedShoppingListId &&
                    !lists.some((list) => list._id === selectedShoppingListId)
                ) {
                    setSelectedShoppingListId(null)
                }
            }
        } catch (error) {
            console.error('Error fetching shopping lists:', error)
        }
    }

    const checkFoodItemsAvailability = async (foodItems) => {
        try {
            const token = await storage.getItem('userToken')
            const itemsWithAvailability = await Promise.all(
                foodItems.map(async (item) => {
                    try {
                        const availabilityResponse = await axios.post(
                            getServerUrl('/food-items/check-availability'),
                            { name: item.name },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        )
                        const availability = availabilityResponse.data
                        return {
                            ...item,
                            availability: {
                                inPantry: availability?.inPantry === true,
                                inShoppingList: availability?.inShoppingList === true,
                                pantryQuantity: availability?.pantryQuantity || 0,
                                shoppingListQuantity: availability?.shoppingListQuantity || 0,
                            },
                        }
                    } catch (error) {
                        console.error('Error checking availability for', item.name, error)
                        return {
                            ...item,
                            availability: {
                                inPantry: false,
                                inShoppingList: false,
                            },
                        }
                    }
                })
            )
            setFoodItemsWithAvailability(itemsWithAvailability)
        } catch (error) {
            console.error('Error checking food items availability:', error)
        }
    }

    if (!meal || !visible) {
        return null
    }

    const toggleEdit = (field) => {
        if (editableFields[field]) {
            setEditedValues((prev) => ({
                ...prev,
                [field]: prev[field],
            }))
        } else {
            setEditedValues((prev) => ({
                ...prev,
                [field]:
                    field === 'difficultyLevel'
                        ? meal.difficultyLevel || 'medium'
                        : meal[field],
            }))
        }

        setEditableFields((prev) => ({
            ...prev,
            [field]: !prev[field],
        }))
    }

    const handleChange = (field, value) => {
        setEditedValues((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleFoodItemChange = (index, field, value) => {
        setEditedValues((prev) => {
            const updatedFoodItems = [...prev.foodItems]
            updatedFoodItems[index] = {
                ...updatedFoodItems[index],
                [field]: value,
            }
            return {
                ...prev,
                foodItems: updatedFoodItems,
            }
        })
    }

    const handlePlannedEatingDatesChange = (dates) => {
        setEditedValues((prev) => ({
            ...prev,
            plannedEatingDates: dates,
        }))
    }

    const handleAddFoodItem = () => {
        setShowFoodItemForm(true)
    }

    const handleNewFoodItem = (newFoodItem) => {
        setEditedValues((prev) => ({
            ...prev,
            foodItems: [...prev.foodItems, newFoodItem],
        }))
        setShowFoodItemForm(false)
    }

    const handleRemoveFoodItem = (index) => {
        setEditedValues((prev) => ({
            ...prev,
            foodItems: prev.foodItems.filter((_, i) => i !== index),
        }))
    }

    const requestAddToShoppingList = async (item) => {
        let lists = shoppingLists
        if (!lists.length) {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/shopping-lists'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            lists = response.data.shoppingLists || []
            setShoppingLists(lists)
        }

        if (!lists.length) {
            Alert.alert(
                'Virhe',
                'Sinulla ei ole ostoslistaa. Luo ensin ostoslista.'
            )
            return
        }

        setPendingShoppingListItem(item)

        if (lists.length === 1) {
            setSelectedShoppingListId(lists[0]._id)
            await addItemToShoppingList(item, lists[0]._id)
            return
        }

        setShowShoppingListPicker(true)
    }

    const addItemToShoppingList = async (item, listId) => {
        const listIdToUse = listId || selectedShoppingListId
        if (!item || !listIdToUse) {
            Alert.alert('Virhe', 'Valitse ostoslista')
            return
        }

        setIsAddingToShoppingList(true)
        try {
            const token = await storage.getItem('userToken')
            const quantity =
                parseFloat(item.quantities?.meal) ||
                parseFloat(item.quantity) ||
                1
            const categoryArray = Array.isArray(item.category)
                ? item.category
                : []
            const foodItemId = item._id || item.foodId?._id || item.foodId

            let foodItem = item

            if (foodItemId) {
                const quantityResponse = await axios.put(
                    getServerUrl(`/food-items/${foodItemId}/quantity`),
                    {
                        location: 'shopping-list',
                        quantity,
                        action: 'add',
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!quantityResponse.data?.success) {
                    throw new Error(
                        quantityResponse.data?.message ||
                            'Food item quantity update failed'
                    )
                }

                foodItem = quantityResponse.data.foodItem
            } else {
                const findOrCreateResponse = await axios.post(
                    getServerUrl('/food-items/find-or-create'),
                    {
                        name: item.name,
                        unit: item.unit || 'kpl',
                        category: categoryArray,
                        calories: parseInt(item.calories) || 0,
                        price: parseFloat(item.price) || 0,
                        location: 'shopping-list',
                        quantities: {
                            'shopping-list': quantity,
                        },
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (!findOrCreateResponse.data?.success) {
                    throw new Error(
                        findOrCreateResponse.data?.message ||
                            'Food item sync failed'
                    )
                }

                foodItem = findOrCreateResponse.data.foodItem
            }

            const shoppingListResponse = await axios.post(
                getServerUrl(`/shopping-lists/${listIdToUse}/items`),
                {
                    items: [
                        {
                            foodId: foodItem._id,
                            name: item.name,
                            estimatedPrice: parseFloat(item.price) || 0,
                            quantity,
                            unit: item.unit || 'kpl',
                            category: categoryArray,
                            calories: parseInt(item.calories) || 0,
                            price: parseFloat(item.price) || 0,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!shoppingListResponse.data?.success) {
                throw new Error(
                    shoppingListResponse.data?.message ||
                        'Shopping list update failed'
                )
            }

            setSelectedShoppingListId(listIdToUse)
            setShowShoppingListPicker(false)
            setPendingShoppingListItem(null)

            const nextFoodItems = editedValues.foodItems.map((foodItemEntry) => {
                const entryId =
                    foodItemEntry._id ||
                    foodItemEntry.foodId?._id ||
                    foodItemEntry.foodId
                if (
                    entryId &&
                    foodItem._id &&
                    String(entryId) === String(foodItem._id)
                ) {
                    return {
                        ...foodItemEntry,
                        ...foodItem,
                        quantities: foodItem.quantities,
                        locations: foodItem.locations,
                    }
                }
                if (foodItemEntry.name === item.name) {
                    return {
                        ...foodItemEntry,
                        quantities: foodItem.quantities,
                        locations: foodItem.locations,
                    }
                }
                return foodItemEntry
            })

            setEditedValues((prev) => ({
                ...prev,
                foodItems: nextFoodItems,
            }))

            await checkFoodItemsAvailability(nextFoodItems)

            const selectedList = shoppingLists.find(
                (list) => list._id === listIdToUse
            )
            Alert.alert(
                'Onnistui',
                selectedList
                    ? `Tuote lisätty listalle "${selectedList.name}"`
                    : 'Tuote lisätty ostoslistaan'
            )
        } catch (error) {
            console.error('Error adding to shopping list:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Tuotteen lisääminen ostoslistaan epäonnistui'
            )
        } finally {
            setIsAddingToShoppingList(false)
        }
    }

    const addItemToPantry = async (item) => {
        try {
            const token = await storage.getItem('userToken')
            const quantity =
                parseFloat(item.quantities?.meal) ||
                parseFloat(item.quantity) ||
                1
            const categoryArray = Array.isArray(item.category)
                ? item.category
                : []
            const foodItemId = item._id || item.foodId?._id || item.foodId

            const pantryResponse = await axios.post(
                getServerUrl('/pantry/items'),
                {
                    name: item.name,
                    category: categoryArray,
                    quantity,
                    unit: item.unit || 'kpl',
                    price: parseFloat(item.price) || 0,
                    calories: parseInt(item.calories) || 0,
                    foodId: foodItemId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!pantryResponse.data?.success) {
                throw new Error(
                    pantryResponse.data?.message ||
                        pantryResponse.data?.error ||
                        'Pantry update failed'
                )
            }

            const foodItem = pantryResponse.data.foodItem

            const nextFoodItems = editedValues.foodItems.map((foodItemEntry) => {
                const entryId =
                    foodItemEntry._id ||
                    foodItemEntry.foodId?._id ||
                    foodItemEntry.foodId
                if (
                    entryId &&
                    foodItem?._id &&
                    String(entryId) === String(foodItem._id)
                ) {
                    return {
                        ...foodItemEntry,
                        ...foodItem,
                        quantities: foodItem.quantities,
                        locations: foodItem.locations,
                    }
                }
                if (foodItemEntry.name === item.name) {
                    return {
                        ...foodItemEntry,
                        quantities: foodItem?.quantities || foodItemEntry.quantities,
                        locations: foodItem?.locations || foodItemEntry.locations,
                    }
                }
                return foodItemEntry
            })

            setEditedValues((prev) => ({
                ...prev,
                foodItems: nextFoodItems,
            }))

            await checkFoodItemsAvailability(nextFoodItems)
            Alert.alert('Onnistui', 'Tuote lisätty ruokavarastoon')
        } catch (error) {
            console.error('Error adding to pantry:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Tuotteen lisääminen ruokavarastoon epäonnistui'
            )
        }
    }

    const handleImageUpdate = (updatedMeal) => {
        onUpdate(meal._id, updatedMeal)
    }

    const handleSave = async () => {
        try {
            // Ensure all food items have required fields
            const updatedFoodItems = editedValues.foodItems.map((item) => ({
                ...item,
                quantities: item.quantities || {
                    meal: 0,
                    'shopping-list': 0,
                    pantry: 0,
                },
                locations: item.locations || [],
                category: item.category || [],
                price: item.price || 0,
                calories: item.calories || 0,
                location: item.location || 'meal',
            }))

            // Convert the edited values to the format expected by the backend
            const updatedMeal = {
                ...editedValues,
                foodItems: updatedFoodItems,
                cookingTime: parseInt(editedValues.cookingTime) || 0,
                difficultyLevel:
                    editedValues.difficultyLevel || meal.difficultyLevel,
                defaultRoles: editedValues.defaultRoles
                    ? Array.isArray(editedValues.defaultRoles)
                        ? editedValues.defaultRoles
                        : [editedValues.defaultRoles]
                    : meal.defaultRoles,
                _id: undefined,
                id: undefined,
                __v: undefined,
            }

            await onUpdate(meal._id, updatedMeal)
            setEditableFields({})
            setEditingFoodItem(null)
        } catch (error) {
            console.error('Error saving updates:', error)
        }
    }

    return (
        <>
            <ResponsiveModal
                visible={visible}
                onClose={onClose}
                title={showFoodItemForm ? 'Lisää uusi raaka-aine' : meal.name}
                maxWidth={700}
            >
                {showFoodItemForm ? (
                    <FormFoodItem
                        onSubmit={handleNewFoodItem}
                        onClose={() => setShowFoodItemForm(false)}
                        location="meal"
                    />
                ) : (
                    <ScrollView style={styles.detailScroll}>
                        <View style={styles.mealDetails}>
                            <MealImageUploader
                                meal={meal}
                                onImageUpdate={handleImageUpdate}
                            />

                            <EditableField
                                field="name"
                                label="Nimi"
                                value={meal.name}
                                isEditing={editableFields.name}
                                editedValue={editedValues.name}
                                onToggleEdit={() => toggleEdit('name')}
                                onChange={(text) => handleChange('name', text)}
                            />

                            <EditableField
                                field="difficultyLevel"
                                label="Vaikeustaso"
                                value={getDifficultyText(
                                    editedValues.difficultyLevel ||
                                        meal.difficultyLevel
                                )}
                                isEditing={editableFields.difficultyLevel}
                                editedValue={
                                    editedValues.difficultyLevel ||
                                    meal.difficultyLevel
                                }
                                onToggleEdit={() =>
                                    toggleEdit('difficultyLevel')
                                }
                                onChange={(value) =>
                                    handleChange('difficultyLevel', value)
                                }
                            />

                            <EditableField
                                field="cookingTime"
                                label="Valmistusaika"
                                value={`${editedValues.cookingTime || meal.cookingTime} min`}
                                isEditing={editableFields.cookingTime}
                                editedValue={
                                    editedValues.cookingTime || meal.cookingTime
                                }
                                onToggleEdit={() => toggleEdit('cookingTime')}
                                onChange={(text) =>
                                    handleChange('cookingTime', text)
                                }
                                type="number"
                            />

                            <EditableField
                                field="defaultRoles"
                                label="Aterian tyyppi"
                                value={getMealTypeText(
                                    editedValues.defaultRoles ||
                                        meal.defaultRoles
                                )}
                                isEditing={editableFields.defaultRoles}
                                editedValue={
                                    editedValues.defaultRoles ||
                                    meal.defaultRoles
                                }
                                onToggleEdit={() => toggleEdit('defaultRoles')}
                                onChange={(value) =>
                                    handleChange('defaultRoles', value)
                                }
                            />

                            <EditableField
                                field="mealCategory"
                                label="Ruokalaji"
                                value={getMealCategoryText(
                                    editedValues.mealCategory ||
                                        meal.mealCategory
                                )}
                                isEditing={editableFields.mealCategory}
                                editedValue={
                                    editedValues.mealCategory ||
                                    meal.mealCategory ||
                                    'other'
                                }
                                onToggleEdit={() => toggleEdit('mealCategory')}
                                onChange={(value) =>
                                    handleChange('mealCategory', value)
                                }
                            />

                            <View style={styles.detailRow}>
                                <CustomText style={styles.detailLabel}>
                                    Suunniteltu valmistuspäivä
                                </CustomText>
                                {Platform.OS === 'web' ? (
                                    <DateTimePicker
                                        value={
                                            new Date(
                                                editedValues.plannedCookingDate ||
                                                    meal.plannedCookingDate
                                            )
                                        }
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            if (selectedDate) {
                                                handleChange(
                                                    'plannedCookingDate',
                                                    selectedDate
                                                )
                                            }
                                        }}
                                    />
                                ) : (
                                    <View style={styles.valueContainer}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowDatePicker(true)
                                            }
                                        >
                                            <CustomText>
                                                {format(
                                                    new Date(
                                                        editedValues.plannedCookingDate ||
                                                            meal.plannedCookingDate
                                                    ),
                                                    'dd.MM.yyyy',
                                                    { locale: fi }
                                                )}
                                            </CustomText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.editIcon}
                                            onPress={() =>
                                                setShowDatePicker(true)
                                            }
                                        >
                                            <Feather
                                                name="calendar"
                                                size={18}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {Platform.OS !== 'web' && showDatePicker && (
                                <DateTimePicker
                                    value={
                                        new Date(
                                            editedValues.plannedCookingDate ||
                                                meal.plannedCookingDate
                                        )
                                    }
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false)
                                        if (selectedDate) {
                                            handleChange(
                                                'plannedCookingDate',
                                                selectedDate
                                            )
                                        }
                                    }}
                                />
                            )}

                            <PlannedEatingDates
                                dates={editedValues.plannedEatingDates || []}
                                onChange={handlePlannedEatingDatesChange}
                            />

                            <MealTabs
                                foodItems={editedValues.foodItems}
                                foodItemsWithAvailability={foodItemsWithAvailability}
                                recipe={editedValues.recipe}
                                isRecipeEditing={editableFields.recipe}
                                editingFoodItem={editingFoodItem}
                                onAddFoodItem={handleAddFoodItem}
                                onEditFoodItem={setEditingFoodItem}
                                onRemoveFoodItem={handleRemoveFoodItem}
                                onItemChange={handleFoodItemChange}
                                onRecipeChange={(text) =>
                                    handleChange('recipe', text)
                                }
                                onToggleRecipeEdit={() => toggleEdit('recipe')}
                                onAddToShoppingList={requestAddToShoppingList}
                                onAddToPantry={addItemToPantry}
                            />

                            <View style={styles.buttonContainer}>
                                <Button
                                    title="Tallenna muutokset"
                                    onPress={handleSave}
                                    style={styles.saveButton}
                                />
                            </View>
                        </View>
                    </ScrollView>
                )}
            </ResponsiveModal>

            <ResponsiveModal
                visible={showShoppingListPicker}
                onClose={() => {
                    if (isAddingToShoppingList) return
                    setShowShoppingListPicker(false)
                    setPendingShoppingListItem(null)
                }}
                title="Valitse ostoslista"
                maxWidth={420}
            >
                <View style={styles.shoppingListPickerContent}>
                    <CustomText style={styles.shoppingListPickerHint}>
                        {pendingShoppingListItem
                            ? `Mille listalle lisätään "${pendingShoppingListItem.name}"?`
                            : 'Valitse ostoslista'}
                    </CustomText>
                    {shoppingLists.map((list) => (
                        <TouchableOpacity
                            key={list._id}
                            style={[
                                styles.shoppingListOption,
                                selectedShoppingListId === list._id &&
                                    styles.shoppingListOptionSelected,
                            ]}
                            disabled={isAddingToShoppingList}
                            onPress={() => {
                                setSelectedShoppingListId(list._id)
                                addItemToShoppingList(
                                    pendingShoppingListItem,
                                    list._id
                                )
                            }}
                        >
                            <CustomText style={styles.shoppingListOptionText}>
                                {list.name}
                            </CustomText>
                            <CustomText style={styles.shoppingListOptionMeta}>
                                {list.items?.length || 0} tuotetta
                            </CustomText>
                        </TouchableOpacity>
                    ))}
                </View>
            </ResponsiveModal>
        </>
    )
}

const styles = StyleSheet.create({
    detailScroll: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    mealDetails: {
        paddingTop: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    detailLabel: {
        fontWeight: 'bold',
        flex: 1,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
        justifyContent: 'flex-end',
    },
    editIcon: {
        padding: 5,
        marginLeft: 10,
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#9C86FC',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        minWidth: 200,
    },
    shoppingListPickerContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 10,
    },
    shoppingListPickerHint: {
        fontSize: 15,
        color: '#374151',
        marginBottom: 8,
    },
    shoppingListOption: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
    },
    shoppingListOptionSelected: {
        borderColor: '#5844BB',
        backgroundColor: '#F3F0FF',
    },
    shoppingListOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    shoppingListOptionMeta: {
        marginTop: 4,
        fontSize: 13,
        color: '#6B7280',
    },
})

export default MealItemDetail
