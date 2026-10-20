import axios from 'axios'
import { normalizeCategoryArray } from './foodCategory'
import { isPersistedFoodItemId, resolveCatalogFoodId } from './foodItemId'
import { getServerUrl } from './getServerUrl'
import { getIngredientQuantity } from './mealFoodItem'
import openFoodFactsApi from '../services/openFoodFactsApi'

/**
 * Resolve meal draft rows into persisted { foodId, quantity, unit } refs.
 */
export const resolveMealFoodItemRefs = async (foodItems, token) => {
    const headers = { Authorization: `Bearer ${token}` }

    return Promise.all(
        foodItems.map(async (item) => {
            try {
                const mealQuantity = getIngredientQuantity(item)
                const existingId = resolveCatalogFoodId(item)
                if (isPersistedFoodItemId(existingId)) {
                    return {
                        foodId: existingId,
                        quantity: mealQuantity || 1,
                        unit: item.unit || 'kpl',
                    }
                }

                const barcode =
                    item.barcode || item.openFoodFactsData?.barcode
                if (barcode) {
                    try {
                        const offData = await openFoodFactsApi.addToFoodItems(
                            barcode,
                            {
                                location: 'meal',
                                quantity: mealQuantity || 1,
                                unit: item.unit || 'kpl',
                            }
                        )
                        if (offData.success && offData.foodItem?._id) {
                            return {
                                foodId: offData.foodItem._id,
                                quantity: mealQuantity || 1,
                                unit:
                                    item.unit ||
                                    offData.foodItem.unit ||
                                    'kpl',
                            }
                        }
                    } catch (offError) {
                        console.warn(
                            'OFF add from meal draft failed:',
                            offError
                        )
                    }
                }

                const findOrCreateResponse = await axios.post(
                    getServerUrl('/food-items/find-or-create'),
                    {
                        name: item.name,
                        unit: item.unit || 'kpl',
                        category: normalizeCategoryArray(item.category),
                        calories: parseInt(item.calories) || 0,
                        price: parseFloat(item.price) || 0,
                    },
                    { headers }
                )

                const foodItem = findOrCreateResponse.data.foodItem
                return {
                    foodId: foodItem._id,
                    quantity: mealQuantity || 1,
                    unit: item.unit || foodItem.unit || 'kpl',
                }
            } catch (error) {
                throw new Error(
                    `Failed to process food item ${item.name}: ${error.message}`
                )
            }
        })
    )
}
