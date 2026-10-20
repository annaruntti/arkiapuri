import {
    clampDatesToMin,
    toStoredMealDate,
    toStoredMealDates,
} from './mealDates'
import { getIngredientQuantity } from './mealFoodItem'
import { getDifficultyEnum, parseMealCategories } from './mealUtils'
import {
    joinRecipeSteps,
    normalizeRecipeSteps,
} from './recipeSteps'

/**
 * Resolve planned eating dates, defaulting to cooking date.
 */
export const resolveMealEatingDates = (
    plannedEatingDates,
    plannedCookingDate
) =>
    plannedEatingDates?.length > 0
        ? clampDatesToMin(plannedEatingDates, plannedCookingDate)
        : [plannedCookingDate]

/**
 * Build guest-session meal object (not persisted).
 */
export const buildGuestMealPayload = ({
    data,
    recipeSteps,
    difficultyLevel,
    foodItems,
    selectedRoles,
    mealCategory,
    plannedCookingDate,
    plannedEatingDates,
    servings,
    mealImage,
}) => {
    const eatingDates = resolveMealEatingDates(
        plannedEatingDates,
        plannedCookingDate
    )
    return {
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
        image: mealImage ? { url: mealImage.uri || mealImage } : undefined,
        user: 'guest',
    }
}

/**
 * Build POST /meals body for a logged-in user.
 */
export const buildPersistedMealPayload = ({
    data,
    recipeSteps,
    difficultyLevel,
    foodItemRefs,
    selectedRoles,
    mealCategory,
    plannedCookingDate,
    plannedEatingDates,
    servings,
    userId,
}) => {
    const eatingDates = resolveMealEatingDates(
        plannedEatingDates,
        plannedCookingDate
    )
    return {
        name: data.name,
        recipe: joinRecipeSteps(recipeSteps),
        recipeSteps: normalizeRecipeSteps(recipeSteps),
        difficultyLevel: getDifficultyEnum(difficultyLevel),
        cookingTime: parseInt(data.cookingTime) || 0,
        foodItems: foodItemRefs,
        defaultRoles: [...selectedRoles],
        mealCategory: parseMealCategories(mealCategory, []),
        plannedCookingDate: toStoredMealDate(plannedCookingDate),
        plannedEatingDates: toStoredMealDates(eatingDates),
        servings,
        user: userId,
    }
}
