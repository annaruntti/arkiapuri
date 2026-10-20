import { processFormCategories } from './foodCategories'
import { buildNutritionFromFormData } from './nutritionFields'

/**
 * Build the food-item form payload from RHF data + optional multi-location qty.
 */
export const buildFoodItemFormPayload = ({
    data,
    location,
    date,
    showLocationSelector,
    selectedLocations = [],
    quantities = {},
}) => {
    const quantity = parseFloat(data.quantity) || 0
    const processedCategories = processFormCategories(data.category)
    const nutrition = buildNutritionFromFormData(data)

    const formData = {
        name: data.name,
        isFood: data.isFood !== false,
        category: data.isFood === false ? [] : processedCategories,
        unit: data.unit,
        price: parseFloat(data.price) || 0,
        calories:
            data.isFood === false ? 0 : parseFloat(data.calories) || 0,
        nutrition,
        expirationDate: data.isFood === false ? undefined : date || undefined,
        expirationDateSetByUser: Boolean(data.isFood !== false && date),
        location,
        locations: showLocationSelector ? selectedLocations : [location],
        quantity,
        quantities: {
            meal: 0,
            'shopping-list': 0,
            pantry: 0,
        },
    }

    if (showLocationSelector) {
        selectedLocations.forEach((loc) => {
            const locQuantity = parseFloat(quantities[loc]) || 0
            formData.quantities[loc] = locQuantity
        })
        formData.quantity = parseFloat(quantities[location]) || quantity
    }

    return formData
}

/** Catalog fields sent to find-or-create (no location row quantities). */
export const toCatalogFoodItemPayload = (formData) => ({
    name: formData.name,
    isFood: formData.isFood,
    category: formData.category,
    unit: formData.unit,
    price: formData.price,
    calories: formData.calories,
    nutrition: formData.nutrition,
    expirationDate: formData.expirationDate,
})
