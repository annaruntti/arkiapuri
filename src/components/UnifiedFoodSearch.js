import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import BarcodeScanner from './BarcodeScanner'
import CustomText from './CustomText'

const UnifiedFoodSearch = ({
    onSelectItem,
    location = 'shopping-list',
    shoppingListId = null,
    mealId = null,
    allowDuplicates = false,
}) => {
    const { isDesktop } = useResponsiveDimensions()
    const [searchQuery, setSearchQuery] = useState('')
    const [localFoodItems, setLocalFoodItems] = useState([])
    const [openFoodFactsItems, setOpenFoodFactsItems] = useState([])
    const [filteredLocalItems, setFilteredLocalItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [isListVisible, setIsListVisible] = useState(false)
    const [showScanner, setShowScanner] = useState(false)
    const [addedItems, setAddedItems] = useState(new Set())
    const [activeTab, setActiveTab] = useState('all') // 'all', 'local', 'openfoodfacts'
    const searchContainerRef = useRef(null)
    const searchTimeoutRef = useRef(null)
    const renderTimestampRef = useRef(Date.now())

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
                setLocalFoodItems(response.data.foodItems)
            }
        } catch (error) {
            console.error('Error fetching local food items:', error)
        }
    }

    const searchItems = async (query) => {
        if (query.length < 2) return

        renderTimestampRef.current = Date.now()

        try {
            // Search local items with better filtering
            const queryLower = query.toLowerCase().trim()
            const localFiltered = localFoodItems
                .filter((item) => {
                    if (!item.name) return false
                    const nameLower = item.name.toLowerCase()
                    return nameLower.includes(queryLower)
                })
                .sort((a, b) => {
                    // Prioritize exact matches and starts-with matches
                    const aName = a.name.toLowerCase()
                    const bName = b.name.toLowerCase()
                    const aExact = aName === queryLower
                    const bExact = bName === queryLower
                    const aStarts = aName.startsWith(queryLower)
                    const bStarts = bName.startsWith(queryLower)

                    if (aExact && !bExact) return -1
                    if (!aExact && bExact) return 1
                    if (aStarts && !bStarts) return -1
                    if (!aStarts && bStarts) return 1
                    return aName.localeCompare(bName)
                })
                .slice(0, 15) // Limit to 15 local items max
                .map((item) => ({
                    ...item,
                    // Ensure local items have proper structure
                    name: item.name || 'Nimetön tuote',
                    category: Array.isArray(item.category)
                        ? item.category
                        : item.category
                          ? [item.category]
                          : [],
                    calories: item.calories || 0,
                }))

            setFilteredLocalItems(localFiltered)

            // Search Open Food Facts
            if (activeTab === 'all' || activeTab === 'openfoodfacts') {
                try {
                    const response = await fetch(
                        `${getServerUrl('')}/api/openfoodfacts/search?q=${encodeURIComponent(query)}&limit=8`
                    )
                    const data = await response.json()

                    if (data.success) {
                        const processedProducts = (data.products || []).map(
                            (product) => ({
                                ...product,
                                source: 'openfoodfacts',
                                name: String(product.name || 'Nimetön tuote'),
                                brands: String(product.brands || ''),
                                nutrition: product.nutrition || { calories: 0 },
                                nutritionGrade: String(
                                    product.nutritionGrade || ''
                                ),
                                category: Array.isArray(product.category)
                                    ? product.category
                                    : product.category
                                      ? [product.category]
                                      : [],
                            })
                        )

                        setOpenFoodFactsItems(processedProducts)
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

    const handleBarcodeScanned = async (barcode) => {
        setShowScanner(false)
        setLoading(true)

        try {
            // First, try to find in Open Food Facts
            const response = await fetch(
                `${getServerUrl('')}/api/openfoodfacts/barcode/${barcode}`
            )
            const data = await response.json()

            if (data.success && data.product) {
                // Show product details and option to add
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
            } else {
                Alert.alert(
                    'Tuotetta ei löytynyt',
                    'Viivakoodi ei tuottanut tuloksia. Haluatko lisätä tuotteen manuaalisesti?',
                    [
                        {
                            text: 'Skannaa uudelleen',
                            onPress: () => setShowScanner(true),
                        },
                        {
                            text: 'Lisää manuaalisesti',
                            onPress: () => {
                                onSelectItem({
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

    const addToPantry = async (foodItem, collectionData) => {
        try {
            const token = await storage.getItem('userToken')

            // Add error handling for undefined collectionData
            if (!collectionData) {
                console.error('collectionData is undefined in addToPantry')
                throw new Error('Collection data is missing')
            }

            const pantryItemData = {
                name: foodItem.name,
                quantity: collectionData.quantity || 1,
                unit: collectionData.unit || 'kpl',
                expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                foodId: foodItem._id,
                category: foodItem.category || [],
                calories: foodItem.calories || 0,
                price: 0,
                addedFrom: 'pantry',
            }

            const response = await fetch(`${getServerUrl('')}/pantry/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(pantryItemData),
            })

            const data = await response.json()
            if (!data.success) {
                throw new Error(data.message || 'Failed to add to pantry')
            }
        } catch (error) {
            console.error('Error adding to pantry:', error)
            throw error
        }
    }

    const addToShoppingList = async (foodItem, collectionData) => {
        try {
            const token = await storage.getItem('userToken')
            const shoppingListItemData = {
                name: foodItem.name,
                quantity: collectionData.quantity,
                unit: collectionData.unit,
                foodId: foodItem._id,
                category: foodItem.category || [],
                calories: foodItem.calories || 0,
                price: 0,
            }

            const response = await fetch(
                `${getServerUrl('')}/shopping-lists/${collectionData.shoppingListId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        items: [shoppingListItemData], // Add to existing items
                    }),
                }
            )

            const data = await response.json()
            if (!data.success) {
                throw new Error(
                    data.message || 'Failed to add to shopping list'
                )
            }
        } catch (error) {
            console.error('Error adding to shopping list:', error)
            throw error
        }
    }

    const addOpenFoodFactsProduct = async (product) => {
        try {
            // For meal context, just add the item directly without API calls
            if (location === 'meal') {
                const foodItem = {
                    _id: `openfoodfacts-${product.barcode}`,
                    name: product.product_name || product.name,
                    barcode: product.barcode,
                    unit: 'kpl',
                    category: (() => {
                        if (!product.categories) return []
                        if (Array.isArray(product.categories))
                            return product.categories
                        if (typeof product.categories === 'string') {
                            return product.categories
                                .split(',')
                                .map((cat) => cat.trim())
                        }
                        return []
                    })(),
                    calories: product.nutriments?.['energy-kcal_100g'] || 0,
                    price: 0,
                    source: 'openfoodfacts',
                    locations: ['meal'],
                    quantities: {
                        meal: 1,
                        'shopping-list': 0,
                        pantry: 0,
                    },
                }

                onSelectItem(foodItem)
                setSearchQuery('')
                setIsListVisible(false)
                return
            }

            // For other locations (shopping-list, pantry), use the API
            const token = await storage.getItem('userToken')
            const response = await fetch(
                `${getServerUrl('')}/api/openfoodfacts/add/${product.barcode}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        location: location,
                        quantity: 1,
                        unit: 'pcs',
                        shoppingListId: shoppingListId,
                        mealId: mealId,
                    }),
                }
            )

            const data = await response.json()

            if (data.success) {
                // Now add to the specific collection using the same flow as manual addition
                if (
                    data.collectionData &&
                    data.collectionData.location === 'pantry'
                ) {
                    await addToPantry(data.foodItem, data.collectionData)
                } else if (
                    data.collectionData &&
                    data.collectionData.location === 'shopping-list' &&
                    data.collectionData.shoppingListId
                ) {
                    await addToShoppingList(data.foodItem, data.collectionData)
                } else {
                    console.error(
                        'Invalid collectionData:',
                        data.collectionData
                    )
                    throw new Error(
                        'Invalid collection data received from server'
                    )
                }
                onSelectItem(data.foodItem)
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
                'Tuotteen lisääminen epäonnistui. Yritä uudelleen.'
            )
        }
    }

    const handleSelectLocalItem = (item) => {
        // For meal context: allow multiple selections but track for visual feedback
        // For other contexts: prevent duplicate selections
        if (!allowDuplicates && addedItems.has(item._id)) return

        // Always track added items for visual feedback (but allow re-selection in meal context)
        setAddedItems((prev) => new Set(prev).add(item._id))
        onSelectItem(item)

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

    const getGradeColor = (grade) => {
        const colors = {
            a: '#00AA00',
            b: '#85BB2F',
            c: '#FFAA00',
            d: '#FF6600',
            e: '#FF0000',
        }
        return colors[grade?.toLowerCase()] || '#ccc'
    }

    const renderLocalItem = ({ item }) => {
        const categoryText = (() => {
            if (Array.isArray(item.category)) {
                const filtered = item.category.filter(Boolean)
                const joined = filtered.join(', ')
                return String(joined || 'Ei kategoriaa')
            }
            return String('Ei kategoriaa')
        })()

        const calorieText =
            item.calories && item.calories > 0
                ? String(`${item.calories} kcal`)
                : null

        return (
            <TouchableOpacity
                style={[
                    styles.item,
                    addedItems.has(item._id) && styles.addedItem,
                ]}
                onPress={() => handleSelectLocalItem(item)}
                disabled={!allowDuplicates && addedItems.has(item._id)}
            >
                <View style={styles.itemContent}>
                    <View style={styles.itemLeft}>
                        <View style={styles.itemNameContainer}>
                            <CustomText style={styles.itemName}>
                                {String(item.name || 'Nimetön tuote').trim()}
                            </CustomText>
                            {calorieText ? (
                                <CustomText style={styles.itemCalories}>
                                    {calorieText}
                                </CustomText>
                            ) : null}
                        </View>
                        <View style={styles.itemDetails}>
                            <CustomText style={styles.itemCategory}>
                                {categoryText}
                            </CustomText>
                        </View>
                    </View>
                    <View style={styles.itemRight}>
                        <CustomText style={styles.sourceLabel}>
                            {String('Oma')}
                        </CustomText>
                        {addedItems.has(item._id) ? (
                            <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color="#00AA00"
                            />
                        ) : (
                            <Ionicons
                                name="add-circle-outline"
                                size={20}
                                color="#9C86FC"
                            />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const renderOpenFoodFactsItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelectOpenFoodFactsItem(item)}
            >
                <View style={styles.itemContent}>
                    <View style={styles.imageItemLeft}>
                        {item.imageUrl && (
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.productImage}
                            />
                        )}
                        <View style={styles.itemInfo}>
                            <CustomText
                                style={styles.itemName}
                                numberOfLines={2}
                            >
                                {String(item.name || 'Nimetön tuote').trim()}
                            </CustomText>
                            {item.brands &&
                            item.brands.trim().length > 0 &&
                            String(item.brands).trim() !== '' ? (
                                <CustomText
                                    style={styles.itemBrand}
                                    numberOfLines={1}
                                >
                                    {String(item.brands).trim()}
                                </CustomText>
                            ) : null}
                            <View style={styles.productMeta}>
                                {item.nutritionGrade &&
                                item.nutritionGrade.trim().length > 0 &&
                                String(item.nutritionGrade).trim() !== '' ? (
                                    <View
                                        style={[
                                            styles.gradeBox,
                                            {
                                                backgroundColor: getGradeColor(
                                                    item.nutritionGrade
                                                ),
                                            },
                                        ]}
                                    >
                                        <CustomText style={styles.gradeText}>
                                            {String(item.nutritionGrade)
                                                .trim()
                                                .toUpperCase()}
                                        </CustomText>
                                    </View>
                                ) : null}
                                {item.nutrition?.calories > 0 ? (
                                    <CustomText style={styles.itemCalories}>
                                        {String(
                                            `${Math.round(item.nutrition.calories || 0)} kcal`
                                        ).trim()}
                                    </CustomText>
                                ) : null}
                            </View>
                        </View>
                    </View>
                    <View style={styles.itemRight}>
                        <CustomText style={styles.sourceLabelOFF}>
                            {String('OFF')}
                        </CustomText>
                        <Ionicons
                            name="add-circle-outline"
                            size={20}
                            color="#9C86FC"
                        />
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    const getFilteredData = () => {
        switch (activeTab) {
            case 'local':
                return filteredLocalItems
            case 'openfoodfacts':
                return openFoodFactsItems
            default:
                // Smart deduplication: prioritize local items, remove exact name duplicates
                const seenNames = new Set()
                const seenKeys = new Set()
                const deduped = []

                // First add local items (they have priority)
                filteredLocalItems.forEach((item, index) => {
                    const normalizedName = item.name?.toLowerCase().trim()
                    const key = item._id || `local-${normalizedName}`

                    if (!seenNames.has(normalizedName) && !seenKeys.has(key)) {
                        seenNames.add(normalizedName)
                        seenKeys.add(key)
                        deduped.push(item)
                    }
                })

                // Then add Open Food Facts items (only if name doesn't exist)
                openFoodFactsItems.forEach((item) => {
                    const normalizedName = item.name?.toLowerCase().trim()
                    const key = item.barcode || `off-${normalizedName}`

                    if (!seenNames.has(normalizedName) && !seenKeys.has(key)) {
                        seenNames.add(normalizedName)
                        seenKeys.add(key)
                        deduped.push(item)
                    }
                })

                return deduped
        }
    }

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
            // More robust detection of Open Food Facts items
            if (
                item.source === 'openfoodfacts' ||
                item.barcode ||
                item.nutrition ||
                item.nutritionGrade
            ) {
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
                            color="#9C86FC"
                            style={styles.loadingIndicator}
                        />
                    )}
                </View>
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => setShowScanner(true)}
                >
                    <Ionicons name="barcode" size={24} color="#9C86FC" />
                </TouchableOpacity>
            </View>

            {isListVisible && searchQuery.length >= 2 && (
                <View style={styles.resultsContainer}>
                    {/* Tab selector */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'all' && styles.activeTab,
                            ]}
                            onPress={() => setActiveTab('all')}
                        >
                            <CustomText
                                style={[
                                    styles.tabText,
                                    activeTab === 'all' && styles.activeTabText,
                                ]}
                            >
                                {String(
                                    `Kaikki (${
                                        filteredLocalItems.length +
                                        openFoodFactsItems.length
                                    })`
                                )}
                            </CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'local' && styles.activeTab,
                            ]}
                            onPress={() => setActiveTab('local')}
                        >
                            <CustomText
                                style={[
                                    styles.tabText,
                                    activeTab === 'local' &&
                                        styles.activeTabText,
                                ]}
                            >
                                {String(`Omat (${filteredLocalItems.length})`)}
                            </CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'openfoodfacts' &&
                                    styles.activeTab,
                            ]}
                            onPress={() => setActiveTab('openfoodfacts')}
                        >
                            <CustomText
                                style={[
                                    styles.tabText,
                                    activeTab === 'openfoodfacts' &&
                                        styles.activeTabText,
                                ]}
                            >
                                {String(
                                    `Tietokanta (${openFoodFactsItems.length})`
                                )}
                            </CustomText>
                        </TouchableOpacity>
                    </View>

                    {memoizedData.length === 0 && !loading ? (
                        <View style={styles.emptyContainer}>
                            <CustomText style={styles.emptyText}>
                                {String(`Ei tuloksia haulle "${searchQuery}"`)}
                            </CustomText>
                        </View>
                    ) : (
                        <FlatList
                            key={`flatlist-${renderTimestampRef.current}`} // Force complete re-render
                            data={memoizedData}
                            renderItem={memoizedRenderItem}
                            keyExtractor={(item, index) => {
                                // Use the stable internal key we added in memoizedData
                                return (
                                    item.__searchKey ||
                                    `fallback-${renderTimestampRef.current}-${index}`
                                )
                            }}
                            style={styles.resultsList}
                            keyboardShouldPersistTaps="handled"
                            removeClippedSubviews={false} // Disable for better compatibility
                            maxToRenderPerBatch={10}
                            initialNumToRender={10}
                            windowSize={5}
                            getItemLayout={null} // Let FlatList calculate dynamically
                        />
                    )}
                </View>
            )}

            {/* Barcode Scanner Modal */}
            <Modal visible={showScanner} animationType="slide">
                <BarcodeScanner
                    onScanSuccess={handleBarcodeScanned}
                    onCancel={() => setShowScanner(false)}
                    isVisible={showScanner}
                />
            </Modal>
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
        borderColor: '#9C86FC',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultsContainer: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        maxHeight: 300,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#9C86FC',
    },
    tabText: {
        fontSize: 12,
        color: '#666',
    },
    activeTabText: {
        color: '#9C86FC',
        fontWeight: 'bold',
    },
    resultsList: {
        maxHeight: 200,
    },
    item: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    addedItem: {
        backgroundColor: '#f0f8f0',
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemNameContainer: {
        flexDirection: 'row',
        alignItems: 'left',
        justifyContent: 'space-between',
    },
    itemLeft: {
        flex: 1,
        alignItems: 'left',
    },
    imageItemLeft: {
        flexDirection: 'row',
        alignItems: 'left',
        justifyContent: 'space-between',
    },
    productImage: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: 10,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    itemBrand: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    itemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemCategory: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    itemCalories: {
        fontSize: 12,
        color: '#666',
        paddingRight: 10,
    },
    productMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    gradeBox: {
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
    },
    gradeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    itemRight: {
        alignItems: 'center',
        gap: 4,
    },
    sourceLabel: {
        fontSize: 10,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    sourceLabelOFF: {
        fontSize: 10,
        color: '#fff',
        backgroundColor: '#FF6600',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
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
