import { updateShoppingList } from '../services/collectionApi'
import storage from './storage'
import {
    collapseDuplicateShoppingListItems,
    shoppingListItemsToUpdatePayload,
} from './shoppingListDuplicate'

/**
 * Collapse duplicate lines and persist (or apply locally for guests).
 * @returns {'skipped'|'guest'|'ok'}
 */
export const persistShoppingListDuplicateCollapse = async ({
    shoppingList,
    getListItemId,
    onUpdate,
}) => {
    const items = shoppingList?.items || []
    if (!shoppingList?._id || items.length < 2) return 'skipped'

    const { items: collapsed, didMerge } =
        collapseDuplicateShoppingListItems(items)
    if (!didMerge) return 'skipped'

    const token = await storage.getItem('userToken')
    if (!token) {
        onUpdate({ ...shoppingList, items: collapsed })
        return 'guest'
    }

    const payload = shoppingListItemsToUpdatePayload(collapsed, getListItemId)
    const data = await updateShoppingList(shoppingList._id, {
        items: payload,
    })
    onUpdate(data.shoppingList)
    return 'ok'
}
