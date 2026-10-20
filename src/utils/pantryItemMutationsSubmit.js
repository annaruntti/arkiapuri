import {
    addPantryItem,
    deletePantryItem,
    updatePantryItem,
} from '../services/collectionApi'
import storage from './storage'
import { buildPantryItemPayload } from './pantryAddItem'
import {
    ALL_LOCATIONS_ID,
    UNLOCATED_LOCATION_ID,
    inferLocationIdFromCategories,
} from './pantryLocations'
import { collectPantryMergedIds } from './pantryItemMerge'

/**
 * Build a local-only pantry row for guest sessions.
 */
export const buildGuestPantryItem = (
    itemData,
    { selectedLocationId, pantryLocations } = {}
) => {
    const quantity =
        Number(itemData.quantity) ||
        Number(itemData.quantities?.pantry) ||
        Number(itemData.packageQuantity) ||
        1
    return {
        _id: itemData._id || `guest-pantry-${Date.now()}`,
        name: (itemData.name || '').trim(),
        quantity,
        unit: itemData.unit || 'kpl',
        expirationDate: itemData.expirationDate || undefined,
        expirationDateSetByUser: Boolean(itemData.expirationDate),
        foodId: itemData.foodId || itemData._id,
        category: itemData.category || [],
        calories: Number(itemData.calories) || 0,
        price: Number(itemData.price) || 0,
        image: itemData.image,
        openFoodFactsData: itemData.openFoodFactsData,
        source: itemData.source,
        addedFrom: 'pantry',
        locationId:
            selectedLocationId !== ALL_LOCATIONS_ID &&
            selectedLocationId !== UNLOCATED_LOCATION_ID
                ? selectedLocationId
                : itemData.locationId ||
                  inferLocationIdFromCategories(
                      itemData.category,
                      pantryLocations
                  ),
    }
}

/**
 * @returns {{ status: 'need_login'|'guest'|'ok', guestItem?: object }}
 */
export const submitPantryAddItem = async ({
    itemData,
    selectedLocationId,
    pantryLocations,
    continueWithoutLogin,
}) => {
    const token = await storage.getItem('userToken')

    if (!token) {
        if (!continueWithoutLogin) return { status: 'need_login' }
        if (!itemData.name || !itemData.unit) {
            throw new Error('Nimi ja yksikkö ovat pakollisia tietoja')
        }
        return {
            status: 'guest',
            guestItem: buildGuestPantryItem(itemData, {
                selectedLocationId,
                pantryLocations,
            }),
        }
    }

    const pantryItemData = await buildPantryItemPayload(itemData, {
        selectedLocationId,
        pantryLocations,
    })
    await addPantryItem(pantryItemData)
    return { status: 'ok' }
}

export const filterPantryItemsByRemovedIds = (items, idsToRemove) => {
    const removeSet = new Set(idsToRemove.map(String))
    return items.filter(
        (row) =>
            !collectPantryMergedIds(row).some((id) => removeSet.has(id))
    )
}

/**
 * Delete pantry rows by id (no-op when guest / no token — caller updates local).
 */
export const submitPantryRemoveIds = async (idsToRemove) => {
    const token = await storage.getItem('userToken')
    if (!token) {
        return { status: 'guest' }
    }
    await Promise.all(idsToRemove.map((id) => deletePantryItem(id)))
    return { status: 'ok' }
}

/**
 * @returns {'need_login'|'guest'|'ok'|'error'}
 */
export const submitPantryUpdateItem = async ({
    itemId,
    updatedData,
    continueWithoutLogin,
}) => {
    const token = await storage.getItem('userToken')

    if (!token) {
        if (!continueWithoutLogin) return { status: 'need_login' }
        return { status: 'guest' }
    }

    await updatePantryItem(itemId, updatedData)
    return { status: 'ok' }
}
