import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
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
import storage from '../utils/storage'
import BarcodeScanner from './BarcodeScanner'
import CustomText from './CustomText'

const UnifiedFoodSearch = ({
    onSelectItem,
    location = 'shopping-list',
    shoppingListId = null,
    mealId = null,
}) => {
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

    // Fetch local food items when component mounts
    useEffect(() => {
        fetchLocalFoodItems()
    }, [])

    // Search effect - searches both local and Open Food Facts
    useEffect(() => {
        if (searchQuery.length >= 2) {
            searchItems()
        } else {
            setFilteredLocalItems([])
            setOpenFoodFactsItems([])
            setIsListVisible(false)
        }
    }, [searchQuery])

    // Click outside handler
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

    const searchItems = async () => {
        if (searchQuery.length < 2) return

        setLoading(true)
        setIsListVisible(true)

        try {
            // Search local items
            const localFiltered = localFoodItems.filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setFilteredLocalItems(localFiltered)

            // Search Open Food Facts
            if (activeTab === 'all' || activeTab === 'openfoodfacts') {
                try {
                    const response = await fetch(
                        `${getServerUrl('')}/api/openfoodfacts/search?q=${encodeURIComponent(searchQuery)}&limit=10`
                    )
                    const data = await response.json()

                    if (data.success) {
                        setOpenFoodFactsItems(data.products || [])
                    }
                } catch (offError) {
                    console.error('Error searching Open Food Facts:', offError)
                    // Don't fail the whole search if OFF is down
                    setOpenFoodFactsItems([])
                }
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
            const pantryItemData = {
                name: foodItem.name,
                quantity: collectionData.quantity,
                unit: collectionData.unit,
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
                if (data.collectionData.location === 'pantry') {
                    await addToPantry(data.foodItem, data.collectionData)
                } else if (
                    data.collectionData.location === 'shopping-list' &&
                    data.collectionData.shoppingListId
                ) {
                    await addToShoppingList(data.foodItem, data.collectionData)
                }

                Alert.alert('Onnistui!', 'Tuote lisätty listaan.')
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
        if (addedItems.has(item._id)) return

        setAddedItems((prev) => new Set(prev).add(item._id))
        onSelectItem(item)

        // Auto-hide after selection
        setTimeout(() => {
            setSearchQuery('')
            setIsListVisible(false)
            setAddedItems(new Set())
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

    const renderLocalItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.item, addedItems.has(item._id) && styles.addedItem]}
            onPress={() => handleSelectLocalItem(item)}
            disabled={addedItems.has(item._id)}
        >
            <View style={styles.itemContent}>
                <View style={styles.itemLeft}>
                    <View style={styles.itemNameContainer}>
                        <CustomText style={styles.itemName}>
                            {item.name}
                        </CustomText>
                        {item.calories && (
                            <CustomText style={styles.itemCalories}>
                                {item.calories} kcal
                            </CustomText>
                        )}
                    </View>
                    <View style={styles.itemDetails}>
                        <CustomText style={styles.itemCategory}>
                            {item.category?.join(', ') || 'Ei kategoriaa'}
                        </CustomText>
                    </View>
                </View>
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
                            color="#9C86FC"
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    )

    const renderOpenFoodFactsItem = ({ item }) => (
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
                        <CustomText style={styles.itemName} numberOfLines={2}>
                            {item.name}
                        </CustomText>
                        {item.brands && (
                            <CustomText
                                style={styles.itemBrand}
                                numberOfLines={1}
                            >
                                {item.brands}
                            </CustomText>
                        )}
                        <View style={styles.productMeta}>
                            {item.nutritionGrade && (
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
                                        {item.nutritionGrade.toUpperCase()}
                                    </CustomText>
                                </View>
                            )}
                            {item.nutrition.calories > 0 && (
                                <CustomText style={styles.itemCalories}>
                                    {Math.round(item.nutrition.calories)} kcal
                                </CustomText>
                            )}
                        </View>
                    </View>
                </View>
                <View style={styles.itemRight}>
                    <CustomText style={styles.sourceLabelOFF}>OFF</CustomText>
                    <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color="#9C86FC"
                    />
                </View>
            </View>
        </TouchableOpacity>
    )

    const getFilteredData = () => {
        switch (activeTab) {
            case 'local':
                return filteredLocalItems
            case 'openfoodfacts':
                return openFoodFactsItems
            default:
                return [...filteredLocalItems, ...openFoodFactsItems]
        }
    }

    const renderItem = ({ item }) => {
        if (item.source === 'openfoodfacts' || item.barcode) {
            return renderOpenFoodFactsItem({ item })
        }
        return renderLocalItem({ item })
    }

    return (
        <View style={styles.container} ref={searchContainerRef}>
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
                                {`Kaikki (${filteredLocalItems.length +
                                    openFoodFactsItems.length})`}
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
                                {`Omat (${filteredLocalItems.length})`}
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
                                {`Tietokanta (${openFoodFactsItems.length})`}
                            </CustomText>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={getFilteredData()}
                        renderItem={renderItem}
                        keyExtractor={(item) =>
                            item._id || item.barcode || Math.random().toString()
                        }
                        style={styles.resultsList}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            !loading ? (
                                <View style={styles.emptyContainer}>
                                    <CustomText style={styles.emptyText}>
                                        Ei tuloksia haulle "{searchQuery}"
                                    </CustomText>
                                </View>
                            ) : null
                        }
                    />
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
        maxWidth: 400,
        alignSelf: 'center',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    searchInputContainer: {
        flex: 1,
        position: 'relative',
        width: '100%',
        maxWidth: 400,
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
})

export default UnifiedFoodSearch
