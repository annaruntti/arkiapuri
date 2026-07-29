import { useEffect, useRef, useState } from 'react'
import {
    Alert,
    Platform,
    ScrollView,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import AddFoodItemPanel from './AddFoodItemPanel'
import Button from './Button'
import CategorySectionHeader from './CategorySectionHeader'
import CustomText from './CustomText'
import FoodListItemRow from './FoodListItemRow'
import GenericFilter from './GenericFilter'
import GenericFilterSection from './GenericFilterSection'
import ListSortControl from './ListSortControl'
import PantryItemDetails from './PantryItemDetails'
import ResponsiveModal from './ResponsiveModal'
import SearchSection from './SearchSection'
import ShoppingListItemQuantityControl from './ShoppingListItemQuantityControl'
import { useFilteredItemList } from '../hooks/useFilteredItemList'
import {
    addShoppingListItems,
    deleteShoppingListItem,
    moveShoppingListItemsToPantry,
    setShoppingListItemBought,
    updateShoppingListItem,
} from '../services/collectionApi'
import { findOrCreateFoodItem } from '../services/foodItemApi'
import {
    SHOPPING_SORT_OPTIONS,
    SORT_OPTION_IDS,
} from '../utils/listSort'
import { useResponsiveDimensions } from '../utils/responsive'

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
    ADD_ITEM: 'addItem',
    ITEM_DETAILS: 'itemDetails',
}

