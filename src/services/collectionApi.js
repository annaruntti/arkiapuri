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
        getServerUrl(`/shopping-lists/${listId}/items/${itemId}/bought`),
        {},
        await authConfig()
    )

    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'Failed to move item to pantry')
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
