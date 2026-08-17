const toNumber = (value) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

/** Scale factor from per-100g/ml values to the ingredient quantity. */
export const getNutritionScaleFactor = (quantity, unit) => {
    const qty = toNumber(quantity)
    const normalized = String(unit || '')
        .toLowerCase()
        .trim()

    if (qty <= 0) return 0
    if (normalized === 'g' || normalized === 'ml') return qty / 100
    if (normalized === 'kg' || normalized === 'l') return (qty * 1000) / 100
    if (normalized === 'dl') return qty
    // kpl / other: treat labeled values as per piece / portion
    return qty
}

const pickNutrition = (item) => {
    const nested =
        item?.nutrition ||
        item?.openFoodFactsData?.nutrition ||
        item?.foodId?.nutrition ||
        item?.foodId?.openFoodFactsData?.nutrition ||
        {}

    return {
        calories: toNumber(
            item?.calories ?? nested.calories ?? item?.foodId?.calories
        ),
        proteins: toNumber(nested.proteins),
        carbohydrates: toNumber(nested.carbohydrates),
        sugars: toNumber(nested.sugars),
        fat: toNumber(nested.fat),
        saturatedFat: toNumber(nested.saturatedFat),
        fiber: toNumber(nested.fiber),
        salt: toNumber(nested.salt),
    }
}

export const summarizeMealNutrition = (foodItems = []) => {
    const totals = {
        calories: 0,
        proteins: 0,
        carbohydrates: 0,
        sugars: 0,
        fat: 0,
        saturatedFat: 0,
        fiber: 0,
        salt: 0,
    }

    for (const item of foodItems) {
        if (item?.isFood === false) continue
        const scale = getNutritionScaleFactor(item.quantity, item.unit)
        if (scale <= 0) continue
        const nutrition = pickNutrition(item)
        for (const key of Object.keys(totals)) {
            totals[key] += nutrition[key] * scale
        }
    }

    return totals
}

export const summarizeMealNutritionPerServing = (foodItems = [], servings) => {
    const totals = summarizeMealNutrition(foodItems)
    const count = Math.max(1, parseInt(servings, 10) || 1)
    return Object.fromEntries(
        Object.entries(totals).map(([key, value]) => [key, value / count])
    )
}

export const formatNutritionValue = (value, digits = 0) => {
    const num = toNumber(value)
    if (num <= 0) return null
    return digits > 0 ? num.toFixed(digits) : String(Math.round(num))
}
