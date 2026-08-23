import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useShowNutrition } from '../hooks/useShowNutrition'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import openFoodFactsApi from '../services/openFoodFactsApi'
import { addPantryItem, addShoppingListItems } from '../services/collectionApi'
import BarcodeScanner from './BarcodeScanner'
import CustomText from './CustomText'
import ListItem from './ListItem'
import MealIngredientQuantityModal from './MealIngredientQuantityModal'
import {
    applyIngredientQuantity,
    stripCatalogLocationQuantity,
} from '../utils/mealFoodItem'
import { DEFAULT_SERVINGS } from '../utils/mealServings'
import {
    buildGuestFoodItemFromOpenFoodFacts,
    mapOpenFoodFactsToFoodItemFields,
} from '../utils/openFoodFactsMapper'

const normalizeItemName = (name) =>
    String(name || '')
        .toLowerCase()
        .trim()

const getItemIdentity = (item) => {
    if (item?._id) return `id:${item._id}`
    if (item?.barcode) return `barcode:${item.barcode}`
    return null
}

/** Prefer richer / more recently used catalog item when collapsing duplicates. */
const scoreFoodItem = (item) => {
    const hasImage = item.image?.url || item.imageUrl ? 1 : 0
    const hasOff = item.openFoodFactsData ? 1 : 0
    const updatedAt = item.updatedAt ? new Date(item.updatedAt).getTime() : 0
    return hasImage * 5 + hasOff * 3 + updatedAt / 1e12
}

const dedupeFoodItems = (items = []) => {
    const byIdentity = new Map()

    for (const item of items) {
        const identity = getItemIdentity(item)
        if (!identity) {
            byIdentity.set(`anon:${byIdentity.size}`, item)
            continue
        }
        const existing = byIdentity.get(identity)
        if (!existing || scoreFoodItem(item) > scoreFoodItem(existing)) {
            byIdentity.set(identity, item)
        }
    }

    const byName = new Map()
    for (const item of byIdentity.values()) {
        const name = normalizeItemName(item.name)
        if (!name) continue
        const existing = byName.get(name)
        if (!existing || scoreFoodItem(item) > scoreFoodItem(existing)) {
            byName.set(name, item)
        }
    }

    return [...byName.values()]
}

