/**
 * Helpers for Mongo-style catalog food item ids used across meal/pantry flows.
 */

export const isPersistedFoodItemId = (id) =>
    typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)

/**
 * Resolve the catalog food id from a meal/pantry/shopping row.
 * Prefers nested foodId, then top-level _id.
 */
export const resolveCatalogFoodId = (item) => {
    if (!item) return ''
    const raw = item.foodId
    if (raw && typeof raw === 'object') {
        return String(raw._id || raw.id || '')
    }
    if (raw) return String(raw)
    if (item._id && typeof item._id === 'object') {
        return String(item._id._id || item._id.id || '')
    }
    return item._id ? String(item._id) : ''
}
