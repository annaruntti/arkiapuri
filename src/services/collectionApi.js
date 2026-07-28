import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import { getAuthHeaders } from './foodItemApi'

const authConfig = async () => ({
    headers: await getAuthHeaders(),
})

export const getPantryItems = async () => {
    const response = await axios.get(getServerUrl('/pantry'), await authConfig())
    const data = response.data

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch pantry')
    }

    return data.pantry?.items || data.items || []
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
        getServerUrl(`/shopping-lists/${listId}/items/${itemId}/move-to-pantry`),
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
    try {
        const response = await axios.post(
            getServerUrl(`/shopping-lists/${listId}/items/move-to-pantry`),
            { itemIds },
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

        for (const itemId of itemIds) {
            try {
                const data = await moveShoppingListItemToPantry(listId, itemId)
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
        getServerUrl(`/shopping-lists/${listId}/items/${itemId}/bought`),
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
        getServerUrl(`/shopping-lists/${listId}/items/${itemId}`),
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
        getServerUrl(`/shopping-lists/${listId}/items/${itemId}`),
        updates,
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to update shopping list item')
    }

    return data
}

export const addShoppingListItems = async (shoppingListId, items) => {
    const response = await axios.post(
        getServerUrl(`/shopping-lists/${shoppingListId}/items`),
        { items },
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to add to shopping list')
    }

    return data
}