const UnifiedFoodSearch = ({
    onSelectItem,
    location = 'shopping-list',
    shoppingListId = null,
    mealId = null,
    allowDuplicates = false,
    onMealQuantityPromptChange,
    servings = DEFAULT_SERVINGS,
}) => {
    const { isDesktop } = useResponsiveDimensions()
    const showNutrition = useShowNutrition()
    const [searchQuery, setSearchQuery] = useState('')
    const [localFoodItems, setLocalFoodItems] = useState([])
    const [openFoodFactsItems, setOpenFoodFactsItems] = useState([])
    const [filteredLocalItems, setFilteredLocalItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [isListVisible, setIsListVisible] = useState(false)
    const [showScanner, setShowScanner] = useState(false)
    const [addedItems, setAddedItems] = useState(new Set())
    const [activeTab, setActiveTab] = useState('all') // 'all', 'local', 'openfoodfacts'
    const [pendingMealPick, setPendingMealPick] = useState(null)
    const searchContainerRef = useRef(null)
    const searchTimeoutRef = useRef(null)
    const renderTimestampRef = useRef(Date.now())

    useEffect(() => {
        onMealQuantityPromptChange?.(Boolean(pendingMealPick))
        return () => onMealQuantityPromptChange?.(false)
    }, [pendingMealPick, onMealQuantityPromptChange])

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
            // Search local items with better filtering
            const queryLower = normalizeItemName(query)
            const localFiltered = dedupeFoodItems(
                localFoodItems.filter((item) => {
                    if (!item.name) return false
                    return normalizeItemName(item.name).includes(queryLower)
                })
            )
                .sort((a, b) => {
                    // Prioritize exact matches and starts-with matches
                    const aName = normalizeItemName(a.name)
                    const bName = normalizeItemName(b.name)
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
                    source: item.source || 'local',
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
                    const data = await openFoodFactsApi.searchByText(
                        query,
                        1,
                        50
                    )

                    if (data.success) {
                        const processedProducts = dedupeFoodItems(
                            (data.products || []).map((product) => ({
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
                            }))
                        )

                        setOpenFoodFactsItems(processedProducts)
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
        setShowScanner(false)
        setLoading(true)

        try {
            const data = await openFoodFactsApi.searchByBarcode(barcode)

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
                expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                foodId: foodItem._id,
                category: foodItem.category || [],
                calories: foodItem.calories || 0,
                price: 0,
                addedFrom: 'pantry',
            })
        } catch (error) {
            console.error('Error adding to pantry:', error)
            throw error
        }
    }

    const addToShoppingList = async (foodItem, collectionData) => {
        try {
            await addShoppingListItems(collectionData.shoppingListId, [
                {
                    name: foodItem.name,
                    quantity: collectionData.quantity,
                    unit: collectionData.unit,
                    foodId: foodItem._id,
                    category: foodItem.category || [],
                    calories: foodItem.calories || 0,
                    price: 0,
                },
            ])
        } catch (error) {
            console.error('Error adding to shopping list:', error)
            throw error
        }
    }

    const addOpenFoodFactsProduct = async (product) => {
        try {
            const token = await storage.getItem('userToken')

            // Guest / not logged in: keep OFF product in local UI only
            if (!token) {
                const foodItem = buildGuestFoodItemFromOpenFoodFacts(
                    product,
                    location
                )
                emitSelectedItem(foodItem, { alreadyAdded: false })
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
            const mapped = mapOpenFoodFactsToFoodItemFields(product)
            const data = await openFoodFactsApi.addToFoodItems(product.barcode, {
                location,
                quantity: mapped.packageQuantity || 1,
                unit: mapped.unit || 'kpl',
                shoppingListId,
                mealId,
            })

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
                // The FoodItem was already created AND already added to the
                // collection (pantry/shopping list) above — the caller must
                // NOT add it again (that would create a duplicate entry with
                // the wrong default quantity of 1).
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
            showNutrition && item.calories && item.calories > 0
                ? String(`${item.calories} kcal`)
                : null

        return (
            <ListItem
                variant="row"
                title={String(item.name || 'Nimetön tuote').trim()}
                subtitle={
                    calorieText
                        ? `${categoryText} · ${calorieText}`
                        : categoryText
                }
                onPress={
                    !allowDuplicates && addedItems.has(item._id)
                        ? undefined
                        : () => handleSelectLocalItem(item)
                }
                style={[
                    styles.searchItem,
                    addedItems.has(item._id) && styles.addedItem,
                ]}
                trailing={
                    <View style={styles.itemRight}>
                        <CustomText style={styles.sourceLabel}>Oma</CustomText>
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
                                color="#5844BB"
                            />
                        )}
                    </View>
                }
            />
        )
    }

    const renderOpenFoodFactsItem = ({ item }) => {
        const imageUrl = item.image?.url || item.imageUrl
        const caloriesText =
            showNutrition && item.nutrition?.calories > 0
                ? `${Math.round(item.nutrition.calories || 0)} kcal`
                : null
        const grade = showNutrition ? item.nutritionGrade?.trim() : ''

        return (
            <ListItem
                variant="row"
                image={imageUrl ? { uri: imageUrl } : undefined}
                imageSize={40}
                title={String(item.name || 'Nimetön tuote').trim()}
                subtitle={
                    item.brands && item.brands.trim().length > 0
                        ? String(item.brands).trim()
                        : undefined
                }
                details={
                    grade || caloriesText ? (
                        <View style={styles.productMeta}>
                            {grade ? (
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
                            {caloriesText ? (
                                <CustomText style={styles.itemCalories}>
                                    {caloriesText}
                                </CustomText>
                            ) : null}
                        </View>
                    ) : null
                }
                onPress={() => handleSelectOpenFoodFactsItem(item)}
                style={styles.searchItem}
                trailing={
                    <View style={styles.itemRight}>
                        <CustomText style={styles.sourceLabelOFF}>
                            OFF
                        </CustomText>
                        <Ionicons
                            name="add-circle-outline"
                            size={20}
                            color="#5844BB"
                        />
                    </View>
                }
            />
        )
    }

    const getFilteredData = () => {
        switch (activeTab) {
            case 'local':
                return dedupeFoodItems(filteredLocalItems)
            case 'openfoodfacts':
                return dedupeFoodItems(openFoodFactsItems)
            default:
                // Smart deduplication: prioritize local items, remove exact name duplicates
                const seenNames = new Set()
                const seenKeys = new Set()
                const deduped = []

                // First add local items (they have priority)
                filteredLocalItems.forEach((item) => {
                    const normalizedName = normalizeItemName(item.name)
                    const key = getItemIdentity(item) || `local-${normalizedName}`

                    if (!seenNames.has(normalizedName) && !seenKeys.has(key)) {
                        seenNames.add(normalizedName)
                        seenKeys.add(key)
                        deduped.push(item)
                    }
                })

                // Then add Open Food Facts items (only if name doesn't exist)
                openFoodFactsItems.forEach((item) => {
                    const normalizedName = normalizeItemName(item.name)
                    const key = getItemIdentity(item) || `off-${normalizedName}`

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
            {!pendingMealPick && (
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
                {!isDesktop ? (
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={() => setShowScanner(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Skannaa viivakoodi"
                    >
                        <Ionicons name="barcode" size={24} color="#5844BB" />
                    </TouchableOpacity>
                ) : null}
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
                            maxToRenderPerBatch={20}
                            initialNumToRender={20}
                            windowSize={8}
                            getItemLayout={null} // Let FlatList calculate dynamically
                        />
                    )}
                </View>
            )}

            <BarcodeScanner
                onScanSuccess={handleBarcodeScanned}
                onCancel={() => setShowScanner(false)}
                isVisible={showScanner}
            />
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
        borderBottomColor: '#5844BB',
    },
    tabText: {
        fontSize: 12,
        color: '#666',
    },
    activeTabText: {
        color: '#5844BB',
        fontWeight: 'bold',
    },
    resultsList: {
        maxHeight: 280,
    },
    searchItem: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingVertical: 10,
        borderBottomColor: '#f0f0f0',
    },
    addedItem: {
        backgroundColor: '#f0f8f0',
        opacity: 1,
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
        marginTop: 4,
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
