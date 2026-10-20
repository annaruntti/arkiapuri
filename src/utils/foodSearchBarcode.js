import { previewShoppingListPrices } from '../services/collectionApi'
import storage from './storage'
import {
    mapOpenFoodFactsToFoodItemFields,
    shoppingListLineFromMappedPackage,
} from './openFoodFactsMapper'

/**
 * Build the barcode review draft shown before adding a shopping-list row.
 */
export const buildShoppingListBarcodeReview = (product, barcode) => {
    const mapped = mapOpenFoodFactsToFoodItemFields(product)
    const reviewBarcode =
        product.barcode || mapped.openFoodFactsData?.barcode || barcode
    const line = shoppingListLineFromMappedPackage(mapped)

    return {
        product,
        name: mapped.name,
        brands: product.brands || '',
        barcode: reviewBarcode,
        imageUrl: mapped.image?.url || product.imageUrl || null,
        quantityLabel:
            mapped.openFoodFactsData?.quantityLabel || product.quantity || '',
        category: mapped.category || [],
        calories: mapped.calories || 0,
        nutritionGrade: mapped.openFoodFactsData?.nutritionGrade || '',
        quantity: line.quantity,
        unit: line.unit,
        packageQuantity: line.packageQuantity,
        packageUnit: line.packageUnit,
        price: 0,
        priceIsEstimate: false,
    }
}

/**
 * Optionally enrich a barcode review draft with a server price estimate.
 * Returns the estimate amount, or 0 when unavailable.
 */
export const fetchBarcodeReviewPriceEstimate = async (review) => {
    const token = await storage.getItem('userToken')
    if (!token || !review) return 0

    try {
        const [estimated] = await previewShoppingListPrices([
            {
                name: review.name,
                quantity: review.quantity,
                unit: review.unit,
                category: review.category || [],
                isFood: true,
                price: 0,
                barcode: review.barcode,
                packageQuantity: review.packageQuantity,
                packageUnit: review.packageUnit,
            },
        ])
        return parseFloat(estimated?.priceEstimate) || 0
    } catch (estimateError) {
        console.warn(
            'Scanned product price estimate unavailable:',
            estimateError?.response?.status ||
                estimateError?.message ||
                estimateError
        )
        return 0
    }
}
