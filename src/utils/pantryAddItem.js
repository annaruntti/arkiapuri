import { findOrCreateFoodItem } from '../services/foodItemApi'
import { isPersistedFoodItemId } from './foodItemId'
import {
    ALL_LOCATIONS_ID,
    UNLOCATED_LOCATION_ID,
    inferLocationIdFromCategories,
} from './pantryLocations'

/**
 * Build the pantry POST body, creating a catalog food item when needed.
 */
export const buildPantryItemPayload = async (
    itemData,
    { selectedLocationId, pantryLocations } = {}
) => {
    if (!itemData?.name || !itemData?.unit) {
        throw new Error('Nimi ja yksikkö ovat pakollisia tietoja')
    }

    const quantity =
        Number(itemData.quantity) || Number(itemData.packageQuantity) || 1
    const catalogId = String(itemData.foodId || itemData._id || '')
    let foodId = isPersistedFoodItemId(catalogId) ? catalogId : null

    if (!foodId) {
        const foodItemResult = await findOrCreateFoodItem({
            name: itemData.name.trim(),
            category: itemData.category || [],
            unit: itemData.unit,
            price: Number(itemData.price) || 0,
            calories: Number(itemData.calories) || 0,
        })
        if (!foodItemResult.success || !foodItemResult.foodItem?._id) {
            throw new Error('Failed to create food item')
        }
        foodId = foodItemResult.foodItem._id
    }

    const locationId =
        itemData.locationId ||
        (selectedLocationId !== ALL_LOCATIONS_ID &&
        selectedLocationId !== UNLOCATED_LOCATION_ID
            ? selectedLocationId
            : inferLocationIdFromCategories(
                  itemData.category,
                  pantryLocations
              ) || undefined)

    return {
        name: itemData.name.trim(),
        quantity,
        unit: itemData.unit,
        foodId,
        category: itemData.category || [],
        calories: Number(itemData.calories) || 0,
        price: Number(itemData.price) || 0,
        addedFrom: 'pantry',
        locationId,
        ...(itemData.expirationDate
            ? {
                  expirationDate: itemData.expirationDate,
                  expirationDateSetByUser: true,
              }
            : {}),
    }
}
