import { getFoodItemImageUrl } from './openFoodFactsMapper'
import {
    UNLOCATED_LOCATION_ID,
    inferLocationIdFromCategories,
    locationIdOf,
    locationNameOf,
} from './pantryLocations'

const normalizePantryName = (name) =>
    String(name || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .replace(/\s+/g, ' ')

/** Treat "Kevyt maito" and "Kevytmaito" as the same product. */
export const pantryItemMergeKey = (name) =>
    normalizePantryName(name)
        .replace(/[^a-zåäö0-9]+/gi, '')
        .toLowerCase()
        .trim()

export const getPantryFoodId = (item) => {
    if (!item?.foodId) return null
    if (typeof item.foodId === 'object') {
        return String(item.foodId._id || item.foodId.id || '')
    }
    return String(item.foodId)
}

export const collectPantryMergedIds = (item) => {
    const ids = []
    if (Array.isArray(item?.mergedIds)) {
        ids.push(...item.mergedIds)
    }
    if (item?._id) {
        ids.push(item._id)
    }
    return [...new Set(ids.filter(Boolean).map(String))]
}

/** Show the same product only once; sum quantities. Name is the merge key. */
export const mergeDuplicatePantryItems = (items = []) => {
    const groups = new Map()

    for (const item of items) {
        const foodName =
            item.foodId && typeof item.foodId === 'object'
                ? item.foodId.name
                : ''
        const displayName = (item.name || foodName || '').trim()
        const nameKey = pantryItemMergeKey(displayName)
        const foodId = getPantryFoodId(item)
        const key = nameKey
            ? `name:${nameKey}`
            : foodId
              ? `food:${foodId}`
              : `id:${item._id}`

        const itemUnit = item.unit === 'pcs' ? 'kpl' : item.unit || 'kpl'
        const locationKey = locationIdOf(item) || UNLOCATED_LOCATION_ID
        // Keep different units and locations of the same product separate.
        const mergeKey = `${key}:unit:${itemUnit}:loc:${locationKey}`
        const incomingIds = collectPantryMergedIds(item)

        const existing = groups.get(mergeKey)
        if (!existing) {
            groups.set(mergeKey, {
                ...item,
                name: displayName || item.name,
                unit: itemUnit,
                mergedIds: incomingIds,
            })
            continue
        }

        for (const id of incomingIds) {
            if (!existing.mergedIds.includes(id)) {
                existing.mergedIds.push(id)
            }
        }

        existing.quantity =
            (Number(existing.quantity) || 0) + (Number(item.quantity) || 0)
        existing.unit = itemUnit

        if (
            /\s/.test(displayName) &&
            !/\s/.test(String(existing.name || ''))
        ) {
            existing.name = displayName
        }

        if (
            item.expirationDate &&
            (!existing.expirationDate ||
                new Date(item.expirationDate) <
                    new Date(existing.expirationDate))
        ) {
            existing.expirationDate = item.expirationDate
        }

        if (!getFoodItemImageUrl(existing) && getFoodItemImageUrl(item)) {
            existing.image = item.image
            existing.foodId = item.foodId
        }
    }

    return [...groups.values()]
}

export const decoratePantryItems = (items = [], locations = []) =>
    items.map((item) => {
        const locationId =
            locationIdOf(item) ||
            inferLocationIdFromCategories(item.category, locations)
        const located = locationId ? { ...item, locationId } : item
        return {
            ...located,
            locationName: locationNameOf(located, locations),
        }
    })
