import axios from 'axios'

import { getServerUrl } from './getServerUrl'
import {
    clampDatesToMin,
    toStoredMealDate,
    toStoredMealDates,
} from './mealDates'
import { getDifficultyEnum, parseMealCategories, parseMealRoles } from './mealUtils'
import { DEFAULT_SERVINGS } from './mealServings'
import { resolveMealFoodItemRefs } from './resolveMealFoodItems'
import storage from './storage'

/**
 * Build PUT /meals/:id body from an edited meal draft.
 */
export const buildMealUpdatePayload = (updatedMeal, foodItemRefs) => {
    const validDifficulties = ['easy', 'medium', 'hard']
    const difficultyLevel = validDifficulties.includes(
        updatedMeal.difficultyLevel
    )
        ? updatedMeal.difficultyLevel
        : getDifficultyEnum(updatedMeal.difficultyLevel)

    return {
        name: updatedMeal.name,
        cookingTime: parseInt(updatedMeal.cookingTime) || 0,
        difficultyLevel,
        defaultRoles: parseMealRoles(updatedMeal.defaultRoles, ['dinner']),
        mealCategory: parseMealCategories(updatedMeal.mealCategory, []),
        plannedCookingDate: toStoredMealDate(updatedMeal.plannedCookingDate),
        plannedEatingDates: toStoredMealDates(
            clampDatesToMin(
                updatedMeal.plannedEatingDates || [],
                updatedMeal.plannedCookingDate
            )
        ),
        servings: parseInt(updatedMeal.servings, 10) || DEFAULT_SERVINGS,
        recipe: updatedMeal.recipe || '',
        recipeSteps: Array.isArray(updatedMeal.recipeSteps)
            ? updatedMeal.recipeSteps
            : [],
        foodItems: foodItemRefs,
    }
}

/**
 * Resolve ingredients and PUT meal update.
 * @returns {{ ok: true, meal } | { ok: false, message: string }}
 */
export const submitMealUpdate = async (mealId, updatedMeal) => {
    const token = await storage.getItem('userToken')
    if (!token) {
        return { ok: false, message: 'Kirjautuminen vaaditaan' }
    }

    const foodItemRefs = await resolveMealFoodItemRefs(
        updatedMeal.foodItems || [],
        token
    )
    const cleanedMeal = buildMealUpdatePayload(updatedMeal, foodItemRefs)

    const response = await axios.put(
        getServerUrl(`/meals/${mealId}`),
        cleanedMeal,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    )

    if (response.data.success) {
        return { ok: true, meal: response.data.meal }
    }

    return {
        ok: false,
        message: response.data.message || 'Aterian tallennus epäonnistui',
    }
}

/**
 * DELETE /meals/:id for an authenticated user.
 */
export const deleteMealOnServer = async (mealId, token) => {
    const response = await axios.delete(getServerUrl(`/meals/${mealId}`), {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return Boolean(response.data?.success)
}
