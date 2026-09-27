import { useCallback, useEffect, useRef, useState } from 'react'
import { CommonActions, useNavigation } from '@react-navigation/native'
import {
    Alert,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import AddActionSection from './AddActionSection'
import AddFoodItemPanel from './AddFoodItemPanel'
import Button from './Button'
import CategorySectionHeader from './CategorySectionHeader'
import CustomText from './CustomText'
import FoodListItemRow from './FoodListItemRow'
import GenericFilter from './GenericFilter'
import GenericFilterSection from './GenericFilterSection'
import ListSortControl from './ListSortControl'
import ListStatsRow from './ListStatsRow'
import MissingPriceItemsPanel from './MissingPriceItemsPanel'
import DuplicateShoppingItemModal from './DuplicateShoppingItemModal'
import PantryItemDetails from './PantryItemDetails'
import ResponsiveModal from './ResponsiveModal'
import SearchSection from './SearchSection'
import StickyListLayout from './StickyListLayout'
import ShoppingListItemQuantityControl from './ShoppingListItemQuantityControl'
import { useFilteredItemList } from '../hooks/useFilteredItemList'
import {
    addShoppingListItems,
    deleteShoppingListItem,
    moveShoppingListItemsToPantry,
    setShoppingListItemBought,
    updateShoppingList,
    updateShoppingListItem,
} from '../services/collectionApi'
import { findOrCreateFoodItem } from '../services/foodItemApi'
import {
    SHOPPING_SORT_OPTIONS,
    SORT_OPTION_IDS,
} from '../utils/listSort'
import {
    formatEuro,
    formatLinePrice,
    lineAmount,
    sumLineAmounts,
} from '../utils/shoppingListPrice'
import {
    buildDuplicateMergeUpdates,
    collapseDuplicateShoppingListItems,
    findMatchingShoppingListItem,
} from '../utils/shoppingListDuplicate'
import { resolveAppUnit } from '../utils/units'
import { shoppingListLineFromMappedPackage } from '../utils/openFoodFactsMapper'
import storage from '../utils/storage'

const getListItemId = (item) => {
    if (!item) return ''
    const candidate = item._id ?? item.id
    if (candidate == null) return ''
    if (typeof candidate === 'object') {
        if (candidate.$oid) return String(candidate.$oid)
        if (typeof candidate.toHexString === 'function') {
            return candidate.toHexString()
        }
        if (candidate._id != null) return getListItemId({ _id: candidate._id })
        if (typeof candidate.toString === 'function') {
            const asString = candidate.toString()
            if (asString && asString !== '[object Object]') return asString
        }
        return ''
    }
    return String(candidate).trim()
}

const MODAL_VIEWS = {
    LIST: 'list',
    ITEM_DETAILS: 'itemDetails',
}

const ShoppingListDetail = ({
    shoppingList,
    resetView,
    onClose,
    onUpdate,
    fetchShoppingLists,
    fetchPantryItems,
    onRequireLogin,
}) => {
    const navigation = useNavigation()
    const [checkedItems, setCheckedItems] = useState([])
    const checkedItemsRef = useRef(checkedItems)
    checkedItemsRef.current = checkedItems
    const [modalView, setModalView] = useState(MODAL_VIEWS.LIST)
    const [showAddItem, setShowAddItem] = useState(false)
    const [showMissingPrices, setShowMissingPrices] = useState(false)
    const [duplicateMerge, setDuplicateMerge] = useState(null)
    const duplicateMergeRef = useRef(null)
    duplicateMergeRef.current = duplicateMerge
    const [addItemSession, setAddItemSession] = useState(0)
    const [autoOpenScanner, setAutoOpenScanner] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const boughtItemCount = (shoppingList?.items || []).filter(
        (item) => item.bought
    ).length
    const checkedFoodItemIds = (shoppingList?.items || [])
        .filter(
            (item) =>
                checkedItems.includes(getListItemId(item)) &&
                item.isFood !== false
        )
        .map((item) => getListItemId(item))
        .filter(Boolean)

    const resetAddAndDetails = useCallback(() => {
        setModalView(MODAL_VIEWS.LIST)
        setShowAddItem(false)
        setShowMissingPrices(false)
        if (duplicateMergeRef.current?.resolve) {
            duplicateMergeRef.current.resolve(false)
        }
        setDuplicateMerge(null)
        setSelectedItem(null)
        setAutoOpenScanner(false)
    }, [])

    useEffect(() => {
        resetAddAndDetails()
        setCheckedItems([])
    }, [shoppingList?._id, resetView, resetAddAndDetails])

    // Drop stale checkbox ids after list rows are rebuilt (merge / refresh).
    useEffect(() => {
        const validIds = new Set(
            (shoppingList?.items || []).map(getListItemId).filter(Boolean)
        )
        setCheckedItems((prev) => prev.filter((id) => validIds.has(String(id))))
    }, [shoppingList?.items])

    const collapsingDuplicatesRef = useRef(false)

    useEffect(() => {
        let cancelled = false

        const mergeExistingDuplicates = async () => {
            const items = shoppingList?.items || []
            if (!shoppingList?._id || items.length < 2) return
            if (collapsingDuplicatesRef.current) return

            const { items: collapsed, didMerge } =
                collapseDuplicateShoppingListItems(items)
            if (!didMerge) return

            collapsingDuplicatesRef.current = true
            try {
                const token = await storage.getItem('userToken')
                if (!token) {
                    if (cancelled) return
                    onUpdate({ ...shoppingList, items: collapsed })
                    return
                }

                const payload = collapsed.map((item) => ({
                    _id: getListItemId(item) || undefined,
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: item.category || [],
                    calories: item.calories || 0,
                    price: item.price || 0,
                    priceEstimate:
                        Number(item.priceEstimate) > 0
                            ? Number(item.priceEstimate)
                            : undefined,
                    priceEstimateSource:
                        Number(item.priceEstimate) > 0
                            ? item.priceEstimateSource || 'history'
                            : undefined,
                    foodId: item.foodId?._id || item.foodId,
                    isFood: item.isFood !== false,
                    bought: Boolean(item.bought),
                }))

                const data = await updateShoppingList(shoppingList._id, {
                    items: payload,
                })
                if (cancelled) return
                onUpdate(data.shoppingList)
            } catch (error) {
                console.warn(
                    'Failed to merge duplicate shopping list items:',
                    error?.message || error
                )
            } finally {
                collapsingDuplicatesRef.current = false
            }
        }

        mergeExistingDuplicates()
        return () => {
            cancelled = true
        }
        // Re-check when the item set changes (ids / count), not on every
        // object identity change from parent re-renders.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        shoppingList?._id,
        (shoppingList?.items || []).map(getListItemId).join(','),
        onUpdate,
    ])

    const {
        searchQuery,
        setSearchQuery,
        selectedCategoryFilters,
        setSelectedCategoryFilters,
        showFilters,
        setShowFilters,
        ingredientCategories,
        toggleCategoryFilter,
        getCategoryItemCounts,
        filteredItems,
        itemSections,
        sortId,
        setSortId,
    } = useFilteredItemList({
        items: shoppingList?.items || [],
        defaultSortId: SORT_OPTION_IDS.NAME_ASC,
    })

    const goToListView = () => {
        resetAddAndDetails()
    }

    const syncUpdatedListToPicker = () => {
        if (!shoppingList) return
        const picker = navigation
            .getState()
            ?.routes?.find((route) => route.name === 'Ostoslista')
        if (!picker?.key) return
        navigation.dispatch({
            ...CommonActions.setParams({
                updatedShoppingList: shoppingList,
            }),
            source: picker.key,
        })
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            const isNavigate = e.data.action.type === 'NAVIGATE'

            if (
                (showAddItem ||
                    showMissingPrices ||
                    modalView !== MODAL_VIEWS.LIST) &&
                !isNavigate
            ) {
                e.preventDefault()
                resetAddAndDetails()
                return
            }

            if (isNavigate) {
                resetAddAndDetails()
                syncUpdatedListToPicker()
                return
            }

            e.preventDefault()
            onClose?.()
        })
        return unsubscribe
    }, [navigation, modalView, showAddItem, showMissingPrices, onClose, shoppingList, resetAddAndDetails])

    const openAddItemView = async ({ openScanner = false } = {}) => {
        const token = await storage.getItem('userToken')
        if (!token && onRequireLogin) {
            onRequireLogin('shopping_list', () => {
                setAutoOpenScanner(openScanner)
                setAddItemSession((value) => value + 1)
                setShowAddItem(true)
            })
            return
        }
        setAutoOpenScanner(openScanner)
        setAddItemSession((value) => value + 1)
        setShowAddItem(true)
    }

    const handleCheckItem = (item) => {
        const itemId = getListItemId(item)
        if (!itemId) return

        setCheckedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        )
    }

    const applyListUpdate = async (data) => {
        if (data?.shoppingList) {
            onUpdate(data.shoppingList)
        }
        const refreshedLists = await fetchShoppingLists()
        if (Array.isArray(refreshedLists) && shoppingList?._id) {
            const refreshed = refreshedLists.find(
                (list) => String(list._id) === String(shoppingList._id)
            )
            if (refreshed) {
                onUpdate(refreshed)
            }
        }
    }

    const moveCheckedToPantry = async (checkedItemIds) => {
        if (!shoppingList?._id) return

        // Prefer latest selection from ref (avoids stale press closures).
        const rawIds =
            Array.isArray(checkedItemIds) && checkedItemIds.length > 0
                ? checkedItemIds
                : checkedItemsRef.current

        // Resolve selection against the current list so we always send real
        // shopping-list item ids (not stale/food ids).
        const selectedIds = new Set(
            (rawIds || []).map((id) => String(id).trim()).filter(Boolean)
        )
        const selectedItems = (shoppingList.items || []).filter((item) =>
            selectedIds.has(getListItemId(item))
        )
        const itemIds = [
            ...new Set(selectedItems.map((item) => getListItemId(item))),
        ]
        if (itemIds.length === 0) {
            Alert.alert('Huomio', 'Valittuja tuotteita ei löytynyt listalta')
            setCheckedItems([])
            return
        }

        const nameById = Object.fromEntries(
            selectedItems.map((item) => [getListItemId(item), item.name])
        )

        setLoading(true)
        try {
            const data = await moveShoppingListItemsToPantry(
                shoppingList._id,
                itemIds
            )
            const moved = Array.isArray(data.moved) ? data.moved : []
            const skippedNonFood = Array.isArray(data.skippedNonFood)
                ? data.skippedNonFood
                : []
            const removedNonFood = Array.isArray(data.removedNonFood)
                ? data.removedNonFood
                : skippedNonFood
            const notFound = Array.isArray(data.notFound) ? data.notFound : []

            const clearedIdSet = new Set(
                [...moved, ...removedNonFood]
                    .map((item) => String(item.id).trim())
                    .filter(Boolean)
            )
            setCheckedItems((prev) =>
                prev.filter((id) => !clearedIdSet.has(String(id).trim()))
            )
            // Trust the batch response list — a follow-up refetch can race
            // and briefly reintroduce items if the DB write was still flushing.
            if (data?.shoppingList) {
                onUpdate(data.shoppingList)
            } else {
                await applyListUpdate(data)
            }
            if (moved.length > 0 && typeof fetchPantryItems === 'function') {
                await fetchPantryItems()
            }

            if (moved.length > 0 || removedNonFood.length > 0) {
                const movedNames = moved
                    .map(
                        (item) =>
                            item.name || nameById[String(item.id)] || ''
                    )
                    .filter(Boolean)
                const removedNames = removedNonFood
                    .map(
                        (item) =>
                            item.name || nameById[String(item.id)] || ''
                    )
                    .filter(Boolean)
                const parts = []
                if (moved.length > 0) {
                    parts.push(
                        `${moved.length} elintarviketta pentteriin${
                            movedNames.length
                                ? `: ${movedNames.join(', ')}`
                                : ''
                        }`
                    )
                }
                if (removedNonFood.length > 0) {
                    parts.push(
                        `${removedNonFood.length} muuta tuotetta poistettu listalta${
                            removedNames.length
                                ? `: ${removedNames.join(', ')}`
                                : ''
                        }`
                    )
                }
                if (notFound.length > 0) {
                    parts.push(
                        `${notFound.length} valintaa ei löytynyt listalta`
                    )
                }
                Alert.alert('Onnistui', parts.join('. ') + '.')
            } else if (skippedNonFood.length > 0) {
                Alert.alert(
                    'Huomio',
                    'Muut tuotteet eivät siirry pentteriin. Poista ne listalta tai merkitse ostetuiksi.'
                )
            } else {
                Alert.alert(
                    'Huomio',
                    notFound.length > 0
                        ? 'Valittuja tuotteita ei löytynyt listalta. Kokeile valita uudelleen.'
                        : 'Valittuja tuotteita ei voitu siirtää'
                )
            }
        } catch (error) {
            console.error('Error moving items to pantry:', error)
            Alert.alert('Virhe', 'Tuotteiden siirto pentteriin epäonnistui')
        } finally {
            setLoading(false)
        }
    }

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

    const restoreBoughtItemsToList = async () => {
        const boughtIds = (shoppingList.items || [])
            .filter((item) => item.bought)
            .map((item) => getListItemId(item))
            .filter(Boolean)
        if (boughtIds.length === 0) return
        await setCheckedBought(boughtIds, false)
    }

    const deleteBoughtItemsFromList = async () => {
        const boughtIds = (shoppingList.items || [])
            .filter((item) => item.bought)
            .map((item) => getListItemId(item))
            .filter(Boolean)
        if (boughtIds.length === 0) return
        await deleteCheckedItems(boughtIds)
    }

    const deleteCheckedItems = async (checkedItemIds) => {
        setLoading(true)
        let firstError = null
        const deletedIds = []

        // Resolve against current list so we never call delete with a stale
        // FoodItem id left over from barcode add / merge.
        const selectedIds = new Set(
            (checkedItemIds || []).map((id) => String(id).trim()).filter(Boolean)
        )
        const selectedItems = (shoppingList.items || []).filter((item) =>
            selectedIds.has(getListItemId(item))
        )
        const itemIds = [
            ...new Set(selectedItems.map((item) => getListItemId(item))),
        ]
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

    const toggleItemBought = async (item) => {
        const itemId = getListItemId(item)
        if (!itemId) return
        try {
            const data = await setShoppingListItemBought(
                shoppingList._id,
                itemId,
                !item.bought
            )
            await applyListUpdate(data)
        } catch (error) {
            console.error('Error toggling bought:', error)
            Alert.alert('Virhe', 'Ostettu-tilan päivitys epäonnistui')
        }
    }

    const setItemQuantity = async (item, nextQuantity, nextUnit) => {
        const itemId = getListItemId(item)
        if (!itemId) return
        const updates = {}
        if (nextQuantity !== undefined) {
            const next = Number(nextQuantity)
            if (!Number.isFinite(next) || next <= 0) {
                await removeItem(item)
                return
            }
            updates.quantity = next
        }
        if (nextUnit !== undefined) {
            updates.unit = resolveAppUnit(nextUnit)
        }
        if (Object.keys(updates).length === 0) return
        try {
            const data = await updateShoppingListItem(
                shoppingList._id,
                itemId,
                updates
            )
            await applyListUpdate(data)
        } catch (error) {
            console.error('Error adjusting quantity:', error)
            Alert.alert('Virhe', 'Määrän päivitys epäonnistui')
        }
    }

    const removeItem = async (item) => {
        const itemId = getListItemId(item)
        if (!itemId) return
        try {
            const data = await deleteShoppingListItem(shoppingList._id, itemId)
            await applyListUpdate(data)
            setCheckedItems((prev) => prev.filter((id) => id !== itemId))
        } catch (error) {
            console.error('Error deleting item:', error)
            Alert.alert('Virhe', 'Tuotteen poisto epäonnistui')
        }
    }

    const handleAddItem = async (itemData) => {
        try {
            // Food catalog / barcode payloads use FoodItem._id — never treat it
            // as the shopping-list row id.
            const { _id: _ignoredCatalogId, ...itemWithoutRowId } =
                itemData || {}
            const incoming = {
                ...itemWithoutRowId,
                isFood: itemData.isFood !== false,
                quantity: itemData.quantity || 1,
                unit: itemData.unit || 'kpl',
            }

            const existing = findMatchingShoppingListItem(
                shoppingList?.items,
                incoming
            )
            if (existing) {
                // Close the add-product sheet first so the confirm dialog is
                // visible (it was previously covered by "Lisää tuote").
                setShowAddItem(false)
                setAutoOpenScanner(false)
                const shouldIncrease = await new Promise((resolve) => {
                    setDuplicateMerge({ existing, incoming, resolve })
                })
                if (!shouldIncrease) return

                const { updates, priceEstimate, priceEstimateSource } =
                    buildDuplicateMergeUpdates(existing, incoming)
                const itemId = getListItemId(existing)
                const token = await storage.getItem('userToken')

                if (!token) {
                    const updatedList = {
                        ...shoppingList,
                        items: (shoppingList.items || []).map((item) =>
                            getListItemId(item) === itemId
                                ? {
                                      ...item,
                                      ...updates,
                                      ...(updates.price > 0
                                          ? {
                                                priceEstimate: undefined,
                                                priceEstimateSource: undefined,
                                            }
                                          : priceEstimate > 0
                                            ? {
                                                  price: 0,
                                                  priceEstimate,
                                                  priceEstimateSource,
                                              }
                                            : {}),
                                  }
                                : item
                        ),
                    }
                    onUpdate(updatedList)
                    goToListView()
                    return
                }

                const data = await updateShoppingListItem(
                    shoppingList._id,
                    itemId,
                    updates
                )
                // Ensure the visible line total matches the merged quantity even
                // if the API response still has a stale single-item estimate.
                if (
                    data?.shoppingList &&
                    !(updates.price > 0) &&
                    priceEstimate > 0
                ) {
                    const patchedItems = (data.shoppingList.items || []).map(
                        (item) =>
                            getListItemId(item) === itemId
                                ? {
                                      ...item,
                                      quantity:
                                          updates.quantity ?? item.quantity,
                                      unit: updates.unit || item.unit,
                                      priceEstimate,
                                      priceEstimateSource:
                                          priceEstimateSource ||
                                          item.priceEstimateSource ||
                                          'history',
                                  }
                                : item
                    )
                    onUpdate({
                        ...data.shoppingList,
                        items: patchedItems,
                    })
                } else {
                    onUpdate(data.shoppingList)
                }
                goToListView()
                return
            }

            const token = await storage.getItem('userToken')

            // Guest mode: keep items on the local shopping list only
            if (!token) {
                const guestItem = {
                    ...incoming,
                    _id:
                        itemData._id ||
                        `guest-item-${Date.now()}-${Math.random()
                            .toString(36)
                            .slice(2, 8)}`,
                    foodId: itemData.foodId || itemData._id,
                    location: 'shopping-list',
                    bought: false,
                }
                const updatedList = {
                    ...shoppingList,
                    items: [...(shoppingList.items || []), guestItem],
                }
                onUpdate(updatedList)
                goToListView()
                return
            }

            // Keep quantities in sync on the list row only, without ever
            // resending the whole shopping list (which could resurrect
            // already-removed items if this component's local state happened
            // to be stale).
            let foodItemId = itemData.foodId

            if (!foodItemId) {
                try {
                    const foodItemResult = await findOrCreateFoodItem({
                        name: itemData.name,
                        isFood: itemData.isFood !== false,
                        category: itemData.category || [],
                        unit: itemData.unit || 'kpl',
                        price: itemData.price || 0,
                        calories: itemData.calories || 0,
                    })
                    foodItemId = foodItemResult.foodItem?._id
                } catch (foodItemError) {
                    console.error('Error creating food item:', foodItemError)
                    // Continue without foodId
                }
            }

            const newItem = {
                ...incoming,
                foodId: foodItemId,
                location: 'shopping-list',
            }

            const data = await addShoppingListItems(shoppingList._id, [
                newItem,
            ])
            onUpdate(data.shoppingList)
            goToListView()
        } catch (error) {
            console.error('Error adding item:', error?.response?.data || error)
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const handleSearchItemSelect = async (selectedItem, meta = {}) => {
        try {
            // Transform the selected food item to shopping list item format.
            // Barcode / OFF products may already have a FoodItem id but are
            // not yet on this list — handleAddItem checks for duplicates.
            // Packaged goods are counted in kpl (packages), not grams/ml.
            const line = shoppingListLineFromMappedPackage(
                {
                    unit: selectedItem.unit,
                    packageQuantity: selectedItem.packageQuantity,
                },
                resolveAppUnit(selectedItem.unit) === 'kpl'
                    ? {
                          quantity: selectedItem.quantity,
                          unit: selectedItem.unit,
                      }
                    : {}
            )
            const itemData = {
                name: selectedItem.name,
                unit: line.unit,
                price: selectedItem.price || 0,
                priceEstimate: selectedItem.priceEstimate || 0,
                priceEstimateSource: selectedItem.priceEstimateSource,
                calories: selectedItem.calories || 0,
                category: selectedItem.category || [],
                quantity: line.quantity,
                location: 'shopping-list',
                foodId: selectedItem.foodId || selectedItem._id,
                barcode:
                    selectedItem.barcode ||
                    selectedItem.openFoodFactsData?.barcode,
                image: selectedItem.image,
                openFoodFactsData: selectedItem.openFoodFactsData,
                source: selectedItem.source,
                packageQuantity: selectedItem.packageQuantity,
            }

            await handleAddItem(itemData)
        } catch (error) {
            console.error('Error adding searched item:', error)
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const handleItemPress = (item) => {
        toggleItemBought(item)
    }

    const handleItemDetailsPress = (item) => {
        setSelectedItem(item)
        setModalView(MODAL_VIEWS.ITEM_DETAILS)
    }

    const handleUpdateItem = async (itemId, updatedData, options = {}) => {
        try {
            // Find the item in the shopping list (read-only, just to fill in
            // gaps for FoodItem creation below — we never resend the whole
            // items array, only the single-item update endpoint).
            const currentItem = shoppingList.items.find(
                (item) => getListItemId(item) === String(itemId)
            )
            if (!currentItem) {
                Alert.alert('Virhe', 'Tuotetta ei löytynyt')
                return
            }

            if (updatedData.price !== undefined) {
                const parsedPrice = parseFloat(
                    String(updatedData.price).replace(',', '.')
                )
                updatedData.price =
                    Number.isFinite(parsedPrice) && parsedPrice > 0
                        ? parsedPrice
                        : 0
            }

            let foodItemId = currentItem.foodId?._id || currentItem.foodId

            // If foodId is being updated (from image upload), extract the ID
            if (updatedData.foodId && typeof updatedData.foodId === 'object') {
                foodItemId = updatedData.foodId._id || updatedData.foodId
                updatedData.foodId = foodItemId
            }

            // If there's no foodId but we need one (e.g., for image upload), find or create a FoodItem
            if (!foodItemId && (updatedData.image || updatedData.category)) {
                try {
                    const foodItemResult = await findOrCreateFoodItem({
                        name: updatedData.name || currentItem.name,
                        category:
                            updatedData.category || currentItem.category || [],
                        unit: updatedData.unit || currentItem.unit || 'kpl',
                        price: updatedData.price || currentItem.price || 0,
                        calories:
                            updatedData.calories || currentItem.calories || 0,
                    })
                    foodItemId = foodItemResult.foodItem?._id
                    if (foodItemId) {
                        updatedData.foodId = foodItemId
                    }
                } catch (foodItemError) {
                    console.error('Error creating food item:', foodItemError)
                    // Continue with update even if food item creation fails
                }
            }

            const data = await updateShoppingListItem(
                shoppingList._id,
                itemId,
                updatedData
            )
            onUpdate(data.shoppingList)
            if (!options.keepView) {
                goToListView()
            }
        } catch (error) {
            console.error('Error updating item:', error)
            console.error('Error response:', error.response?.data)
            Alert.alert('Virhe', 'Tuotteen päivitys epäonnistui')
        }
    }

    const renderItem = ({ item }) => (
        <FoodListItemRow
            variant="card"
            item={item}
            style={styles.listCard}
            bought={Boolean(item.bought)}
            showImageInfoIcon
            detail={formatLinePrice(item)}
            hideQuantityInDetails
            onPress={() => handleItemPress(item)}
            onImagePress={() => handleItemDetailsPress(item)}
            onLongPress={() => handleCheckItem(item)}
            trailingAction={
                <View style={styles.itemTrailing}>
                    <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => handleCheckItem(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons
                            name={
                                checkedItems.includes(getListItemId(item))
                                    ? 'check-box'
                                    : 'check-box-outline-blank'
                            }
                            size={22}
                            color="#000000"
                        />
                    </TouchableOpacity>
                    <ShoppingListItemQuantityControl
                        quantity={item.quantity}
                        unit={item.unit}
                        onChange={({ quantity, unit }) =>
                            setItemQuantity(item, quantity, unit)
                        }
                        onDelete={() => removeItem(item)}
                    />
                </View>
            }
        />
    )

    return (
        <View style={styles.container}>
            {!shoppingList ? null : modalView === MODAL_VIEWS.ITEM_DETAILS && selectedItem ? (
                <PantryItemDetails
                    item={selectedItem}
                    embedded
                    onClose={goToListView}
                    onUpdate={handleUpdateItem}
                />
            ) : (
                <View style={styles.container}>
                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#5844BB" />
                        </View>
                    )}

                    <StickyListLayout
                        chromeBackgroundColor="#f9fafb"
                        style={styles.listLayout}
                        contentContainerStyle={
                            checkedItems.length > 0
                                ? styles.scrollContentWithFloatingBar
                                : undefined
                        }
                        header={
                            <>
                                <View style={styles.header}>
                                    <CustomText style={styles.title}>
                                        {shoppingList.name}
                                    </CustomText>
                                    <CustomText style={styles.description}>
                                        {shoppingList.description}
                                    </CustomText>
                                </View>
                                <AddActionSection
                                    title="Lisää tuotteita"
                                    hint="Skannaa tuotteen viivakoodi, tai lisää tuote manuaalisesti."
                                    primaryTitle="Skannaa viivakoodi"
                                    primaryIcon="qr-code-scanner"
                                    onPrimaryPress={() =>
                                        openAddItemView({
                                            openScanner: true,
                                        })
                                    }
                                    secondaryTitle="Lisää manuaalisesti"
                                    onSecondaryPress={() =>
                                        openAddItemView()
                                    }
                                />
                            </>
                        }
                        sticky={
                            <View style={styles.findSection}>
                                <SearchSection
                                    heading="Etsi tuotteita"
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onClearSearch={() => setSearchQuery('')}
                                    placeholder="Hae ostoslistasta..."
                                    showResultsInfo={false}
                                />
                            </View>
                        }
                    >
                        <View style={styles.itemsListContainer}>
                            {(() => {
                                const listItems = shoppingList.items || []
                                const missingPriceItems = listItems.filter(
                                    (item) => lineAmount(item).missing
                                )
                                const showsOpenPrices = listItems.some(
                                    (item) => lineAmount(item).openPrices
                                )
                                const totalPrice = (() => {
                                    const visibleSum =
                                        sumLineAmounts(filteredItems)
                                    const isFiltered =
                                        searchQuery.length > 0 ||
                                        selectedCategoryFilters.length > 0
                                    if (isFiltered) return visibleSum
                                    return (
                                        visibleSum ||
                                        shoppingList.totalEstimatedPrice ||
                                        0
                                    )
                                })()
                                const hasMissingPrices =
                                    missingPriceItems.length > 0

                                return (
                                    <>
                                        <View style={styles.totalPriceRow}>
                                            <CustomText
                                                style={styles.totalPriceText}
                                            >
                                                Kokonaishinta:{' '}
                                                {formatEuro(totalPrice)}
                                            </CustomText>
                                            {hasMissingPrices ? (
                                                <Button
                                                    title={`Lisää puuttuvia hintoja (${missingPriceItems.length})`}
                                                    type="SECONDARY"
                                                    size="small"
                                                    onPress={() =>
                                                        setShowMissingPrices(
                                                            true
                                                        )
                                                    }
                                                    style={
                                                        styles.missingPricesButton
                                                    }
                                                    textStyle={
                                                        styles.missingPricesButtonText
                                                    }
                                                />
                                            ) : null}
                                        </View>
                                        <ListStatsRow
                                            actions={
                                                <>
                                                    <ListSortControl
                                                        options={
                                                            SHOPPING_SORT_OPTIONS
                                                        }
                                                        value={sortId}
                                                        onChange={setSortId}
                                                    />
                                                    <GenericFilter
                                                        selectedFilters={
                                                            selectedCategoryFilters
                                                        }
                                                        showFilters={
                                                            showFilters
                                                        }
                                                        onToggleShowFilters={() =>
                                                            setShowFilters(
                                                                !showFilters
                                                            )
                                                        }
                                                    />
                                                </>
                                            }
                                        >
                                            <CustomText>Tuotteita:</CustomText>
                                            <CustomText>
                                                {searchQuery.length > 0 ||
                                                selectedCategoryFilters.length >
                                                    0
                                                    ? `${filteredItems.length} / ${shoppingList.items?.length || 0}`
                                                    : `${shoppingList.items?.length || 0} kpl`}
                                            </CustomText>
                                        </ListStatsRow>
                                        {showsOpenPrices ? (
                                            <View style={styles.priceNotice}>
                                                <CustomText
                                                    style={
                                                        styles.priceNoticeText
                                                    }
                                                >
                                                    Osa hinta-arvioista on Open
                                                    Prices -aineistosta (ODbL).
                                                </CustomText>
                                            </View>
                                        ) : null}
                                    </>
                                )
                            })()}
                            <GenericFilterSection
                                selectedFilters={selectedCategoryFilters}
                                showFilters={showFilters}
                                filterTitle="Suodata kategorioittain:"
                                categories={ingredientCategories}
                                onToggleFilter={toggleCategoryFilter}
                                onClearFilters={() =>
                                    setSelectedCategoryFilters([])
                                }
                                getItemCounts={getCategoryItemCounts}
                            />
                            <View
                                style={[
                                    styles.itemsList,
                                    styles.listContent,
                                ]}
                            >
                                {itemSections.map((section) => (
                                    <View
                                        key={
                                            section.title ||
                                            'shopping-section'
                                        }
                                    >
                                        <CategorySectionHeader
                                            title={section.title}
                                            count={section.data.length}
                                        />
                                        {section.data.map((item) => (
                                            <View key={item._id}>
                                                {renderItem({ item })}
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                            {boughtItemCount > 0 && (
                                <View style={styles.listEndActions}>
                                    <Button
                                        title={`Palauta kerätyt (${boughtItemCount})`}
                                        type="SECONDARY"
                                        fullWidth
                                        onPress={restoreBoughtItemsToList}
                                        style={styles.listEndActionButton}
                                    />
                                    <Button
                                        title={`Poista kerätyt (${boughtItemCount})`}
                                        type="TERTIARY"
                                        fullWidth
                                        onPress={deleteBoughtItemsFromList}
                                        style={styles.listEndActionButton}
                                    />
                                </View>
                            )}
                        </View>
                    </StickyListLayout>

                    {checkedItems.length > 0 && (
                        <View
                            style={[
                                styles.floatingActionBar,
                                { pointerEvents: 'box-none' },
                            ]}
                        >
                            <View style={styles.floatingActionBarInner}>
                                {checkedFoodItemIds.length > 0 && (
                                    <Button
                                        title={`Siirrä pentteriin (${checkedFoodItemIds.length})`}
                                        type="PRIMARY"
                                        fullWidth
                                        onPress={() =>
                                            moveCheckedToPantry(
                                                checkedFoodItemIds
                                            )
                                        }
                                        style={styles.floatingActionButton}
                                    />
                                )}
                                <Button
                                    title={`Poista valitut (${checkedItems.length})`}
                                    type="TERTIARY"
                                    fullWidth
                                    onPress={() =>
                                        deleteCheckedItems(checkedItems)
                                    }
                                    style={[
                                        styles.floatingActionButton,
                                        styles.floatingTertiaryButton,
                                    ]}
                                />
                            </View>
                        </View>
                    )}
                </View>
            )}

            <ResponsiveModal
                visible={showAddItem}
                onClose={goToListView}
                title="Lisää tuote"
                maxWidth={640}
            >
                <AddFoodItemPanel
                    key={addItemSession}
                    location="shopping-list"
                    shoppingListId={shoppingList?._id}
                    onSelectItem={handleSearchItemSelect}
                    onSubmitNewItem={handleAddItem}
                    onCloseForm={goToListView}
                    showFormBackButton={false}
                    autoOpenScanner={autoOpenScanner}
                />
            </ResponsiveModal>

            <ResponsiveModal
                visible={showMissingPrices}
                onClose={() => setShowMissingPrices(false)}
                title="Puuttuvat hinnat"
                maxWidth={640}
            >
                <MissingPriceItemsPanel
                    items={(shoppingList?.items || []).filter(
                        (item) => lineAmount(item).missing
                    )}
                    onSavePrice={async (item, price) => {
                        await handleUpdateItem(getListItemId(item), { price }, {
                            keepView: true,
                        })
                    }}
                    onOpenDetails={(item) => {
                        setShowMissingPrices(false)
                        handleItemDetailsPress(item)
                    }}
                    onClose={() => setShowMissingPrices(false)}
                />
            </ResponsiveModal>

            <DuplicateShoppingItemModal
                visible={Boolean(duplicateMerge)}
                existing={duplicateMerge?.existing}
                incoming={duplicateMerge?.incoming}
                onConfirm={() => {
                    duplicateMerge?.resolve?.(true)
                    setDuplicateMerge(null)
                }}
                onCancel={() => {
                    duplicateMerge?.resolve?.(false)
                    setDuplicateMerge(null)
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    listLayout: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    formWrapper: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    listCard: {
        backgroundColor: '#ffffff',
    },
    formHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 15,
    },
    backButton: {
        padding: 5,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    listEndActions: {
        width: '100%',
        gap: 10,
        marginTop: 16,
        marginBottom: 8,
    },
    listEndActionButton: {
        width: '100%',
        minHeight: 45,
        paddingVertical: 7,
        paddingHorizontal: 14,
    },
    itemsListContainer: {
        flex: 1,
        minHeight: 400,
    },
    findSection: {
        backgroundColor: '#f9fafb',
        paddingTop: 4,
    },
    findHeading: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    itemsList: {
        width: '100%',
        zIndex: 1,
    },
    header: {
        marginBottom: 5,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        marginBottom: 5,
        color: '#666',
    },
    listContent: {
        paddingBottom: 20,
    },
    checkboxContainer: {
        marginLeft: 10,
    },
    itemTrailing: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#AE9CFC',
        width: '100%',
        marginBottom: 10,
    },
    smallPrimaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        minWidth: 150,
        marginBottom: 10,
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        width: '100%',
        marginBottom: 10,
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        minHeight: 40,
        borderWidth: 2,
        borderColor: '#5844BB',
        whiteSpace: 'nowrap',
    },
    floatingActionBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        paddingHorizontal: 0,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 16 : 10,
        backgroundColor: 'transparent',
    },
    floatingActionBarInner: {
        width: '100%',
        gap: 10,
        alignItems: 'stretch',
    },
    floatingActionButton: {
        width: '100%',
        alignSelf: 'stretch',
        marginTop: 0,
        marginBottom: 0,
        minHeight: 45,
        paddingVertical: 7,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 4,
        ...(Platform.OS === 'web' && {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
        }),
    },
    floatingTertiaryButton: {
        backgroundColor: '#fff',
    },
    scrollContentWithFloatingBar: {
        paddingBottom: 120,
    },
    addItemButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 15,
    },
    halfWidthButton: {
        flex: 1,
        marginTop: 0,
        marginBottom: 10,
    },
    thirdWidthButton: {
        flex: 1,
        marginTop: 0,
        marginBottom: 10,
        marginHorizontal: 2,
    },
    infoTitle: {
        paddingTop: 10,
        marginBottom: 5,
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 16,
    },
    infoText: {
        paddingTop: 10,
        marginBottom: 10,
        fontSize: 14,
        textAlign: 'left',
    },
    searchAndAddContainerDesktop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 15,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
        elevation: 2,
        zIndex: 9998,
        position: 'relative',
    },
    searchAndAddContainerMobile: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 15,
        marginBottom: 15,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
        elevation: 2,
        zIndex: 9998,
        position: 'relative',
    },
    searchContainer: {
        flex: 1,
    },
    manualAddContainer: {
        justifyContent: 'center',
    },
    desktopPrimaryButton: {
        maxWidth: 300,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    priceNotice: {
        marginTop: 0,
        marginBottom: 8,
        gap: 8,
    },
    priceNoticeText: {
        fontSize: 14,
        textAlign: 'left',
        color: '#333',
    },
    totalPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        width: '100%',
        marginBottom: 14,
    },
    totalPriceText: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        textAlign: 'left',
    },
    missingPricesButton: {
        flexGrow: 0,
        flexShrink: 1,
        maxWidth: '58%',
        minHeight: 40,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
    },
    missingPricesButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
})

export default ShoppingListDetail
