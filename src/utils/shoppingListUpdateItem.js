import { findOrCreateFoodItem } from '../services/foodItemApi'
import { entityId, updateShoppingListItem } from '../services/collectionApi'

const parsePositivePrice = (value) => {
    const parsed = parseFloat(String(value ?? '').replace(',', '.'))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

/**
 * Normalize price / foodId fields and ensure a catalog id when needed.
 */
export const prepareShoppingListItemUpdate = async (
    currentItem,
    updatedData
) => {
    const next = { ...updatedData }

    if (next.price !== undefined) {
        next.price = parsePositivePrice(next.price)
    }

    let foodItemId = currentItem.foodId?._id || currentItem.foodId

    if (next.foodId && typeof next.foodId === 'object') {
        foodItemId = next.foodId._id || next.foodId
        next.foodId = foodItemId
    }

    if (!foodItemId && (next.image || next.category)) {
        try {
            const foodItemResult = await findOrCreateFoodItem({
                name: next.name || currentItem.name,
                category: next.category || currentItem.category || [],
                unit: next.unit || currentItem.unit || 'kpl',
                price: next.price || currentItem.price || 0,
                calories: next.calories || currentItem.calories || 0,
            })
            foodItemId = foodItemResult.foodItem?._id
            if (foodItemId) {
                next.foodId = foodItemId
            }
        } catch (foodItemError) {
            console.error('Error creating food item:', foodItemError)
        }
    }

    return next
}

/**
 * Update one shopping-list row, creating a catalog food item when needed.
 */
export const updateShoppingListItemWithCatalog = async ({
    shoppingListId,
    itemId,
    currentItem,
    updatedData,
}) => {
    const prepared = await prepareShoppingListItemUpdate(
        currentItem,
        updatedData
    )
    return updateShoppingListItem(
        shoppingListId,
        entityId(itemId) || itemId,
        prepared
    )
}
