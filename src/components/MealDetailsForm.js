import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useShowNutrition } from '../hooks/useShowNutrition'
import {
    formatNutritionValue,
    summarizeMealNutritionPerServing,
} from '../utils/mealNutrition'
import { OVERDUE_COOKING_MESSAGE } from '../utils/mealDates'
import { normalizeServings } from '../utils/mealServings'
import {
    getDifficultyText,
    getMealCategoryText,
    getMealTypeText,
    parseMealCategories,
} from '../utils/mealUtils'
import Button from './Button'
import CollapsibleFormSection from './CollapsibleFormSection'
import CustomText from './CustomText'
import EditableField from './EditableField'
import FormDateField from './FormDateField'
import MealCategorySelector from './MealCategorySelector'
import MealRoleSelector from './MealRoleSelector'
import MealImageUploader from './MealImageUploader'
import MealIngredientQuantityEditor from './MealIngredientQuantityEditor'
import MealServingsStepper from './MealServingsStepper'
import MealTabs from './MealTabs'
import PlannedEatingDates from './PlannedEatingDates'

const MealDetailsForm = ({
    meal,
    visible = true,
    editedValues,
    editableFields,
    foodItemsWithAvailability,
    onToggleEdit,
    onChange,
    onFoodItemChange,
    onPlannedEatingDatesChange,
    onAddFoodItem,
    onOpenFoodItem,
    onRemoveFoodItem,
    onToggleRecipeEdit,
    onAddToShoppingList,
    onAddToPantry,
    onImageUpdate,
    onSave,
    onServingsChange,
}) => {
    const showNutrition = useShowNutrition()
    const servings = normalizeServings(
        editedValues.servings ?? meal.servings
    )
    const cookingDate = new Date(
        editedValues.plannedCookingDate || meal.plannedCookingDate
    )
    const nutritionTotals = useMemo(
        () =>
            summarizeMealNutritionPerServing(
                editedValues.foodItems || [],
                servings
            ),
        [editedValues.foodItems, servings]
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

    const roleSummary = getMealTypeText(
        editedValues.defaultRoles || meal.defaultRoles
    )
    const categorySummary = getMealCategoryText(
        editedValues.mealCategory ?? meal.mealCategory
    )

    const cookingTime = editedValues.cookingTime || meal.cookingTime
    const difficultyText = getDifficultyText(
        editedValues.difficultyLevel || meal.difficultyLevel
    )
    const metaParts = [
        cookingTime ? `${cookingTime} min` : null,
        difficultyText && difficultyText !== 'Ei määritelty'
            ? difficultyText
            : null,
    ].filter(Boolean)

    return (
        <View style={styles.mealDetails}>
            <MealServingsStepper
                value={servings}
                onChange={onServingsChange}
                compact
                style={styles.servingsStepper}
            />

            {metaParts.length > 0 ? (
                <CustomText style={styles.recipeMeta}>
                    {metaParts.join(' · ')}
                </CustomText>
            ) : null}

            <MealTabs
                foodItems={editedValues.foodItems}
                foodItemsWithAvailability={foodItemsWithAvailability}
                recipe={editedValues.recipe}
                recipeSteps={editedValues.recipeSteps}
                mealId={meal?._id}
                visible={visible}
                isRecipeEditing={editableFields.recipe}
                onAddFoodItem={onAddFoodItem}
                onOpenFoodItem={onOpenFoodItem}
                onRemoveFoodItem={onRemoveFoodItem}
                onRecipeStepsChange={(steps) => onChange('recipeSteps', steps)}
                onToggleRecipeEdit={onToggleRecipeEdit}
                onAddToShoppingList={onAddToShoppingList}
                onAddToPantry={onAddToPantry}
                nutritionContent={
                    showNutrition && nutritionRows.length > 0 ? (
                        <View style={styles.nutritionSummary}>
                            <CustomText style={styles.nutritionTitle}>
                                Ravintoarvot (arvio, 1 annos)
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
                    ) : null
                }
                detailsContent={
                    <View>
                        <MealImageUploader
                            meal={meal}
                            onImageUpdate={onImageUpdate}
                        />

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
                            value={difficultyText}
                            isEditing={editableFields.difficultyLevel}
                            editedValue={
                                editedValues.difficultyLevel ||
                                meal.difficultyLevel
                            }
                            onToggleEdit={() => onToggleEdit('difficultyLevel')}
                            onChange={(value) =>
                                onChange('difficultyLevel', value)
                            }
                        />

                        <EditableField
                            field="cookingTime"
                            label="Valmistusaika"
                            value={`${cookingTime} min`}
                            isEditing={editableFields.cookingTime}
                            editedValue={cookingTime}
                            onToggleEdit={() => onToggleEdit('cookingTime')}
                            onChange={(text) => onChange('cookingTime', text)}
                            type="number"
                        />

                        <CollapsibleFormSection
                            label="Aterian tyyppi"
                            summary={
                                roleSummary === 'Ei määritelty'
                                    ? ''
                                    : roleSummary
                            }
                            style={styles.categorySection}
                        >
                            <MealRoleSelector
                                value={
                                    editedValues.defaultRoles ||
                                    meal.defaultRoles
                                }
                                onSelect={(next) =>
                                    onChange('defaultRoles', next)
                                }
                            />
                        </CollapsibleFormSection>

                        <CollapsibleFormSection
                            label="Ruokalaji"
                            summary={
                                categorySummary === 'Ei määritelty'
                                    ? ''
                                    : categorySummary
                            }
                            style={styles.categorySection}
                        >
                            <MealCategorySelector
                                value={parseMealCategories(
                                    editedValues.mealCategory ??
                                        meal.mealCategory,
                                    []
                                )}
                                onSelect={(next) =>
                                    onChange('mealCategory', next)
                                }
                            />
                        </CollapsibleFormSection>

                        <FormDateField
                            label="Suunniteltu valmistuspäivä"
                            value={cookingDate}
                            onChange={(selectedDate) =>
                                onChange('plannedCookingDate', selectedDate)
                            }
                            warnIfPast
                            overdueMessage={OVERDUE_COOKING_MESSAGE}
                            testID="plannedCookingDate"
                            style={styles.cookingDateField}
                        />

                        <PlannedEatingDates
                            dates={editedValues.plannedEatingDates || []}
                            onChange={onPlannedEatingDatesChange}
                            cookingDate={cookingDate}
                        />

                        <MealIngredientQuantityEditor
                            foodItems={editedValues.foodItems}
                            onItemChange={onFoodItemChange}
                        />
                    </View>
                }
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
    mealDetails: {},
    servingsStepper: {
        marginBottom: 4,
    },
    recipeMeta: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 14,
        marginBottom: 8,
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
    categorySection: {
        paddingTop: 8,
        paddingBottom: 8,
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
