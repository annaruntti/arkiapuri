import { useState } from 'react'
import {
    Alert,
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
import { useFilteredItemList } from '../hooks/useFilteredItemList'
import {
    addShoppingListItems,
    markShoppingListItemBought,
    updateShoppingListItem,
} from '../services/collectionApi'
import { findOrCreateFoodItem } from '../services/foodItemApi'
import {
    SHOPPING_SORT_OPTIONS,
    SORT_OPTION_IDS,
} from '../utils/listSort'
import { useResponsiveDimensions } from '../utils/responsive'

const getListItemId = (item) => String(item?._id ?? item?.id ?? '')

const ShoppingListDetail = ({
    shoppingList,
    onUpdate,
    fetchShoppingLists,
    fetchPantryItems,
    onRequireLogin,
}) => {
    const [checkedItems, setCheckedItems] = useState([])
    const [showItemForm, setShowItemForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [showItemDetails, setShowItemDetails] = useState(false)
    const { isDesktop } = useResponsiveDimensions()

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
        items: shoppingList.items || [],
        defaultSortId: SORT_OPTION_IDS.NAME_ASC,
    })

    const handleCheckItem = (item) => {
        const itemId = getListItemId(item)
        if (!itemId) return

        setCheckedItems((prev) =>
            prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId]
        )
    }

    const moveCheckedToPantry = async (checkedItemIds) => {
        setLoading(true)
        let updatedList = shoppingList
        const movedItemIds = []
        let firstError = null

        for (const rawItemId of checkedItemIds) {
            const itemId = String(rawItemId)
            try {
                const data = await markShoppingListItemBought(
                    shoppingList._id,
                    itemId
                )

                if (data.shoppingList) {
                    updatedList = data.shoppingList
                }
                movedItemIds.push(itemId)
            } catch (error) {
                console.error('Error moving item to pantry:', itemId, error)
                console.error('Error response:', error.response?.data)
                if (!firstError) firstError = error
            }
        }

        // Keep only the items that failed checked, so the user can retry them
        setCheckedItems((prev) =>
            prev.filter((id) => !movedItemIds.includes(id))
        )

        if (movedItemIds.length > 0) {
            onUpdate(updatedList)
        }

        await fetchShoppingLists()
        await fetchPantryItems()

        if (firstError) {
            Alert.alert(
                'Virhe',
                movedItemIds.length > 0
                    ? 'Osa tuotteista siirtyi pentteriin, mutta kaikkien siirto epäonnistui'
                    : 'Tuotteiden siirto pentteriin epäonnistui'
            )
        } else {
            Alert.alert('Onnistui', 'Tuotteet siirretty pentteriin')
        }

        setLoading(false)
    }

    const handleAddItem = async (itemData) => {
        try {
            // Find or create a FoodItem so we can attach images later and
            // keep quantities in sync, without ever resending the whole
            // shopping list (which could resurrect already-removed items
            // if this component's local state happened to be stale).
            let foodItemId = itemData.foodId

            if (!foodItemId) {
                try {
                    const foodItemResult = await findOrCreateFoodItem({
                        name: itemData.name,
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
                foodId: foodItemId,
                location: 'shopping-list',
            }

            const data = await addShoppingListItems(shoppingList._id, [
                newItem,
            ])
            onUpdate(data.shoppingList)
            setShowItemForm(false)
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
                setShowItemForm(false)
                return
            }

            // Transform the selected food item to shopping list item format
            const itemData = {
                name: selectedItem.name,
                unit: selectedItem.unit || 'kpl',
                price: selectedItem.price || 0,
                calories: selectedItem.calories || 0,
                category: selectedItem.category || [],
                quantity: 1, // Default quantity
                location: 'shopping-list',
            }

            // Add the item to the shopping list
            await handleAddItem(itemData)
        } catch (error) {
            console.error('Error adding searched item:', error)
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const handleItemPress = (item) => {
        setSelectedItem(item)
        setShowItemDetails(true)
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
            setShowItemDetails(false)
        } catch (error) {
            console.error('Error updating item:', error)
            console.error('Error response:', error.response?.data)
            Alert.alert('Virhe', 'Tuotteen päivitys epäonnistui')
        }
    }

    const renderItem = ({ item }) => (
        <FoodListItemRow
            item={item}
            onPress={() => handleItemPress(item)}
            onLongPress={() => handleCheckItem(item)}
            trailingAction={
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
                        size={24}
                        color={
                            checkedItems.includes(getListItemId(item))
                                ? '#38E4D9'
                                : '#666'
                        }
                    />
                </TouchableOpacity>
            }
        />
    )

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#5844BB" />
                </View>
            )}

            <ResponsiveModal
                visible={showItemForm}
                onClose={() => setShowItemForm(false)}
                title="Lisää tuote ostoslistaan"
                maxWidth={700}
            >
                <AddFoodItemPanel
                    location="shopping-list"
                    shoppingListId={shoppingList._id}
                    onSelectItem={handleSearchItemSelect}
                    onSubmitNewItem={handleAddItem}
                    onCloseForm={() => setShowItemForm(false)}
                />
            </ResponsiveModal>

            <ScrollView
                style={styles.mainScrollView}
                stickyHeaderIndices={[1]}
                showsVerticalScrollIndicator={false}
            >
                    {/* Header section that scrolls away */}
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
                            Tulokset sisältävät sekä omat tuotteesi että Open
                            Food Facts -tietokannan.
                        </CustomText>
                    </View>

                    {/* Search section with buttons */}
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
                        onButtonPress={() => setShowItemForm(true)}
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

                    {/* Category filters section */}
                    <GenericFilterSection
                        selectedFilters={selectedCategoryFilters}
                        showFilters={showFilters}
                        filterTitle="Suodata kategorioittain:"
                        categories={ingredientCategories}
                        onToggleFilter={toggleCategoryFilter}
                        onClearFilters={() => setSelectedCategoryFilters([])}
                        getItemCounts={getCategoryItemCounts}
                    />

                    {/* Items list container */}
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
                                    {filteredItems && filteredItems.length > 0
                                        ? filteredItems
                                              .reduce(
                                                  (sum, item) =>
                                                      sum +
                                                      (parseFloat(item.price) ||
                                                          0),
                                                  0
                                              )
                                              .toFixed(2)
                                        : shoppingList.totalEstimatedPrice || 0}
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
                        {checkedItems.length > 0 && (
                            <View
                                style={[
                                    styles.buttonContainer,
                                    isDesktop && styles.desktopButtonContainer,
                                ]}
                            >
                                <Button
                                    title={`Siirrä ${checkedItems.length} tuotetta ruokavarastoon`}
                                    onPress={() =>
                                        moveCheckedToPantry(checkedItems)
                                    }
                                    style={[
                                        styles.secondaryButton,
                                        isDesktop &&
                                            styles.desktopPrimaryButton,
                                    ]}
                                    textStyle={styles.buttonText}
                                />
                            </View>
                        )}
                    </View>
                </ScrollView>

            {/* Item Details Modal */}
            <PantryItemDetails
                item={selectedItem}
                visible={showItemDetails}
                onClose={() => {
                    setShowItemDetails(false)
                    setSelectedItem(null)
                }}
                onUpdate={handleUpdateItem}
            />
        </View>
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
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        minHeight: 48,
        borderWidth: 3,
        borderColor: '#5844BB',
        whiteSpace: 'nowrap',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 10,
        marginBottom: 30,
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
    desktopButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
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