const ShoppingListDetail = ({
    shoppingList,
    visible,
    onClose,
    onUpdate,
    fetchShoppingLists,
    fetchPantryItems,
    onRequireLogin,
}) => {
    const [checkedItems, setCheckedItems] = useState([])
    const checkedItemsRef = useRef(checkedItems)
    checkedItemsRef.current = checkedItems
    const [modalView, setModalView] = useState(MODAL_VIEWS.LIST)
    const [loading, setLoading] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const { isDesktop } = useResponsiveDimensions()
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

    useEffect(() => {
        if (!visible) {
            setModalView(MODAL_VIEWS.LIST)
            setSelectedItem(null)
            setCheckedItems([])
        }
    }, [visible])

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
        setModalView(MODAL_VIEWS.LIST)
        setSelectedItem(null)
    }

    const handleModalClose = () => {
        if (modalView !== MODAL_VIEWS.LIST) {
            goToListView()
            return
        }
        onClose?.()
    }

    const modalTitle =
        modalView === MODAL_VIEWS.ADD_ITEM
            ? 'Lisää tuote ostoslistaan'
            : modalView === MODAL_VIEWS.ITEM_DETAILS
              ? 'Tuotteen tiedot'
              : 'Ostoslistan tiedot'
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

        for (const rawItemId of checkedItemIds) {
            const itemId = String(rawItemId)
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

    const adjustItemQuantity = async (item, delta) => {
        const itemId = getListItemId(item)
        if (!itemId) return
        const current = Number(item.quantity) || 0
        const next = Math.max(0, current + delta)
        if (next <= 0) {
            await removeItem(item)
            return
        }
        try {
            const data = await updateShoppingListItem(shoppingList._id, itemId, {
                quantity: next,
            })
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
            const token = await storage.getItem('userToken')

            // Guest mode: keep items on the local shopping list only
            if (!token) {
                const guestItem = {
                    ...itemData,
                    _id:
                        itemData._id ||
                        `guest-item-${Date.now()}-${Math.random()
                            .toString(36)
                            .slice(2, 8)}`,
                    isFood: itemData.isFood !== false,
                    foodId: itemData.foodId || itemData._id,
                    location: 'shopping-list',
                    quantity: itemData.quantity || 1,
                    unit: itemData.unit || 'kpl',
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

            // Find or create a FoodItem so we can attach images later and
            // keep quantities in sync, without ever resending the whole
            // shopping list (which could resurrect already-removed items
            // if this component's local state happened to be stale).
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
                        location: 'shopping-list',
                        quantities: {
                            meal: 0,
                            'shopping-list': itemData.quantity || 1,
                            pantry: 0,
                        },
                    })
                    foodItemId = foodItemResult.foodItem?._id
                } catch (foodItemError) {
                    console.error('Error creating food item:', foodItemError)
                    // Continue without foodId
                }
            }

            const newItem = {
                ...itemData,
                isFood: itemData.isFood !== false,
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
            // Open Food Facts products (and any other item UnifiedFoodSearch
            // already persisted) are fully added — FoodItem created AND
            // attached to this shopping list — before this callback fires.
            // Adding it again here would create a duplicate shopping list
            // entry (and a duplicate/incorrect quantity, defaulting to 1).
            // We only need to refresh so the new item shows up.
            if (meta.alreadyAdded) {
                await fetchShoppingLists()
                goToListView()
                return
            }

            // Transform the selected food item to shopping list item format
            const itemData = {
                name: selectedItem.name,
                unit: selectedItem.unit || 'kpl',
                price: selectedItem.price || 0,
                calories: selectedItem.calories || 0,
                category: selectedItem.category || [],
                quantity:
                    selectedItem.quantities?.['shopping-list'] ||
                    selectedItem.quantity ||
                    selectedItem.packageQuantity ||
                    1,
                location: 'shopping-list',
                foodId: selectedItem._id,
                image: selectedItem.image,
                openFoodFactsData: selectedItem.openFoodFactsData,
                source: selectedItem.source,
                _id: selectedItem._id,
            }

            // Add the item to the shopping list
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

    const handleUpdateItem = async (itemId, updatedData) => {
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
                        location: 'shopping-list',
                        quantities: {
                            meal: 0,
                            'shopping-list':
                                updatedData.quantity ||
                                currentItem.quantity ||
                                1,
                            pantry: 0,
                        },
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
            goToListView()
        } catch (error) {
            console.error('Error updating item:', error)
            console.error('Error response:', error.response?.data)
            Alert.alert('Virhe', 'Tuotteen päivitys epäonnistui')
        }
    }

    const renderItem = ({ item }) => (
        <FoodListItemRow
            item={item}
            bought={Boolean(item.bought)}
            showImageInfoIcon
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
                        onIncrease={() => adjustItemQuantity(item, 1)}
                        onDecrease={() => adjustItemQuantity(item, -1)}
                        onDelete={() => removeItem(item)}
                    />
                </View>
            }
        />
    )

    return (
        <ResponsiveModal
            visible={visible}
            onClose={handleModalClose}
            title={modalTitle}
            showBackButton={modalView !== MODAL_VIEWS.LIST}
            maxWidth={800}
        >
            {!shoppingList ? null : modalView === MODAL_VIEWS.ADD_ITEM ? (
                <AddFoodItemPanel
                    location="shopping-list"
                    shoppingListId={shoppingList._id}
                    onSelectItem={handleSearchItemSelect}
                    onSubmitNewItem={handleAddItem}
                    onCloseForm={goToListView}
                    showFormBackButton={false}
                />
            ) : modalView === MODAL_VIEWS.ITEM_DETAILS && selectedItem ? (
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

                    <ScrollView
                        style={styles.mainScrollView}
                        stickyHeaderIndices={[1]}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={
                            checkedItems.length > 0 || boughtItemCount > 0
                                ? styles.scrollContentWithFloatingBar
                                : undefined
                        }
                    >
                        <View style={styles.headerSection}>
                            <View style={styles.header}>
                                <CustomText style={styles.title}>
                                    {shoppingList.name}
                                </CustomText>
                                <CustomText style={styles.description}>
                                    {shoppingList.description}
                                </CustomText>
                            </View>

                            <CustomText style={styles.infoTitle}>
                                Hae ja lisää tuotteita
                            </CustomText>
                            <CustomText style={styles.infoText}>
                                Hae tuotteita nimellä tai skannaa viivakoodi.
                                Tulokset sisältävät sekä omat tuotteesi että
                                Open Food Facts -tietokannan.
                            </CustomText>
                        </View>

                        <SearchSection
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onClearSearch={() => setSearchQuery('')}
                            placeholder="Hae ostoslistasta..."
                            resultsCount={filteredItems.length}
                            resultsText="Löytyi {count} tuotetta"
                            noResultsText="Tuotteita ei löytynyt"
                            showButtonSection={true}
                            buttonTitle="+ Luo uusi tuote"
                            onButtonPress={() =>
                                setModalView(MODAL_VIEWS.ADD_ITEM)
                            }
                            buttonStyle={styles.smallPrimaryButton}
                            buttonTextStyle={styles.buttonText}
                            filterComponent={
                                <GenericFilter
                                    selectedFilters={selectedCategoryFilters}
                                    showFilters={showFilters}
                                    onToggleShowFilters={() =>
                                        setShowFilters(!showFilters)
                                    }
                                    buttonText="Suodata"
                                />
                            }
                        />

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

                        <View style={styles.itemsListContainer}>
                            <View style={styles.stats}>
                                <View style={styles.statsTextColumn}>
                                    <CustomText>
                                        Tuotteita:{' '}
                                        {searchQuery.length > 0 ||
                                        selectedCategoryFilters.length > 0
                                            ? `${filteredItems.length} / ${shoppingList.items?.length || 0}`
                                            : `${shoppingList.items?.length || 0} kpl`}
                                    </CustomText>
                                    <CustomText>
                                        Kokonaishinta:{' '}
                                        {filteredItems &&
                                        filteredItems.length > 0
                                            ? filteredItems
                                                  .reduce(
                                                      (sum, item) =>
                                                          sum +
                                                          (parseFloat(
                                                              item.price
                                                          ) || 0),
                                                      0
                                                  )
                                                  .toFixed(2)
                                            : shoppingList.totalEstimatedPrice ||
                                              0}
                                        €
                                    </CustomText>
                                </View>
                                <ListSortControl
                                    options={SHOPPING_SORT_OPTIONS}
                                    value={sortId}
                                    onChange={setSortId}
                                />
                            </View>
                            <SectionList
                                sections={itemSections}
                                renderItem={renderItem}
                                renderSectionHeader={({
                                    section: { title, data },
                                }) => (
                                    <CategorySectionHeader
                                        title={title}
                                        count={data.length}
                                    />
                                )}
                                keyExtractor={(item) => item._id}
                                style={styles.itemsList}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={true}
                                scrollEnabled={false}
                                nestedScrollEnabled={true}
                                stickySectionHeadersEnabled={false}
                            />
                        </View>
                    </ScrollView>

                    {(checkedItems.length > 0 || boughtItemCount > 0) && (
                        <View
                            style={[
                                styles.floatingActionBar,
                                isDesktop && styles.desktopFloatingActionBar,
                            ]}
                            pointerEvents="box-none"
                        >
                            <View
                                style={[
                                    styles.floatingActionBarInner,
                                    isDesktop &&
                                        styles.desktopFloatingActionBarInner,
                                ]}
                            >
                                {checkedItems.length > 0 && (
                                    <>
                                        {checkedFoodItemIds.length > 0 && (
                                            <Button
                                                title={`Siirrä pentteriin (${checkedFoodItemIds.length})`}
                                                type="PRIMARY"
                                                size="small"
                                                onPress={() =>
                                                    moveCheckedToPantry(
                                                        checkedFoodItemIds
                                                    )
                                                }
                                                style={
                                                    styles.floatingActionButton
                                                }
                                                textStyle={
                                                    styles.floatingActionButtonText
                                                }
                                            />
                                        )}
                                        <Button
                                            title={`Poista valitut (${checkedItems.length})`}
                                            type="TERTIARY"
                                            size="small"
                                            onPress={() =>
                                                deleteCheckedItems(checkedItems)
                                            }
                                            style={[
                                                styles.floatingActionButton,
                                                styles.floatingTertiaryButton,
                                            ]}
                                            textStyle={
                                                styles.floatingActionButtonText
                                            }
                                        />
                                    </>
                                )}
                                {boughtItemCount > 0 && (
                                    <>
                                        <Button
                                            title={`Palauta kerätyt (${boughtItemCount})`}
                                            type="SECONDARY"
                                            size="small"
                                            onPress={restoreBoughtItemsToList}
                                            style={[
                                                styles.floatingActionButton,
                                                styles.floatingSecondaryButton,
                                            ]}
                                            textStyle={
                                                styles.floatingActionButtonText
                                            }
                                        />
                                        <Button
                                            title={`Poista kerätyt (${boughtItemCount})`}
                                            type="TERTIARY"
                                            size="small"
                                            onPress={deleteBoughtItemsFromList}
                                            style={[
                                                styles.floatingActionButton,
                                                styles.floatingTertiaryButton,
                                            ]}
                                            textStyle={
                                                styles.floatingActionButtonText
                                            }
                                        />
                                    </>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            )}
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formWrapper: {
        flex: 1,
        backgroundColor: '#fff',
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
    mainScrollView: {
        flex: 1,
        zIndex: 1,
    },
    headerSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 5,
        paddingTop: 10,
        paddingBottom: 10,
    },
    stickySearchSection: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 2,
        marginBottom: 5,
        zIndex: 10000,
        position: 'relative',
    },
    itemsListContainer: {
        flex: 1,
        minHeight: 400,
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
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        zIndex: 5,
        position: 'relative',
        overflow: 'visible',
    },
    statsTextColumn: {
        flex: 1,
        gap: 2,
        paddingRight: 8,
    },
    listContent: {
        paddingBottom: 20,
    },
    itemRow: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    checkboxContainer: {
        marginLeft: 10,
    },
    itemTrailing: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
    },
    itemCategories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        marginTop: 5,
    },
    category: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 12,
        fontSize: 12,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        width: '100%',
        marginBottom: 10,
    },
    smallPrimaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
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
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 16 : 10,
        backgroundColor: 'transparent',
    },
    desktopFloatingActionBar: {
        paddingHorizontal: 24,
        paddingBottom: 14,
    },
    floatingActionBarInner: {
        width: '100%',
        gap: 6,
        alignItems: 'stretch',
    },
    desktopFloatingActionBarInner: {
        maxWidth: 280,
        alignSelf: 'center',
        width: '100%',
    },
    floatingActionButton: {
        width: '100%',
        marginTop: 0,
        marginBottom: 0,
        minHeight: 34,
        paddingVertical: 6,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 4,
        ...(Platform.OS === 'web' && {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
        }),
    },
    floatingSecondaryButton: {
        backgroundColor: '#38E4D9',
        borderWidth: 0,
    },
    floatingTertiaryButton: {
        backgroundColor: '#fff',
    },
    floatingActionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000000',
        textAlign: 'center',
    },
    scrollContentWithFloatingBar: {
        paddingBottom: 160,
    },
    fullWidthActionButton: {
        width: '100%',
        marginTop: 0,
        marginBottom: 0,
    },
    desktopActionButton: {
        width: '100%',
        maxWidth: 300,
        alignSelf: 'center',
        marginTop: 0,
        marginBottom: 0,
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
        backgroundColor: 'rgb(248, 248, 248)',
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
        backgroundColor: 'rgb(248, 248, 248)',
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

    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
})

export default ShoppingListDetail
