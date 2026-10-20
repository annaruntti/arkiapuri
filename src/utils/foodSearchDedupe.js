export const normalizeItemName = (name) =>
    String(name || '')
        .toLowerCase()
        .trim()

export const getItemIdentity = (item) => {
    if (item?._id) return `id:${item._id}`
    if (item?.barcode) return `barcode:${item.barcode}`
    return null
}

/** Prefer richer / more recently used catalog item when collapsing duplicates. */
export const scoreFoodItem = (item) => {
    const hasImage = item.image?.url || item.imageUrl ? 1 : 0
    const hasOff = item.openFoodFactsData ? 1 : 0
    const updatedAt = item.updatedAt ? new Date(item.updatedAt).getTime() : 0
    return hasImage * 5 + hasOff * 3 + updatedAt / 1e12
}

export const dedupeFoodItems = (items = []) => {
    const byIdentity = new Map()

    for (const item of items) {
        const identity = getItemIdentity(item)
        if (!identity) {
            byIdentity.set(`anon:${byIdentity.size}`, item)
            continue
        }
        const existing = byIdentity.get(identity)
        if (!existing || scoreFoodItem(item) > scoreFoodItem(existing)) {
            byIdentity.set(identity, item)
        }
    }

    const byName = new Map()
    for (const item of byIdentity.values()) {
        const name = normalizeItemName(item.name)
        if (!name) continue
        const existing = byName.get(name)
        if (!existing || scoreFoodItem(item) > scoreFoodItem(existing)) {
            byName.set(name, item)
        }
    }

    return [...byName.values()]
}

/** Filter + rank local catalog rows for a typed search query. */
export const filterLocalFoodItemsForQuery = (query, localFoodItems = []) => {
    if (!query || String(query).length < 2) return []

    const queryLower = normalizeItemName(query)
    return dedupeFoodItems(
        localFoodItems.filter((item) => {
            if (!item.name) return false
            return normalizeItemName(item.name).includes(queryLower)
        })
    )
        .sort((a, b) => {
            const aName = normalizeItemName(a.name)
            const bName = normalizeItemName(b.name)
            const aExact = aName === queryLower
            const bExact = bName === queryLower
            const aStarts = aName.startsWith(queryLower)
            const bStarts = bName.startsWith(queryLower)

            if (aExact && !bExact) return -1
            if (!aExact && bExact) return 1
            if (aStarts && !bStarts) return -1
            if (!aStarts && bStarts) return 1
            return aName.localeCompare(bName)
        })
        .slice(0, 15)
        .map((item) => ({
            ...item,
            source: item.source || 'local',
            name: item.name || 'Nimetön tuote',
            category: Array.isArray(item.category)
                ? item.category
                : item.category
                  ? [item.category]
                  : [],
            calories: item.calories || 0,
        }))
}

/** Normalize OFF search API products for the result list. */
export const normalizeOpenFoodFactsSearchResults = (products = []) =>
    dedupeFoodItems(
        products.map((product) => ({
            ...product,
            source: 'openfoodfacts',
            name: String(product.name || 'Nimetön tuote'),
            brands: String(product.brands || ''),
            nutrition: product.nutrition || { calories: 0 },
            nutritionGrade: String(product.nutritionGrade || ''),
            category: Array.isArray(product.category)
                ? product.category
                : product.category
                  ? [product.category]
                  : [],
        }))
    )

/**
 * Build the visible result list for a search tab.
 * "all" prioritizes local catalog items, then OFF rows without name collisions.
 */
export const getFoodSearchTabResults = (
    activeTab,
    localItems = [],
    openFoodFactsItems = []
) => {
    switch (activeTab) {
        case 'local':
            return dedupeFoodItems(localItems)
        case 'openfoodfacts':
            return dedupeFoodItems(openFoodFactsItems)
        default: {
            const seenNames = new Set()
            const seenKeys = new Set()
            const deduped = []

            localItems.forEach((item) => {
                const normalizedName = normalizeItemName(item.name)
                const key =
                    getItemIdentity(item) || `local-${normalizedName}`

                if (!seenNames.has(normalizedName) && !seenKeys.has(key)) {
                    seenNames.add(normalizedName)
                    seenKeys.add(key)
                    deduped.push(item)
                }
            })

            openFoodFactsItems.forEach((item) => {
                const normalizedName = normalizeItemName(item.name)
                const key = getItemIdentity(item) || `off-${normalizedName}`

                if (!seenNames.has(normalizedName) && !seenKeys.has(key)) {
                    seenNames.add(normalizedName)
                    seenKeys.add(key)
                    deduped.push(item)
                }
            })

            return deduped
        }
    }
}
