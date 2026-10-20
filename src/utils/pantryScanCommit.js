/**
 * Unique suggestion/item ids from scan removal payloads.
 */
export const uniquePantryItemIds = (items) => [
    ...new Set(
        (items || [])
            .map((item) => item.itemId || item)
            .filter(Boolean)
            .map(String)
    ),
]

/**
 * Build pantry POST body for one AI scan review row.
 */
export const buildPantryScanAddPayload = (item, locationId) => ({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category || [],
    foodId: item.foodId || undefined,
    calories: item.calories,
    nutrition: item.nutrition,
    barcode: item.barcode,
    imageUrl: item.imageUrl,
    locationId,
    openFoodFactsData:
        item.barcode || item.imageUrl
            ? {
                  barcode: item.barcode,
                  imageUrl: item.imageUrl,
                  nutrition: item.nutrition,
              }
            : undefined,
    addedFrom: 'pantry',
})

/**
 * Normalize scan-review submit payload into adds / removals / kept.
 */
export const normalizePantryScanCommitPayload = (payload) => {
    const selectedItems = Array.isArray(payload)
        ? payload
        : payload?.adds || []
    const removals = payload?.removals || []
    const keptRemovals = payload?.keptRemovals || []
    return { selectedItems, removals, keptRemovals }
}
