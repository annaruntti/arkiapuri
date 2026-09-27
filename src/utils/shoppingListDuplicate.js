import { resolveAppUnit } from './units'

const positive = (value) => {
    const parsed = parseFloat(String(value ?? '').replace(',', '.'))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const roundMoney = (value) => Math.round(value * 100) / 100

export const formatShoppingQuantity = (quantity, unit) => {
    const amount = positive(quantity) || 1
    const resolvedUnit = resolveAppUnit(unit)
    const amountLabel = Number.isInteger(amount)
        ? String(amount)
        : String(roundMoney(amount))
    return `${amountLabel} ${resolvedUnit}`.trim()
}

export const idOf = (value) => {
    if (!value) return ''
    if (typeof value === 'object') {
        if (value._id != null) return idOf(value._id)
        if (value.id != null) return idOf(value.id)
        if (value.$oid) return String(value.$oid)
        return ''
    }
    return String(value)
}

export const normalizeShoppingItemName = (name) =>
    String(name || '')
        .toLowerCase()
        .trim()

export const shoppingItemBarcode = (item) =>
    String(
        item?.barcode ||
            item?.openFoodFactsData?.barcode ||
            item?.foodId?.openFoodFactsData?.barcode ||
            ''
    ).replace(/[\s-]/g, '')

/** True when two shopping-list rows refer to the same product. */
export const sameShoppingProduct = (a, b) => {
    if (!a || !b) return false
    const foodA = idOf(a.foodId)
    const foodB = idOf(b.foodId)
    if (foodA && foodB && foodA === foodB) return true
    const codeA = shoppingItemBarcode(a)
    const codeB = shoppingItemBarcode(b)
    if (codeA && codeB && codeA === codeB) return true
    const nameA = normalizeShoppingItemName(a.name)
    const nameB = normalizeShoppingItemName(b.name)
    if (!nameA || nameA !== nameB) return false
    const unitA = resolveAppUnit(a.unit)
    const unitB = resolveAppUnit(b.unit)
    if (unitA === unitB) return true
    // Same product name with package counted as kpl vs stored as weight/volume
    // (e.g. legacy "400 g" row vs new "1 kpl" scan).
    return unitA === 'kpl' || unitB === 'kpl'
}

const packageSizeOf = (item) => {
    const fromFood = Number(item?.foodId?.packageQuantity)
    if (Number.isFinite(fromFood) && fromFood > 0) return fromFood
    const fromItem = Number(item?.packageQuantity)
    if (Number.isFinite(fromItem) && fromItem > 0) return fromItem
    return 0
}

/**
 * Align units before merging quantities. Prefer kpl (package count) when one
 * side is already kpl and the other is a packaged mass/volume amount.
 */
export const alignShoppingItemsForMerge = (existing, incoming) => {
    const existingUnit = resolveAppUnit(existing?.unit)
    const incomingUnit = resolveAppUnit(incoming?.unit)
    if (existingUnit === incomingUnit) {
        return { existing, incoming }
    }

    const packageSize =
        packageSizeOf(existing) || packageSizeOf(incoming) || 0

    if (incomingUnit === 'kpl' && existingUnit !== 'kpl' && packageSize > 0) {
        const grams = positive(existing?.quantity) || 0
        const packages = Math.max(1, roundMoney(grams / packageSize) || 1)
        return {
            existing: { ...existing, quantity: packages, unit: 'kpl' },
            incoming,
        }
    }

    if (existingUnit === 'kpl' && incomingUnit !== 'kpl' && packageSize > 0) {
        const grams = positive(incoming?.quantity) || 0
        const packages = Math.max(1, roundMoney(grams / packageSize) || 1)
        return {
            existing,
            incoming: { ...incoming, quantity: packages, unit: 'kpl' },
        }
    }

    return { existing, incoming }
}

/** Find an existing shopping-list row for the same product. */
export const findMatchingShoppingListItem = (items, candidate) => {
    if (!candidate) return null
    return (items || []).find((item) => sameShoppingProduct(item, candidate)) || null
}

export const mergedShoppingQuantity = (existing, incoming) => {
    const current = positive(existing?.quantity) || 1
    const added = positive(incoming?.quantity) || 1
    return roundMoney(current + added) || current + added
}

/** User-entered row price only (not estimates). */
export const mergedShoppingPrice = (existing, incoming, newQuantity) => {
    const existingQty = positive(existing?.quantity) || 1
    const incomingQty = positive(incoming?.quantity) || 1
    const existingPrice = positive(existing?.price)
    const incomingPrice = positive(incoming?.price)
    if (existingPrice > 0 && incomingPrice > 0) {
        return roundMoney(existingPrice + incomingPrice)
    }
    if (existingPrice > 0 && existingQty > 0) {
        return roundMoney(existingPrice * (newQuantity / existingQty))
    }
    if (incomingPrice > 0 && incomingQty > 0) {
        return roundMoney(incomingPrice * (newQuantity / incomingQty))
    }
    return 0
}

const displayedLineTotal = (item) =>
    positive(item?.price) ||
    positive(item?.priceEstimate) ||
    positive(item?.estimatedPrice) ||
    0

/**
 * Build shopping-list item updates after confirming a duplicate merge.
 * Scales a user price when present; otherwise omits price so the server can
 * re-estimate for the new quantity (sending price: 0 would wipe the estimate).
 */
export const buildDuplicateMergeUpdates = (existing, incoming) => {
    const aligned = alignShoppingItemsForMerge(existing, incoming)
    const newQuantity = mergedShoppingQuantity(
        aligned.existing,
        aligned.incoming
    )
    const unit = resolveAppUnit(
        aligned.existing?.unit || aligned.incoming?.unit
    )
    const userPrice = mergedShoppingPrice(
        aligned.existing,
        aligned.incoming,
        newQuantity
    )
    const updates = {
        quantity: newQuantity,
        unit,
    }
    if (userPrice > 0) {
        updates.price = userPrice
    }

    // Scale the visible line total (user price or estimate) to the new quantity.
    const existingQty = positive(aligned.existing?.quantity) || 1
    const existingTotal = displayedLineTotal(aligned.existing)
    const incomingTotal = displayedLineTotal(aligned.incoming)
    let priceEstimate = 0
    if (!(userPrice > 0)) {
        if (existingTotal > 0 && existingQty > 0) {
            priceEstimate = roundMoney(
                existingTotal * (newQuantity / existingQty)
            )
        } else if (incomingTotal > 0) {
            const incomingQty = positive(aligned.incoming?.quantity) || 1
            priceEstimate = roundMoney(
                incomingTotal * (newQuantity / incomingQty)
            )
        }
        if (priceEstimate > 0) {
            updates.priceEstimate = priceEstimate
            updates.priceEstimateSource =
                aligned.existing?.priceEstimateSource ||
                aligned.incoming?.priceEstimateSource ||
                'history'
        }
    }

    return {
        aligned,
        updates,
        priceEstimate,
        priceEstimateSource: updates.priceEstimateSource,
    }
}

/**
 * Collapse duplicate rows into one item each (sum quantities / prices).
 * Keeps the first occurrence's identity.
 */
export const collapseDuplicateShoppingListItems = (items = []) => {
    const collapsed = []
    let didMerge = false

    for (const item of items) {
        const existing = collapsed.find((kept) =>
            sameShoppingProduct(kept, item)
        )
        if (!existing) {
            collapsed.push({ ...item })
            continue
        }
        didMerge = true
        const { updates, priceEstimate, priceEstimateSource } =
            buildDuplicateMergeUpdates(existing, item)
        existing.quantity = updates.quantity
        existing.unit = updates.unit
        // Stay unbought unless every merged row was already bought.
        existing.bought = Boolean(existing.bought) && Boolean(item.bought)
        if (updates.price > 0) {
            existing.price = updates.price
            existing.priceEstimate = undefined
            existing.priceEstimateSource = undefined
        } else {
            // Keep a line total scaled to the merged quantity. Clearing these
            // fields made the server re-estimate from a single package.
            existing.price = 0
            existing.priceEstimate = priceEstimate > 0 ? priceEstimate : undefined
            existing.priceEstimateSource =
                priceEstimate > 0 ? priceEstimateSource : undefined
        }
    }

    return { items: collapsed, didMerge }
}
