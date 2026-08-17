import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import useMealFoodItemActions from '../hooks/useMealFoodItemActions'
import { clampDatesToMin } from '../utils/mealDates'
import {
    normalizeMealFoodItem,
    prepareMealFoodItemsForSave,
} from '../utils/mealFoodItem'
import {
    normalizeServings,
    scaleMealFoodItems,
} from '../utils/mealServings'
import { parseMealRoles } from '../utils/mealUtils'
import AddFoodItemPanel from './AddFoodItemPanel'
import MealDetailsForm from './MealDetailsForm'
import ResponsiveModal from './ResponsiveModal'
import ShoppingListPickerModal from './ShoppingListPickerModal'

const MealItemDetail = ({ meal, visible, onClose, onUpdate }) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [editingFoodItem, setEditingFoodItem] = useState(null)
    const [showFoodItemForm, setShowFoodItemForm] = useState(false)
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

    if (!meal || !visible) {
        return null
    }

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

            await onUpdate(meal._id, updatedMeal)
            setEditableFields({})
            setEditingFoodItem(null)
        } catch (error) {
            console.error('Error saving updates:', error)
        }
    }

    return (
        <ResponsiveModal
            visible={visible}
            onClose={() => {
                if (showShoppingListPicker) {
                    closeShoppingListPicker()
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
                    : showFoodItemForm
                      ? 'Lisää raaka-aine'
                      : meal.name
            }
            showBackButton={showFoodItemForm || showShoppingListPicker}
            maxWidth={640}
        >
            {showShoppingListPicker ? (
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
                <ScrollView style={styles.detailScroll}>
                    <MealDetailsForm
                        meal={meal}
                        editedValues={editedValues}
                        editableFields={editableFields}
                        editingFoodItem={editingFoodItem}
                        foodItemsWithAvailability={foodItemsWithAvailability}
                        onToggleEdit={toggleEdit}
                        onChange={handleChange}
                        onFoodItemChange={handleFoodItemChange}
                        onPlannedEatingDatesChange={(dates) =>
                            handleChange('plannedEatingDates', dates)
                        }
                        onAddFoodItem={() => setShowFoodItemForm(true)}
                        onEditFoodItem={setEditingFoodItem}
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
        paddingHorizontal: 20,
    },
})

export default MealItemDetail
