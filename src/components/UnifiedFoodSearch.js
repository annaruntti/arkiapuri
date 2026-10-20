import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,

    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useShowNutrition } from '../hooks/useShowNutrition'
import { useBarcodeScanner } from '../context/BarcodeScannerProvider'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import openFoodFactsApi from '../services/openFoodFactsApi'
import { addPantryItem } from '../services/collectionApi'
import CustomText from './CustomText'
import MealIngredientQuantityModal from './MealIngredientQuantityModal'
import BarcodeProductReview from './BarcodeProductReview'
import FoodSearchSourceTabs, {
    FOOD_SEARCH_TABS,
} from './FoodSearchSourceTabs'
import {
    applyIngredientQuantity,
    stripCatalogLocationQuantity,
} from '../utils/mealFoodItem'
import { DEFAULT_SERVINGS } from '../utils/mealServings'
import {
    dedupeFoodItems,
    filterLocalFoodItemsForQuery,
    getFoodSearchTabResults,
    normalizeOpenFoodFactsSearchResults,
} from '../utils/foodSearchDedupe'
import {
    buildShoppingListBarcodeReview,
    fetchBarcodeReviewPriceEstimate,
} from '../utils/foodSearchBarcode'
import {
    FoodSearchLocalRow,
    FoodSearchOpenFoodFactsRow,
} from './FoodSearchResultRows'
import {
    buildGuestFoodItemFromOpenFoodFacts,
    mapOpenFoodFactsToFoodItemFields,
} from '../utils/openFoodFactsMapper'
import {
    buildOpenFoodFactsAddArgs,
    buildShoppingListItemFromOffAdd,
    parseBarcodeReviewConfirm,
} from '../utils/foodSearchOpenFoodFacts'

