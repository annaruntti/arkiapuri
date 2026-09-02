import { MEAL_ROLE_ORDER } from './mealUtils'
import {
    getDietCategories,
    getMealDietaryCategories,
    getMealRoles,
} from './mealFilters'

export { MEAL_ROLE_ORDER }

// First matching role in app order (breakfast → lunch → snack → dinner → …)
export const getPrimaryMealRole = (meal) => {
    const roles = getMealRoles(meal).map((role) => String(role).toLowerCase())
    return (
        MEAL_ROLE_ORDER.find((role) => roles.includes(role)) ||
        roles[0] ||
        'other'
    )
}

// Group meals by their primary default role (each meal in one section only)
export const groupMealsByCategory = (meals) => {
    const grouped = {}

    meals.forEach((meal) => {
        const role = getPrimaryMealRole(meal)
        if (!grouped[role]) {
            grouped[role] = []
        }
        grouped[role].push(meal)
    })

    const sortedGrouped = {}

    MEAL_ROLE_ORDER.forEach((category) => {
        if (grouped[category] && grouped[category].length > 0) {
            sortedGrouped[category] = grouped[category]
        }
    })

    Object.keys(grouped).forEach((category) => {
        if (!sortedGrouped[category] && grouped[category].length > 0) {
            sortedGrouped[category] = grouped[category]
        }
    })

    return sortedGrouped
}

// Get meal counts for each dietary category
export const getMealCountsForCategories = (meals) => {
    const counts = {}
    const dietCategories = getDietCategories()

    dietCategories.forEach((category) => {
        counts[category.id] = meals.filter((meal) => {
            const mealCategories = getMealDietaryCategories(meal)
            return mealCategories.includes(String(category.id))
        }).length
    })

    return counts
}
