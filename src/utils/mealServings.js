import { getIngredientQuantity } from './mealFoodItem'

export const DEFAULT_SERVINGS = 4

export const normalizeServings = (value) => {
    const parsed = parseInt(value, 10)
    if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_SERVINGS
    return parsed
}

export const scaleIngredientQuantity = (
    quantity,
    fromServings,
    toServings
) => {
    const from = normalizeServings(fromServings)
    const to = normalizeServings(toServings)
    const qty = parseFloat(quantity)
    const base = Number.isFinite(qty) && qty > 0 ? qty : 1
    if (from === to) return base
    return Math.round(((base * to) / from) * 10000) / 10000
}

export const formatScaledQuantity = (qty) => {
    const num = parseFloat(qty)
    if (!Number.isFinite(num)) return '1'
    const rounded = Math.round(num * 100) / 100
    if (Number.isInteger(rounded)) return String(rounded)
    return String(rounded)
}

export const scaleMealFoodItems = (foodItems, fromServings, toServings) => {
    if (!Array.isArray(foodItems)) return []
    const from = normalizeServings(fromServings)
    const to = normalizeServings(toServings)
    if (from === to) return foodItems
    return foodItems.map((item) => {
        const qty = scaleIngredientQuantity(
            getIngredientQuantity(item),
            from,
            to
        )
        return {
            ...item,
            quantity: qty,
            quantities: {
                ...(item.quantities || {}),
                meal: qty,
            },
        }
    })
}

export const servingsAllativeLabel = (servings) =>
    `${normalizeServings(servings)} syöjälle`