const UnifiedFoodSearch = ({
    onSelectItem,
    location = 'shopping-list',
    shoppingListId = null,
    mealId = null,
    pantryLocationId = null,
    allowDuplicates = false,
    onMealQuantityPromptChange,
    servings = DEFAULT_SERVINGS,
    autoOpenScanner = false,
    showBarcodeButton = true,
}) => {
    const { isDesktop } = useResponsiveDimensions()
    const { openBarcodeScanner } = useBarcodeScanner()
    const showNutrition = useShowNutrition()
    const [searchQuery, setSearchQuery] = useState('')
    const [localFoodItems, setLocalFoodItems] = useState([])
    const [openFoodFactsItems, setOpenFoodFactsItems] = useState([])
    const [filteredLocalItems, setFilteredLocalItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [isListVisible, setIsListVisible] = useState(false)
    const [addedItems, setAddedItems] = useState(new Set())
    const [activeTab, setActiveTab] = useState(FOOD_SEARCH_TABS.ALL)
    const [pendingMealPick, setPendingMealPick] = useState(null)
    const [pendingBarcodeReview, setPendingBarcodeReview] = useState(null)
    const searchContainerRef = useRef(null)
    const searchTimeoutRef = useRef(null)
    const renderTimestampRef = useRef(Date.now())

    const onMealQuantityPromptChangeRef = useRef(onMealQuantityPromptChange)
    onMealQuantityPromptChangeRef.current = onMealQuantityPromptChange

    useEffect(() => {
        onMealQuantityPromptChangeRef.current?.(
            Boolean(pendingMealPick || pendingBarcodeReview)
        )
        return () => onMealQuantityPromptChangeRef.current?.(false)
    }, [pendingMealPick, pendingBarcodeReview])

    const handleBarcodeScannedRef = useRef(null)

    const openScanner = () => {
        openBarcodeScanner({
            onSuccess: (barcode) => handleBarcodeScannedRef.current?.(barcode),
        })
    }

    useEffect(() => {
        if (autoOpenScanner) {
            openScanner()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoOpenScanner])

    // Fetch local food items when component mounts
    useEffect(() => {
        fetchLocalFoodItems()
    }, [])

    // Search effect with debouncing
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        if (searchQuery.length >= 2) {
            // Clear previous results to prevent duplicates
            setFilteredLocalItems([])
            setOpenFoodFactsItems([])
            setLoading(true)
            setIsListVisible(true)
            renderTimestampRef.current = Date.now()

            // Debounce search by 300ms
            searchTimeoutRef.current = setTimeout(() => {
                searchItems(searchQuery)
            }, 300)
        } else {
            setFilteredLocalItems([])
            setOpenFoodFactsItems([])
            setIsListVisible(false)
            setLoading(false)
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchQuery])

    // Click outside handler and cleanup
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)
            ) {
                setIsListVisible(false)
                setSearchQuery('')
                setAddedItems(new Set())
            }
        }

        if (Platform.OS === 'web') {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            if (Platform.OS === 'web') {
                document.removeEventListener('mousedown', handleClickOutside)
            }
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    const fetchLocalFoodItems = async () => {
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/food-items'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                setLocalFoodItems(dedupeFoodItems(response.data.foodItems || []))
            }
        } catch (error) {
            console.error('Error fetching local food items:', error)
        }
    }

    const searchItems = async (query) => {
        if (query.length < 2) return

        renderTimestampRef.current = Date.now()

        try {
            setFilteredLocalItems(
                filterLocalFoodItemsForQuery(query, localFoodItems)
            )

            if (activeTab === 'all' || activeTab === 'openfoodfacts') {
                try {
                    const data = await openFoodFactsApi.searchByText(
                        query,
                        1,
                        50
                    )

                    if (data.success) {
                        setOpenFoodFactsItems(
                            normalizeOpenFoodFactsSearchResults(
                                data.products || []
                            )
                        )
                    } else {
                        setOpenFoodFactsItems([])
                    }
                } catch (offError) {
                    console.error('Error searching Open Food Facts:', offError)
                    setOpenFoodFactsItems([])
                }
            } else {
                setOpenFoodFactsItems([])
            }
        } catch (error) {
            console.error('Error searching items:', error)
        } finally {
            setLoading(false)
        }
    }

    const emitSelectedItem = (item, meta = { alreadyAdded: false }) => {
        if (location === 'meal') {
            setPendingMealPick({
                item: stripCatalogLocationQuantity(item),
                meta,
            })
            setSearchQuery('')
            setIsListVisible(false)
            return
        }
        onSelectItem(item, meta)
    }

    const handleBarcodeScanned = async (barcode) => {
        setLoading(true)

        try {
            const data = await openFoodFactsApi.searchByBarcode(barcode)

            if (data.success && data.product) {
                if (location === 'shopping-list') {
                    const review = buildShoppingListBarcodeReview(
                        data.product,
                        barcode
                    )
                    setPendingBarcodeReview(review)
                    setSearchQuery('')
                    setIsListVisible(false)
                    const amount = await fetchBarcodeReviewPriceEstimate(review)
                    if (amount > 0) {
                        setPendingBarcodeReview((current) => {
                            if (
                                !current ||
                                current.barcode !== review.barcode ||
                                current.price
                            ) {
                                return current
                            }
                            return {
                                ...current,
                                price: amount,
                                priceIsEstimate: true,
                            }
                        })
                    }
                } else {
                    Alert.alert(
                        'Tuote löytyi!',
                        `${data.product.name}\n${data.product.brands || ''}`,
                        [
                            {
                                text: 'Peruuta',
                                style: 'cancel',
                            },
                            {
                                text: 'Lisää listaan',
                                onPress: () =>
                                    addOpenFoodFactsProduct(data.product),
                            },
                        ]
                    )
                }
            } else {
                Alert.alert(
                    'Tuotetta ei löytynyt',
                    'Viivakoodi ei tuottanut tuloksia. Haluatko lisätä tuotteen manuaalisesti?',
                    [
                        {
                            text: 'Skannaa uudelleen',
                            onPress: openScanner,
                        },
                        {
                            text: 'Lisää manuaalisesti',
                            onPress: () => {
                                emitSelectedItem({
                                    name: `Tuote ${barcode}`,
                                    barcode: barcode,
                                    source: 'manual',
                                })
                            },
                        },
                        {
                            text: 'Sulje',
                            style: 'cancel',
                        },
                    ]
                )
            }
        } catch (error) {
            console.error('Error fetching product by barcode:', error)
            Alert.alert(
                'Virhe',
                'Tuotteen hakeminen epäonnistui. Yritä uudelleen.'
            )
        } finally {
            setLoading(false)
        }
    }
    handleBarcodeScannedRef.current = handleBarcodeScanned

    const addToPantry = async (foodItem, collectionData) => {
        try {
            if (!collectionData) {
                console.error('collectionData is undefined in addToPantry')
                throw new Error('Collection data is missing')
            }

            await addPantryItem({
                name: foodItem.name,
                quantity: collectionData.quantity || 1,
                unit: collectionData.unit || 'kpl',
                foodId: foodItem._id,
                category: foodItem.category || [],
                calories: foodItem.calories || 0,
                price: 0,
                addedFrom: 'pantry',
                locationId: collectionData.locationId || undefined,
            })
        } catch (error) {
            console.error('Error adding to pantry:', error)
            throw error
        }
    }

    const addOpenFoodFactsProduct = async (product, overrides = {}) => {
        try {
            const token = await storage.getItem('userToken')

            // Guest / not logged in: keep OFF product in local UI only
            if (!token) {
                const foodItem = buildGuestFoodItemFromOpenFoodFacts(
                    product,
                    location
                )
                emitSelectedItem(
                    {
                        ...foodItem,
                        name: overrides.name || foodItem.name,
                        quantity: overrides.quantity || foodItem.quantity,
                        unit: overrides.unit || foodItem.unit,
                        price: overrides.price || 0,
                        calories:
                            overrides.calories != null
                                ? overrides.calories
                                : foodItem.calories,
                        category: overrides.category || foodItem.category,
                    },
                    { alreadyAdded: false }
                )
                setSearchQuery('')
                setIsListVisible(false)
                return
            }

            // Persist OFF products immediately so meal save gets a real Mongo id
            // (avoids PUT /food-items/openfoodfacts-<barcode> 400 errors).
            if (location === 'meal') {
                const mapped = mapOpenFoodFactsToFoodItemFields(product)
                const barcode =
                    product.barcode || mapped.openFoodFactsData?.barcode
                if (!barcode) {
                    throw new Error('Product barcode is missing')
                }

                const data = await openFoodFactsApi.addToFoodItems(barcode, {
                    location: 'meal',
                    quantity: mapped.packageQuantity || 1,
                    unit: mapped.unit || 'kpl',
                    mealId,
                })

                if (!data.success || !data.foodItem) {
                    throw new Error(
                        data.message || 'Failed to add Open Food Facts product'
                    )
                }

                const foodItem = {
                    ...data.foodItem,
                    unit: data.foodItem.unit || mapped.unit || 'kpl',
                }

                emitSelectedItem(foodItem, { alreadyAdded: false })
                setSearchQuery('')
                setIsListVisible(false)
                return
            }

            // For other locations (shopping-list, pantry), use the API
            const { mapped, shoppingLine, apiBody } = buildOpenFoodFactsAddArgs(
                product,
                { location, overrides, shoppingListId, mealId }
            )
            const data = await openFoodFactsApi.addToFoodItems(
                product.barcode,
                apiBody
            )

            if (data.success) {
                // Now add to the specific collection using the same flow as manual addition
                if (
                    data.collectionData &&
                    data.collectionData.location === 'pantry'
                ) {
                    await addToPantry(data.foodItem, {
                        ...data.collectionData,
                        locationId: pantryLocationId,
                    })
                } else if (
                    data.collectionData &&
                    data.collectionData.location === 'shopping-list' &&
                    data.collectionData.shoppingListId
                ) {
                    // Parent (ShoppingListDetail) adds the row so it can
                    // detect duplicates and offer to increase quantity.
                    emitSelectedItem(
                        buildShoppingListItemFromOffAdd({
                            data,
                            product,
                            mapped,
                            shoppingLine,
                            overrides,
                        }),
                        { alreadyAdded: false }
                    )
                    setSearchQuery('')
                    setIsListVisible(false)
                    return
                } else {
                    console.error(
                        'Invalid collectionData:',
                        data.collectionData
                    )
                    throw new Error(
                        'Invalid collection data received from server'
                    )
                }
                // The FoodItem was already created AND already added to the
                // collection (pantry) above — the caller must NOT add it again.
                emitSelectedItem(data.foodItem, { alreadyAdded: true })
                setSearchQuery('')
                setIsListVisible(false)
            } else {
                Alert.alert(
                    'Virhe',
                    data.message || 'Tuotteen lisääminen epäonnistui.'
                )
            }
        } catch (error) {
            console.error('Error adding Open Food Facts product:', error)
            Alert.alert(
                'Virhe',
                error?.message ||
                    'Tuotteen lisääminen epäonnistui. Yritä uudelleen.'
            )
        }
    }

    const confirmBarcodeReview = async ({
        name,
        quantity,
        unit,
        price,
        priceIsEstimate,
        calories,
        category,
    }) => {
        const review = pendingBarcodeReview
        if (!review?.product) return
        const { details, renamed, manualItem } = parseBarcodeReviewConfirm({
            name,
            quantity,
            unit,
            price,
            priceIsEstimate,
            calories,
            category,
            review,
        })
        setPendingBarcodeReview(null)

        if (renamed && manualItem) {
            emitSelectedItem(manualItem, { alreadyAdded: false })
            setSearchQuery('')
            setIsListVisible(false)
            return
        }

        await addOpenFoodFactsProduct(review.product, details)
    }

    const handleSelectLocalItem = (item) => {
        // For meal context: allow multiple selections but track for visual feedback
        // For other contexts: prevent duplicate selections
        if (!allowDuplicates && addedItems.has(item._id)) return

        // Always track added items for visual feedback (but allow re-selection in meal context)
        setAddedItems((prev) => new Set(prev).add(item._id))
        // A local item hasn't been added to any collection yet — the caller
        // still needs to do that (find-or-create + add).
        emitSelectedItem(item, { alreadyAdded: false })

        // Auto-hide after selection
        setTimeout(() => {
            setSearchQuery('')
            setIsListVisible(false)
            // In meal context, clear added items to allow re-selection
            // In other contexts, keep them to prevent duplicates
            if (allowDuplicates) {
                setAddedItems(new Set())
            }
        }, 500)
    }

    const handleSelectOpenFoodFactsItem = (item) => {
        addOpenFoodFactsProduct(item)
    }

    const renderLocalItem = ({ item }) => (
        <FoodSearchLocalRow
            item={item}
            showNutrition={showNutrition}
            isAdded={addedItems.has(item._id)}
            allowDuplicates={allowDuplicates}
            onPress={() => handleSelectLocalItem(item)}
        />
    )

    const renderOpenFoodFactsItem = ({ item }) => (
        <FoodSearchOpenFoodFactsRow
            item={item}
            showNutrition={showNutrition}
            onPress={() => handleSelectOpenFoodFactsItem(item)}
        />
    )

    const getFilteredData = () =>
        getFoodSearchTabResults(
            activeTab,
            filteredLocalItems,
            openFoodFactsItems
        )

    // Memoize the filtered data to prevent unnecessary re-renders
    const memoizedData = useMemo(() => {
        // Don't return any data if we're loading or have no search query
        if (loading || searchQuery.length < 2) {
            return []
        }

        const data = getFilteredData()
        // Freeze the data to prevent mutations and ensure each item has a stable reference
        return Object.freeze(
            data.map((item, index) =>
                Object.freeze({
                    ...item,
                    // Add a unique key with timestamp to prevent key conflicts across renders
                    __searchKey: `${renderTimestampRef.current}-${activeTab}-${index}-${item._id || item.barcode || item.name || 'unknown'}`,
                })
            )
        )
    }, [
        filteredLocalItems,
        openFoodFactsItems,
        activeTab,
        searchQuery,
        loading,
    ])

    // Memoize the renderItem function to prevent re-renders
    const memoizedRenderItem = useCallback(
        ({ item, index }) => {
            const isOpenFoodFacts = item.source === 'openfoodfacts'

            if (isOpenFoodFacts) {
                return (
                    <React.Fragment key={item.__searchKey || index}>
                        {renderOpenFoodFactsItem({ item })}
                    </React.Fragment>
                )
            }
            return (
                <React.Fragment key={item.__searchKey || index}>
                    {renderLocalItem({ item })}
                </React.Fragment>
            )
        },
        [addedItems]
    )

    return (
        <View
            style={[styles.container, isDesktop && styles.desktopContainer]}
            ref={searchContainerRef}
        >
            {pendingMealPick ? (
                <MealIngredientQuantityModal
                    visible
                    item={pendingMealPick.item}
                    servings={servings}
                    onCancel={() => setPendingMealPick(null)}
                    onConfirm={({ quantity, unit }) => {
                        const item = applyIngredientQuantity(
                            pendingMealPick.item,
                            quantity,
                            unit
                        )
                        const meta = pendingMealPick.meta
                        setPendingMealPick(null)
                        onSelectItem(item, meta)
                    }}
                />
            ) : null}
            {pendingBarcodeReview ? (
                <BarcodeProductReview
                    product={pendingBarcodeReview}
                    onCancel={() => setPendingBarcodeReview(null)}
                    onRescan={() => {
                        setPendingBarcodeReview(null)
                        openScanner()
                    }}
                    onConfirm={confirmBarcodeReview}
                />
            ) : null}
            {!pendingMealPick && !pendingBarcodeReview && (
            <>
            <View style={styles.searchRow}>
                <View style={styles.searchInputContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Hae tuotteita nimellä..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() =>
                            searchQuery.length >= 2 && setIsListVisible(true)
                        }
                    />
                    {loading && (
                        <ActivityIndicator
                            size="small"
                            color="#5844BB"
                            style={styles.loadingIndicator}
                        />
                    )}
                </View>
                {showBarcodeButton && !isDesktop ? (
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={openScanner}
                        accessibilityRole="button"
                        accessibilityLabel="Skannaa viivakoodi"
                    >
                        <Ionicons name="barcode" size={24} color="#5844BB" />
                    </TouchableOpacity>
                ) : null}
            </View>

            {isListVisible && searchQuery.length >= 2 && (
                <View style={styles.resultsContainer}>
                    <FoodSearchSourceTabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        localCount={filteredLocalItems.length}
                        openFoodFactsCount={openFoodFactsItems.length}
                    />

                    {memoizedData.length === 0 && !loading ? (
                        <View style={styles.emptyContainer}>
                            <CustomText style={styles.emptyText}>
                                {String(`Ei tuloksia haulle "${searchQuery}"`)}
                            </CustomText>
                        </View>
                    ) : (
                        <ScrollView
                            key={`results-${renderTimestampRef.current}`}
                            style={styles.resultsList}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                        >
                            {memoizedData.map((item, index) =>
                                memoizedRenderItem({ item, index })
                            )}
                        </ScrollView>
                    )}
                </View>
            )}

            </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 9998,
        width: '100%',
        alignSelf: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',

        alignSelf: 'center',
    },
    searchInputContainer: {
        flex: 1,
        position: 'relative',
        width: '100%',
        alignSelf: 'center',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    loadingIndicator: {
        position: 'absolute',
        right: 12,
        top: '50%',
        marginTop: -10,
    },
    scanButton: {
        padding: 8,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#5844BB',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultsContainer: {
        marginTop: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        maxHeight: 380,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    resultsList: {
        maxHeight: 280,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    desktopContainer: {
        alignSelf: 'flex-start',
        width: '100%',
    },
})

export default UnifiedFoodSearch
