import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import { getAuthHeaders } from './foodItemApi'

const authConfig = async () => ({
    headers: await getAuthHeaders(),
})

/** Normalize Mongo ids from string | ObjectId | { $oid } | { _id }. */
export const entityId = (value) => {
    if (value == null || value === '') return ''
    if (typeof value === 'object') {
        if (value.$oid) return String(value.$oid)
        if (value._id != null && value._id !== value) return entityId(value._id)
        if (value.id != null && value.id !== value) return entityId(value.id)
        if (typeof value.toHexString === 'function') {
            return value.toHexString()
        }
        if (typeof value.toString === 'function') {
            const asString = value.toString()
            if (asString && asString !== '[object Object]') return asString
        }
        return ''
    }
    return String(value).trim()
}

export const getPantry = async () => {
    const response = await axios.get(getServerUrl('/pantry'), await authConfig())
    const data = response.data

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch pantry')
    }

    return data.pantry || { items: [] }
}

export const getPantryItems = async () => {
    const pantry = await getPantry()
    return pantry.items || []
}

export const addPantryLocation = async (location) => {
    const response = await axios.post(
        getServerUrl('/pantry/locations'),
        location,
        await authConfig()
    )
    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Säilytyspaikan lisääminen epäonnistui')
    }
    return data
}

export const updatePantryLocation = async (locationId, updates) => {
    const response = await axios.put(
        getServerUrl(`/pantry/locations/${locationId}`),
        updates,
        await authConfig()
    )
    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Säilytyspaikan päivitys epäonnistui')
    }
    return data
}

export const deletePantryLocation = async (locationId) => {
    const response = await axios.delete(
        getServerUrl(`/pantry/locations/${locationId}`),
        await authConfig()
    )
    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Säilytyspaikan poisto epäonnistui')
    }
    return data
}

export const dismissPantryRemovalSuggestions = async (itemIds, reason) => {
    const response = await axios.post(
        getServerUrl('/pantry/removal-suggestions/dismiss'),
        { itemIds, reason },
        await authConfig()
    )
    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Ehdotusten hylkääminen epäonnistui')
    }
    return data
}

export const addPantryItem = async (pantryItemData) => {
    const response = await axios.post(
        getServerUrl('/pantry/items'),
        pantryItemData,
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to add to pantry')
    }

    return data
}

export const updatePantryItem = async (itemId, updatedData) => {
    const response = await axios.put(
        getServerUrl(`/pantry/items/${itemId}`),
        updatedData,
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to update pantry item')
    }

    return data
}

export const deletePantryItem = async (itemId) => {
    const response = await axios.delete(
        getServerUrl(`/pantry/items/${itemId}`),
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to delete pantry item')
    }

    return data
}

export const markShoppingListItemBought = async (listId, itemId) => {
    const response = await axios.post(
        getServerUrl(
            `/shopping-lists/${entityId(listId)}/items/${entityId(itemId)}/move-to-pantry`
        ),
        {},
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to move item to pantry')
    }

    return data
}

export const moveShoppingListItemToPantry = markShoppingListItemBought

export const moveShoppingListItemsToPantry = async (listId, itemIds) => {
    const normalizedListId = entityId(listId)
    const normalizedItemIds = (itemIds || []).map(entityId).filter(Boolean)
    try {
        const response = await axios.post(
            getServerUrl(
                `/shopping-lists/${normalizedListId}/items/move-to-pantry`
            ),
            { itemIds: normalizedItemIds },
            await authConfig()
        )

        const data = response.data
        if (!data.success) {
            throw new Error(data.message || 'Failed to move items to pantry')
        }

        return data
    } catch (error) {
        // Older API builds only support per-item move; fall back sequentially.
        const status = error?.response?.status
        if (status !== 404) {
            throw error
        }

        const moved = []
        const skippedNonFood = []
        const notFound = []
        let shoppingList = null

        for (const itemId of normalizedItemIds) {
            try {
                const data = await moveShoppingListItemToPantry(
                    normalizedListId,
                    itemId
                )
                shoppingList = data.shoppingList || shoppingList
                moved.push({
                    id: String(itemId),
                    name: data.moved?.[0]?.name || '',
                })
            } catch (itemError) {
                const message =
                    itemError?.response?.data?.message ||
                    itemError?.message ||
                    ''
                if (String(message).toLowerCase().includes('non-food')) {
                    skippedNonFood.push({ id: String(itemId), name: '' })
                } else if (
                    itemError?.response?.status === 404 ||
                    String(message).toLowerCase().includes('not found')
                ) {
                    notFound.push(String(itemId))
                } else {
                    throw itemError
                }
            }
        }

        return {
            success: true,
            shoppingList,
            moved,
            skippedNonFood,
            notFound,
        }
    }
}

export const setShoppingListItemBought = async (listId, itemId, bought) => {
    const response = await axios.patch(
        getServerUrl(
            `/shopping-lists/${entityId(listId)}/items/${entityId(itemId)}/bought`
        ),
        { bought: Boolean(bought) },
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to update bought status')
    }

    return data
}

export const deleteShoppingListItem = async (listId, itemId) => {
    const response = await axios.delete(
        getServerUrl(
            `/shopping-lists/${entityId(listId)}/items/${entityId(itemId)}`
        ),
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to delete shopping list item')
    }

    return data
}

export const updateShoppingListItem = async (listId, itemId, updates) => {
    const response = await axios.put(
        getServerUrl(
            `/shopping-lists/${entityId(listId)}/items/${entityId(itemId)}`
        ),
        updates,
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to update shopping list item')
    }

    return data
}

export const updateShoppingList = async (listId, updates) => {
    const response = await axios.put(
        getServerUrl(`/shopping-lists/${entityId(listId)}`),
        updates,
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to update shopping list')
    }

    return data
}

export const previewShoppingListPrices = async (items) => {
    const response = await axios.post(
        getServerUrl('/shopping-lists/price-estimates'),
        { items },
        await authConfig()
    )
    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to estimate prices')
    }
    return data.items || []
}

export const addShoppingListItems = async (shoppingListId, items) => {
    // Never send a client _id — it may be a FoodItem id from barcode add and
    // would collide with / overwrite shopping-list row identity.
    const sanitizedItems = (items || []).map((item) => {
        if (!item || typeof item !== 'object') return item
        const { _id, id, ...rest } = item
        return rest
    })
    const response = await axios.post(
        getServerUrl(`/shopping-lists/${entityId(shoppingListId)}/items`),
        { items: sanitizedItems },
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to add to shopping list')
    }

    return data
}
