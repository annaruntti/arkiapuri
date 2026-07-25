import { getServerUrl } from '../utils/getServerUrl'
import { getAuthHeaders } from './foodItemApi'

export const addPantryItem = async (pantryItemData) => {
    const response = await fetch(`${getServerUrl('')}/pantry/items`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(pantryItemData),
    })

    const data = await response.json()
    if (!data.success) {
        throw new Error(data.message || 'Failed to add to pantry')
    }

    return data
}

export const addShoppingListItems = async (shoppingListId, items) => {
    const response = await fetch(
        `${getServerUrl('')}/shopping-lists/${shoppingListId}/items`,
        {
            method: 'POST',
            headers: await getAuthHeaders(),
            body: JSON.stringify({ items }),
        }
    )

    const data = await response.json()
    if (!data.success) {
        throw new Error(data.message || 'Failed to add to shopping list')
    }

    return data
}
