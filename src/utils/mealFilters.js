import categoriesData from '../data/categories.json'

// Get diet categories from categories.json
export const getDietCategories = () => {
    return categoriesData.find((cat) => cat.id === 'diets')?.children || []
}

// Create a mapping of category names to IDs
export const getCategoryMappings = () => {
    const dietCategories = getDietCategories()
    const categoryNameToId = {}
    
    dietCategories.forEach((cat) => {
        categoryNameToId[cat.name] = String(cat.id)
    })

    return { categoryNameToId }
}

// Determine which dietary categories a meal qualifies for
// A meal qualifies if all its food items have that category
export const getMealDietaryCategories = (meal) => {
    if (!meal.foodItems || meal.foodItems.length === 0) {
        return []
    }

    const qualifiedCategories = []
    const dietCategories = getDietCategories()

    dietCategories.forEach((dietCategory) => {
        const categoryId = String(dietCategory.id)
        const categoryName = dietCategory.name

        // Check if all food items have this dietary category
        const allItemsHaveCategory = meal.foodItems.every((foodItem) => {
            // Check if foodItem is just an ID (not populated)
            if (typeof foodItem === 'string' || !foodItem.category) {
                return false
            }

            const itemCategories = foodItem.category || []
            // Check is the category exists as either ID or name
            const hasCategory = itemCategories.some((cat) => {
                const catStr = String(cat).trim()
                // Compare both as ID and as name
                return catStr === categoryId || catStr === categoryName
            })
            return hasCategory
        })

        if (allItemsHaveCategory) {
            qualifiedCategories.push(categoryId)
        }
    })

    return qualifiedCategories
}

// Filter meals by search query
export const filterMealsBySearch = (meals, searchQuery) => {
    if (!searchQuery || !searchQuery.trim()) {
        return meals
    }

    return meals.filter((meal) =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
}

// Filter meals based on selected dietary filters
export const filterMealsByDiet = (meals, selectedDietFilters) => {
    if (!selectedDietFilters || selectedDietFilters.length === 0) {
        return meals
    }

    return meals.filter((meal) => {
        const mealCategories = getMealDietaryCategories(meal)

        // Meal must have all selected diet filters
        return selectedDietFilters.every((filterId) =>
            mealCategories.includes(filterId)
        )
    })
}

// Filter meals by difficulty level
export const filterMealsByDifficulty = (meals, difficulty) => {
    if (!difficulty) {
        return meals
    }

    return meals.filter((meal) => {
        const mealDifficulty = meal.difficultyLevel
            ? String(meal.difficultyLevel).toLowerCase()
            : 'medium'
        return mealDifficulty === difficulty.toLowerCase()
    })
}

// Filter meals by cooking time
export const filterMealsByCookingTime = (meals, maxTime) => {
    if (!maxTime) {
        return meals
    }

    return meals.filter((meal) => {
        const cookingTime = parseInt(meal.cookingTime) || 0
        return cookingTime > 0 && cookingTime <= maxTime
    })
}

// Filter meals by meal type (defaultRoles)
export const filterMealsByType = (meals, filterMealType) => {
    if (!filterMealType) {
        return meals
    }

    return meals.filter((meal) => {
        const roles = meal.defaultRoles || []
        return roles.includes(filterMealType)
    })
}

// Get meal counts by difficulty level
export const getMealCountByDifficulty = (meals, difficulty) => {
    return meals.filter((meal) => {
        const mealDifficulty = meal.difficultyLevel
            ? String(meal.difficultyLevel).toLowerCase()
            : 'medium'
        return mealDifficulty === difficulty.toLowerCase()
    }).length
}

// Get meal counts by cooking time
export const getMealCountByCookingTime = (meals, maxTime) => {
    return meals.filter((meal) => {
        const cookingTime = parseInt(meal.cookingTime) || 0
        return cookingTime > 0 && cookingTime <= maxTime
    }).length
}
