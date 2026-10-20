import { Alert } from 'react-native'

import {
    deleteShoppingListItem,
    setShoppingListItemBought,
} from '../services/collectionApi'
import {
    getBoughtShoppingItemIds,
    resolveCheckedShoppingItems,
} from '../utils/shoppingListCheckedActions'

/**
 * Batch bought / delete actions for checked shopping-list rows.
 */
const useShoppingListCheckedBatch = ({
    shoppingList,
    getListItemId,
    setCheckedItems,
    setLoading,
    applyListUpdate,
}) => {
    const setCheckedBought = async (checkedItemIds, bought) => {
        setLoading(true)
        let firstError = null
        const updatedIds = []

        for (const rawItemId of checkedItemIds) {
            const itemId = String(rawItemId)
            try {
                const data = await setShoppingListItemBought(
                    shoppingList._id,
                    itemId,
                    bought
                )
                await applyListUpdate(data)
                updatedIds.push(itemId)
            } catch (error) {
                console.error('Error updating bought status:', itemId, error)
                if (!firstError) firstError = error
            }
        }

        setCheckedItems((prev) =>
            prev.filter((id) => !updatedIds.includes(String(id)))
        )

        if (firstError) {
            Alert.alert('Virhe', 'Ostettu-tilan päivitys epäonnistui osittain')
        }

        setLoading(false)
    }

    const deleteCheckedItems = async (checkedItemIds) => {
        setLoading(true)
        let firstError = null
        const deletedIds = []

        const { itemIds } = resolveCheckedShoppingItems(
            shoppingList.items,
            checkedItemIds,
            getListItemId
        )
        if (itemIds.length === 0) {
            setCheckedItems([])
            setLoading(false)
            Alert.alert('Huomio', 'Valittuja tuotteita ei löytynyt listalta')
            return
        }

        for (const itemId of itemIds) {
            try {
                const data = await deleteShoppingListItem(
                    shoppingList._id,
                    itemId
                )
                await applyListUpdate(data)
                deletedIds.push(itemId)
            } catch (error) {
                console.error('Error deleting item:', itemId, error)
                if (!firstError) firstError = error
            }
        }

        setCheckedItems((prev) =>
            prev.filter((id) => !deletedIds.includes(String(id)))
        )

        if (firstError) {
            Alert.alert(
                'Virhe',
                deletedIds.length > 0
                    ? 'Osa tuotteista poistettiin, mutta kaikki eivät onnistuneet'
                    : 'Tuotteiden poisto epäonnistui'
            )
        }

        setLoading(false)
    }

    const restoreBoughtItemsToList = async () => {
        const boughtIds = getBoughtShoppingItemIds(
            shoppingList.items,
            getListItemId
        )
        if (boughtIds.length === 0) return
        await setCheckedBought(boughtIds, false)
    }

    const deleteBoughtItemsFromList = async () => {
        const boughtIds = getBoughtShoppingItemIds(
            shoppingList.items,
            getListItemId
        )
        if (boughtIds.length === 0) return
        await deleteCheckedItems(boughtIds)
    }

    return {
        setCheckedBought,
        deleteCheckedItems,
        restoreBoughtItemsToList,
        deleteBoughtItemsFromList,
    }
}

export default useShoppingListCheckedBatch
