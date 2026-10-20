/**
 * Helpers for Mongo-style catalog food item ids used across meal/pantry flows.
 */

export const isPersistedFoodItemId = (id) =>
    typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)

/**
 * Stable string key for an entity that may use Mongo ObjectId-like shapes.
 */
export const resolveEntityKey = (value) => {
    if (!value) return ''
    const candidate = value._id ?? value.id
    if (candidate == null) return ''
    if (typeof candidate === 'object') {
        if (candidate.$oid) return String(candidate.$oid)
        if (typeof candidate.toHexString === 'function') {
            return candidate.toHexString()
        }
        if (typeof candidate.toString === 'function') {
            const asString = candidate.toString()
            if (asString && asString !== '[object Object]') return asString
        }
        return ''
    }
    return String(candidate)
}

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
