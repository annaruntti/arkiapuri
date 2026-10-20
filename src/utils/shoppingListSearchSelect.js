import { shoppingListLineFromMappedPackage } from './openFoodFactsMapper'
import { resolveAppUnit } from './units'

/**
 * Map a UnifiedFoodSearch selection into a shopping-list add payload.
 */
export const buildShoppingListItemFromSearchSelect = (selectedItem) => {
    const line = shoppingListLineFromMappedPackage(
        {
            unit: selectedItem.unit,
            packageQuantity: selectedItem.packageQuantity,
        },
        resolveAppUnit(selectedItem.unit) === 'kpl'
            ? {
                  quantity: selectedItem.quantity,
                  unit: selectedItem.unit,
              }
            : {}
    )

    return {
        name: selectedItem.name,
        unit: line.unit,
        price: selectedItem.price || 0,
        priceEstimate: selectedItem.priceEstimate || 0,
        priceEstimateSource: selectedItem.priceEstimateSource,
        calories: selectedItem.calories || 0,
        category: selectedItem.category || [],
        quantity: line.quantity,
        location: 'shopping-list',
        foodId: selectedItem.foodId || selectedItem._id,
        barcode:
            selectedItem.barcode || selectedItem.openFoodFactsData?.barcode,
        image: selectedItem.image,
        openFoodFactsData: selectedItem.openFoodFactsData,
        source: selectedItem.source,
        packageQuantity: selectedItem.packageQuantity,
    }
}
