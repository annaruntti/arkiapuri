import { Feather } from '@expo/vector-icons'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'
import {
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
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

    useEffect(() => {
        if (meal) {
            setEditedValues({
                ...meal,
                foodItems: [...meal.foodItems],
            })
        }
    }, [meal])

    if (!meal || !visible) {
        return null
    }

    const toggleEdit = (field) => {
        if (editableFields[field]) {
            // We're saving the edit, so keep the current edited value
            setEditedValues((prev) => ({
                ...prev,
                [field]: prev[field],
            }))
        } else {
            // We're starting to edit, so initialize with current value
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
})

export default MealItemDetail
