export const stripCatalogLocationQuantity = (item) => {
    if (!item || typeof item !== 'object') return item
    const { quantity: _quantity, packageQuantity: _packageQuantity, ...rest } =
        item
    return {
        ...rest,
        quantities: {
            meal: 0,
            'shopping-list': 0,
            pantry: 0,
        },
    }
}

export const getIngredientQuantity = (item) => {
    const fromRow = parseFloat(item?.quantity)
    if (Number.isFinite(fromRow) && fromRow > 0) return fromRow
    return 1
}

export const applyIngredientQuantity = (item, quantity, unit) => {
    const qty = Number.isFinite(parseFloat(quantity)) && parseFloat(quantity) > 0
        ? parseFloat(quantity)
        : 1
    const resolvedUnit = unit || item.unit || 'kpl'
    return {
        ...stripCatalogLocationQuantity(item),
        quantity: qty,
        unit: resolvedUnit,
        quantities: {
            meal: qty,
            'shopping-list': 0,
            pantry: 0,
        },
    }
}

export const normalizeMealFoodItem = (item) => {
    const quantity = getIngredientQuantity(item)
    return {
        ...stripCatalogLocationQuantity(item),
        tempId: `${item._id || item.foodId || item.name}-${Date.now()}-${Math.random()}`,
        foodId: item.foodId || item._id,
        quantity,
        unit: item.unit || 'kpl',
        quantities: {
            meal: quantity,
            'shopping-list': 0,
            pantry: 0,
        },
        category: Array.isArray(item.category) ? item.category : [],
        price: parseFloat(item.price) || 0,
        calories: parseInt(item.calories, 10) || 0,
        nutrition:
            item.nutrition || item.openFoodFactsData?.nutrition || undefined,
        openFoodFactsData: item.openFoodFactsData,
    }
}

export const mergeUpdatedFoodItem = (foodItems, sourceItem, updatedFoodItem) =>
    foodItems.map((entry) => {
        const entryId = entry._id || entry.foodId?._id || entry.foodId
        const updatedId = updatedFoodItem?._id
        const quantity = getIngredientQuantity(entry)
        const unit = entry.unit || 'kpl'

        if (entryId && updatedId && String(entryId) === String(updatedId)) {
            return {
                ...entry,
                name: updatedFoodItem.name || entry.name,
                category: updatedFoodItem.category || entry.category,
                calories: updatedFoodItem.calories ?? entry.calories,
                price: updatedFoodItem.price ?? entry.price,
                image:
                    updatedFoodItem.image !== undefined
                        ? updatedFoodItem.image
                        : entry.image,
                nutrition: updatedFoodItem.nutrition || entry.nutrition,
                quantity,
                unit,
                quantities: {
                    meal: quantity,
                    'shopping-list': 0,
                    pantry: 0,
                },
            }
        }

        if (entry.name === sourceItem.name) {
            return {
                ...entry,
                quantity,
                unit,
                quantities: {
                    meal: quantity,
                    'shopping-list': 0,
                    pantry: 0,
                },
            }
        }

        return entry
    })

export const prepareMealFoodItemsForSave = (foodItems = []) =>
    foodItems.map((item) => ({
        foodId: item.foodId || item._id,
        quantity: getIngredientQuantity(item),
        unit: item.unit || 'kpl',
        name: item.name,
        category: item.category || [],
        price: item.price || 0,
        calories: item.calories || 0,
        nutrition: item.nutrition,
    }))
