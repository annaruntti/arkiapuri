export const normalizeMealFoodItem = (item) => ({
    ...item,
    tempId: `${item._id || item.name}-${Date.now()}-${Math.random()}`,
    locations: item.locations?.includes('meal')
        ? item.locations
        : [...(item.locations || []), 'meal'],
    quantities: {
        meal:
            parseFloat(item.quantities?.meal) ||
            parseFloat(item.quantity) ||
            1,
        'shopping-list':
            parseFloat(item.quantities?.['shopping-list']) || 0,
        pantry: parseFloat(item.quantities?.pantry) || 0,
    },
    category: Array.isArray(item.category) ? item.category : [],
    unit: item.unit || 'kpl',
    price: parseFloat(item.price) || 0,
    calories: parseInt(item.calories, 10) || 0,
})

export const mergeUpdatedFoodItem = (foodItems, sourceItem, updatedFoodItem) =>
    foodItems.map((entry) => {
        const entryId = entry._id || entry.foodId?._id || entry.foodId
        const updatedId = updatedFoodItem?._id

        if (entryId && updatedId && String(entryId) === String(updatedId)) {
            return {
                ...entry,
                ...updatedFoodItem,
                quantities: updatedFoodItem.quantities,
                locations: updatedFoodItem.locations,
            }
        }

        if (entry.name === sourceItem.name) {
            return {
                ...entry,
                quantities:
                    updatedFoodItem?.quantities || entry.quantities,
                locations: updatedFoodItem?.locations || entry.locations,
            }
        }

        return entry
    })

export const prepareMealFoodItemsForSave = (foodItems = []) =>
    foodItems.map((item) => ({
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
    }))
