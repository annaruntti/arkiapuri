import axios from 'axios'
import { getServerUrl } from './getServerUrl'
import storage from './storage'
import { resolveAppUnit } from './units'

const emptyAvailability = {
    inPantry: false,
    inShoppingList: false,
    pantryQuantity: 0,
    pantryUnit: 'kpl',
    shoppingListQuantity: 0,
    shoppingListUnit: 'kpl',
}

export const mapAvailabilityFromApi = (availability) => ({
    inPantry: availability?.inPantry === true,
    inShoppingList: availability?.inShoppingList === true,
    pantryQuantity: availability?.pantryQuantity || 0,
    pantryUnit: resolveAppUnit(availability?.pantryUnit),
    shoppingListQuantity: availability?.shoppingListQuantity || 0,
    shoppingListUnit: resolveAppUnit(availability?.shoppingListUnit),
})

const resolveFoodId = (item) => {
    const raw = item?.foodId
    if (raw && typeof raw === 'object') {
        return String(raw._id || raw.id || '')
    }
    if (raw) return String(raw)
    return item?._id ? String(item._id) : ''
}

const isPersistedFoodId = (id) =>
    typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)

const itemMatchesAvailability = (item, candidate) => {
    if (item.tempId && candidate.tempId && item.tempId === candidate.tempId) {
        return true
    }
    const itemId = resolveFoodId(item)
    const candidateId = resolveFoodId(candidate)
    if (itemId && candidateId && itemId === candidateId) return true
    return Boolean(item.name && candidate.name && item.name === candidate.name)
}

export const mergeFoodItemAvailability = (
    currentItems = [],
    itemsWithAvailability = []
) =>
    currentItems.map((item) => {
        const match = itemsWithAvailability.find((candidate) =>
            itemMatchesAvailability(item, candidate)
        )
        return match ? { ...item, availability: match.availability } : item
    })

export const checkFoodItemsAvailability = async (foodItems = []) => {
    const token = await storage.getItem('userToken')
    if (!token) {
        return foodItems.map((item) => ({
            ...item,
            availability: { ...emptyAvailability },
        }))
    }

    return Promise.all(
        foodItems.map(async (item) => {
            try {
                const foodId = resolveFoodId(item)
                const availabilityResponse = await axios.post(
                    getServerUrl('/food-items/check-availability'),
                    {
                        name: item.name,
                        ...(isPersistedFoodId(foodId) ? { foodId } : {}),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                return {
                    ...item,
                    availability: mapAvailabilityFromApi(
                        availabilityResponse.data
                    ),
                }
            } catch (error) {
                console.error(
                    'Error checking availability for',
                    item.name,
                    error
                )
                return {
                    ...item,
                    availability: { ...emptyAvailability },
                }
            }
        })
    )
}
