import { getDietCategories, getMealDietaryCategories } from './mealFilters'

// Group meals by their default roles
export const groupMealsByCategory = (meals) => {
    const grouped = {}

    meals.forEach((meal) => {
        const roles = meal.defaultRoles || ['other']
        roles.forEach((role) => {
            if (!grouped[role]) {
                grouped[role] = []
            }
            grouped[role].push(meal)
        })
    })

    // Sort categories by predefined order
    const categoryOrder = [
        'breakfast',
        'lunch',
        'snack',
        'dinner',
        'supper',
        'dessert',
        'other',
    ]
    const sortedGrouped = {}

    categoryOrder.forEach((category) => {
        if (grouped[category] && grouped[category].length > 0) {
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
