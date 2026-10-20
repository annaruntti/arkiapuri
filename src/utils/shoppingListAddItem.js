import { findOrCreateFoodItem } from '../services/foodItemApi'
import {
    addShoppingListItems,
    entityId,
    updateShoppingListItem,
} from '../services/collectionApi'
import {
    buildDuplicateMergeUpdates,
    findMatchingShoppingListItem,
} from './shoppingListDuplicate'

/**
 * Normalize a form/search/barcode payload into a shopping-list row draft.
 * Strips catalog `_id` so it is never treated as a list row id.
 */
export const prepareIncomingShoppingListItem = (itemData = {}) => {
    const { _id: _ignoredCatalogId, ...itemWithoutRowId } = itemData
    return {
        ...itemWithoutRowId,
        isFood: itemData.isFood !== false,
        quantity: itemData.quantity || 1,
        unit: itemData.unit || 'kpl',
    }
}

/**
 * Add a shopping-list item, optionally merging into an existing duplicate.
 *
 * `confirmDuplicateMerge` should resolve true to merge, false to cancel.
 */
export const addOrMergeShoppingListItem = async ({
    shoppingList,
    itemData,
    token,
    confirmDuplicateMerge,
}) => {
    const incoming = prepareIncomingShoppingListItem(itemData)
    const existing = findMatchingShoppingListItem(
        shoppingList?.items,
        incoming
    )

    if (existing) {
        const shouldIncrease = await confirmDuplicateMerge({
            existing,
            incoming,
        })
        if (!shouldIncrease) {
            return { status: 'cancelled' }
        }

        const { updates, priceEstimate, priceEstimateSource } =
            buildDuplicateMergeUpdates(existing, incoming)
        const itemId = entityId(existing)

        if (!token) {
            const updatedList = {
                ...shoppingList,
                items: (shoppingList.items || []).map((item) =>
                    entityId(item) === itemId
                        ? {
                              ...item,
                              ...updates,
                              ...(updates.price > 0
                                  ? {
                                        priceEstimate: undefined,
                                        priceEstimateSource: undefined,
                                    }
                                  : priceEstimate > 0
                                    ? {
                                          price: 0,
                                          priceEstimate,
                                          priceEstimateSource,
                                      }
                                    : {}),
                          }
                        : item
                ),
            }
            return { status: 'merged', shoppingList: updatedList }
        }

        const data = await updateShoppingListItem(
            shoppingList._id,
            itemId,
            updates
        )
        if (
            data?.shoppingList &&
            !(updates.price > 0) &&
            priceEstimate > 0
        ) {
            const patchedItems = (data.shoppingList.items || []).map((item) =>
                entityId(item) === itemId
                    ? {
                          ...item,
                          quantity: updates.quantity ?? item.quantity,
                          unit: updates.unit || item.unit,
                          priceEstimate,
                          priceEstimateSource:
                              priceEstimateSource ||
                              item.priceEstimateSource ||
                              'history',
                      }
                    : item
            )
            return {
                status: 'merged',
                shoppingList: {
                    ...data.shoppingList,
                    items: patchedItems,
                },
            }
        }
        return { status: 'merged', shoppingList: data.shoppingList }
    }

    if (!token) {
        const guestItem = {
            ...incoming,
            _id:
                itemData._id ||
                `guest-item-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`,
            foodId: itemData.foodId || itemData._id,
            location: 'shopping-list',
            bought: false,
        }
        return {
            status: 'added',
            shoppingList: {
                ...shoppingList,
                items: [...(shoppingList.items || []), guestItem],
            },
        }
    }

    let foodItemId = itemData.foodId
    if (!foodItemId) {
        try {
            const foodItemResult = await findOrCreateFoodItem({
                name: itemData.name,
                isFood: itemData.isFood !== false,
                category: itemData.category || [],
                unit: itemData.unit || 'kpl',
                price: itemData.price || 0,
                calories: itemData.calories || 0,
            })
            foodItemId = foodItemResult.foodItem?._id
        } catch (foodItemError) {
            console.error('Error creating food item:', foodItemError)
        }
    }

    const newItem = {
        ...incoming,
        foodId: foodItemId,
        location: 'shopping-list',
    }
    const data = await addShoppingListItems(shoppingList._id, [newItem])
    return { status: 'added', shoppingList: data.shoppingList }
}
