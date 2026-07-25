import axios from 'axios'
import { getServerUrl } from './getServerUrl'
import storage from './storage'

export const checkFoodItemsAvailability = async (foodItems = []) => {
    const token = await storage.getItem('userToken')

    return Promise.all(
        foodItems.map(async (item) => {
            try {
                const availabilityResponse = await axios.post(
                    getServerUrl('/food-items/check-availability'),
                    { name: item.name },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                const availability = availabilityResponse.data

                return {
                    ...item,
                    availability: {
                        inPantry: availability?.inPantry === true,
                        inShoppingList: availability?.inShoppingList === true,
                        pantryQuantity: availability?.pantryQuantity || 0,
                        shoppingListQuantity:
                            availability?.shoppingListQuantity || 0,
                    },
                }
            } catch (error) {
                console.error(
                    'Error checking availability for',
                    item.name,
                    error
                )
                return {
                    ...item,
                    availability: {
                        inPantry: false,
                        inShoppingList: false,
                    },
                }
            }
        })
    )
}
