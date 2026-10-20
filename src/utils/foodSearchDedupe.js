const normalizeItemName = (name) =>
    String(name || '')
        .toLowerCase()
        .trim()

const getItemIdentity = (item) => {
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
