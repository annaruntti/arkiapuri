import { normalizeItemName } from './foodSearchDedupe'
import {
    mapOpenFoodFactsToFoodItemFields,
    shoppingListLineFromMappedPackage,
} from './openFoodFactsMapper'

/**
 * Build quantity/unit args for the OFF → food-items API call.
 */
export const buildOpenFoodFactsAddArgs = (
    product,
    { location, overrides = {}, shoppingListId, mealId } = {}
) => {
    const mapped = mapOpenFoodFactsToFoodItemFields(product)
    const shoppingLine =
        location === 'shopping-list'
            ? shoppingListLineFromMappedPackage(mapped, {
                  quantity: overrides.quantity,
                  unit: overrides.unit,
              })
            : null

    return {
        mapped,
        shoppingLine,
        apiBody: {
            location,
            quantity: shoppingLine
                ? shoppingLine.quantity
                : overrides.quantity || mapped.packageQuantity || 1,
            unit: shoppingLine
                ? shoppingLine.unit
                : overrides.unit || mapped.unit || 'kpl',
            shoppingListId,
            mealId,
        },
    }
}

/**
 * Map an OFF add response into a shopping-list row for the parent to merge.
 */
export const buildShoppingListItemFromOffAdd = ({
    data,
    product,
    mapped,
    shoppingLine,
    overrides = {},
}) => {
    const line =
        shoppingLine ||
        shoppingListLineFromMappedPackage(mapped, {
            quantity: overrides.quantity,
            unit: overrides.unit,
        })
    const foodPrice = parseFloat(data.foodItem.price) || 0
    const overridePrice = Number(overrides.price) || 0
    const overrideEstimate = Number(overrides.priceEstimate) || 0
    const priceEstimate =
        overrideEstimate > 0
            ? overrideEstimate
            : overridePrice > 0
              ? 0
              : foodPrice > 0
                ? foodPrice
                : 0
    const { _id: foodCatalogId, ...foodFields } = data.foodItem || {}

    return {
        ...foodFields,
        foodId: foodCatalogId,
        name: overrides.name || data.foodItem.name,
        quantity: line.quantity,
        unit: line.unit,
        price: overridePrice,
        priceEstimate,
        priceEstimateSource:
            overrides.priceEstimateSource ||
            (priceEstimate > 0 ? 'history' : undefined),
        calories:
            overrides.calories != null
                ? overrides.calories
                : data.foodItem.calories || 0,
        category: overrides.category || data.foodItem.category || [],
        barcode:
            product.barcode || data.foodItem.openFoodFactsData?.barcode,
        packageQuantity:
            line.packageQuantity || data.foodItem.packageQuantity,
    }
}

/**
 * Parse barcode-review confirm fields into add overrides / manual fallback.
 */
export const parseBarcodeReviewConfirm = ({
    name,
    quantity,
    unit,
    price,
    priceIsEstimate,
    calories,
    category,
    review,
}) => {
    const foundName = normalizeItemName(review?.name)
    const chosenName = normalizeItemName(name)
    const parsedPrice = parseFloat(String(price ?? '').replace(',', '.'))
    const hasPositivePrice =
        Number.isFinite(parsedPrice) && parsedPrice > 0
    const userPrice =
        priceIsEstimate || !hasPositivePrice ? 0 : parsedPrice
    const details = {
        name,
        quantity,
        unit,
        price: userPrice,
        priceEstimate:
            priceIsEstimate && hasPositivePrice ? parsedPrice : 0,
        priceEstimateSource:
            priceIsEstimate && hasPositivePrice ? 'history' : undefined,
        calories,
        category,
    }
    const renamed = Boolean(chosenName && chosenName !== foundName)
    const manualItem = renamed
        ? {
              name,
              barcode: review.barcode,
              quantity,
              unit,
              price: userPrice,
              priceEstimate: details.priceEstimate,
              priceEstimateSource: details.priceEstimateSource,
              calories: calories || 0,
              category: category || [],
              source: 'manual',
          }
        : null

    return { details, renamed, manualItem }
}
