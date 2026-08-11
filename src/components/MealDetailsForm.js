import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useShowNutrition } from '../hooks/useShowNutrition'
import {
    formatNutritionValue,
    summarizeMealNutrition,
} from '../utils/mealNutrition'
import {
    getDifficultyText,
    getMealCategoryText,
    getMealTypeText,
} from '../utils/mealUtils'
import Button from './Button'
import CustomText from './CustomText'
import EditableField from './EditableField'
import FormDateField from './FormDateField'
import MealImageUploader from './MealImageUploader'
import MealTabs from './MealTabs'
import PlannedEatingDates from './PlannedEatingDates'

const MealDetailsForm = ({
    meal,
    editedValues,
    editableFields,
    editingFoodItem,
    foodItemsWithAvailability,
    onToggleEdit,
    onChange,
    onFoodItemChange,
    onPlannedEatingDatesChange,
    onAddFoodItem,
    onEditFoodItem,
    onRemoveFoodItem,
    onToggleRecipeEdit,
    onAddToShoppingList,
    onAddToPantry,
    onImageUpdate,
    onSave,
}) => {
    const showNutrition = useShowNutrition()
    const cookingDate = new Date(
        editedValues.plannedCookingDate || meal.plannedCookingDate
    )
    const nutritionTotals = useMemo(
        () => summarizeMealNutrition(editedValues.foodItems || []),
        [editedValues.foodItems]
    )
    const nutritionRows = [
        {
            label: 'Kalorit',
            value: formatNutritionValue(nutritionTotals.calories),
            unit: 'kcal',
        },
        {
            label: 'Proteiini',
            value: formatNutritionValue(nutritionTotals.proteins, 1),
            unit: 'g',
        },
        {
            label: 'Hiilihydraatit',
            value: formatNutritionValue(nutritionTotals.carbohydrates, 1),
            unit: 'g',
        },
        {
            label: 'Rasva',
            value: formatNutritionValue(nutritionTotals.fat, 1),
            unit: 'g',
        },
    ].filter((row) => row.value)

    return (
        <View style={styles.mealDetails}>
            <MealImageUploader meal={meal} onImageUpdate={onImageUpdate} />

            <EditableField
                field="name"
                label="Nimi"
                value={meal.name}
                isEditing={editableFields.name}
                editedValue={editedValues.name}
                onToggleEdit={() => onToggleEdit('name')}
                onChange={(text) => onChange('name', text)}
            />

            <EditableField
                field="difficultyLevel"
                label="Vaikeustaso"
                value={getDifficultyText(
                    editedValues.difficultyLevel || meal.difficultyLevel
                )}
                isEditing={editableFields.difficultyLevel}
                editedValue={
                    editedValues.difficultyLevel || meal.difficultyLevel
                }
                onToggleEdit={() => onToggleEdit('difficultyLevel')}
                onChange={(value) => onChange('difficultyLevel', value)}
            />

            <EditableField
                field="cookingTime"
                label="Valmistusaika"
                value={`${editedValues.cookingTime || meal.cookingTime} min`}
                isEditing={editableFields.cookingTime}
                editedValue={editedValues.cookingTime || meal.cookingTime}
                onToggleEdit={() => onToggleEdit('cookingTime')}
                onChange={(text) => onChange('cookingTime', text)}
                type="number"
            />

            <EditableField
                field="defaultRoles"
                label="Aterian tyyppi"
                value={getMealTypeText(
                    editedValues.defaultRoles || meal.defaultRoles
                )}
                isEditing={editableFields.defaultRoles}
                editedValue={editedValues.defaultRoles || meal.defaultRoles}
                onToggleEdit={() => onToggleEdit('defaultRoles')}
                onChange={(value) => onChange('defaultRoles', value)}
            />

            <EditableField
                field="mealCategory"
                label="Ruokalaji"
                value={getMealCategoryText(
                    editedValues.mealCategory || meal.mealCategory
                )}
                isEditing={editableFields.mealCategory}
                editedValue={
                    editedValues.mealCategory || meal.mealCategory || 'other'
                }
                onToggleEdit={() => onToggleEdit('mealCategory')}
                onChange={(value) => onChange('mealCategory', value)}
            />

            <FormDateField
                label="Suunniteltu valmistuspäivä"
                value={cookingDate}
                onChange={(selectedDate) =>
                    onChange('plannedCookingDate', selectedDate)
                }
                testID="plannedCookingDate"
                style={styles.cookingDateField}
            />

            <PlannedEatingDates
                dates={editedValues.plannedEatingDates || []}
                onChange={onPlannedEatingDatesChange}
            />

            {showNutrition && nutritionRows.length > 0 && (
                <View style={styles.nutritionSummary}>
                    <CustomText style={styles.nutritionTitle}>
                        Ravintoarvot (arvio)
                    </CustomText>
                    {nutritionRows.map((row) => (
                        <View key={row.label} style={styles.nutritionRow}>
                            <CustomText style={styles.nutritionLabel}>
                                {row.label}
                            </CustomText>
                            <CustomText style={styles.nutritionValue}>
                                {row.value} {row.unit}
                            </CustomText>
                        </View>
                    ))}
                </View>
            )}

            <MealTabs
                foodItems={editedValues.foodItems}
                foodItemsWithAvailability={foodItemsWithAvailability}
                recipe={editedValues.recipe}
                isRecipeEditing={editableFields.recipe}
                editingFoodItem={editingFoodItem}
                onAddFoodItem={onAddFoodItem}
                onEditFoodItem={onEditFoodItem}
                onRemoveFoodItem={onRemoveFoodItem}
                onItemChange={onFoodItemChange}
                onRecipeChange={(text) => onChange('recipe', text)}
                onToggleRecipeEdit={onToggleRecipeEdit}
                onAddToShoppingList={onAddToShoppingList}
                onAddToPantry={onAddToPantry}
            />

            <View style={styles.buttonContainer}>
                <Button
                    title="Tallenna muutokset"
                    onPress={onSave}
                    style={styles.saveButton}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mealDetails: {
        paddingTop: 10,
    },
    nutritionSummary: {
        marginTop: 12,
        marginBottom: 8,
        padding: 12,
        backgroundColor: '#f8f7fc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ebe7f8',
    },
    nutritionTitle: {
        fontWeight: '600',
        fontSize: 15,
        color: '#1f2937',
        marginBottom: 8,
    },
    nutritionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    nutritionLabel: {
        color: '#4b5563',
        fontSize: 14,
    },
    nutritionValue: {
        color: '#1f2937',
        fontSize: 14,
        fontWeight: '500',
    },
    cookingDateField: {
        paddingTop: 8,
        paddingBottom: 8,
        marginBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#AE9CFC',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        minWidth: 200,
    },
})

export default MealDetailsForm
