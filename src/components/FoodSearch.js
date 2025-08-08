import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import BarcodeScanner from './BarcodeScanner'
import CustomInput from './CustomInput'
import CustomText from './CustomText'

const FoodSearch = ({
    onSelectProduct,
    location = 'shopping-list',
    visible,
    onClose,
}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [showScanner, setShowScanner] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [categories, setCategories] = useState([])

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories()
    }, [])

    // Search products when search query changes
    useEffect(() => {
        if (searchQuery.length >= 2) {
            const timeoutId = setTimeout(() => {
                searchProducts()
            }, 500) // Debounce search

            return () => clearTimeout(timeoutId)
        } else {
            setSearchResults([])
        }
    }, [searchQuery])

    const fetchCategories = async () => {
        try {
            const response = await fetch(
                `${getServerUrl('')}/api/openfoodfacts/categories`
            )
            const data = await response.json()

            if (data.success) {
                setCategories(data.categories)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const searchProducts = async () => {
        if (searchQuery.length < 2) return

        setLoading(true)
        try {
            const url = selectedCategory
                ? `${getServerUrl('')}/api/openfoodfacts/category/${selectedCategory}?limit=20`
                : `${getServerUrl('')}/api/openfoodfacts/search?q=${encodeURIComponent(searchQuery)}&limit=20`

            const response = await fetch(url)
            const data = await response.json()

            if (data.success) {
                setSearchResults(data.products || [])
            } else {
                setSearchResults([])
            }
        } catch (error) {
            console.error('Error searching products:', error)
            setSearchResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleBarcodeScanned = async (barcode) => {
        setShowScanner(false)
        setLoading(true)

        try {
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
                            onPress: () => addProductToList(data.product),
                        },
                    ]
                )
            } else {
                Alert.alert(
                    'Tuotetta ei löytynyt',
                    'Viivakoodi ei tuottanut tuloksia Open Food Facts -tietokannasta.',
                    [
                        {
                            text: 'Skannaa uudelleen',
                            onPress: () => setShowScanner(true),
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

    const addProductToList = async (product) => {
        try {
            const response = await fetch(
                `${getServerUrl('')}/api/openfoodfacts/add/${product.barcode}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${await getAuthToken()}`,
                    },
                    body: JSON.stringify({
                        location: location,
                        quantity: 1,
                        unit: 'pcs',
                    }),
                }
            )

            const data = await response.json()

            if (data.success) {
                Alert.alert('Onnistui!', 'Tuote lisätty listaan.')
                if (onSelectProduct) {
                    onSelectProduct(data.foodItem, data.openFoodFactsData)
                }
                onClose()
            } else {
                Alert.alert(
                    'Virhe',
                    data.message || 'Tuotteen lisääminen epäonnistui.'
                )
            }
        } catch (error) {
            console.error('Error adding product:', error)
            Alert.alert(
                'Virhe',
                'Tuotteen lisääminen epäonnistui. Yritä uudelleen.'
            )
        }
    }

    const getAuthToken = async () => {
        try {
            const token = await storage.getItem('userToken')
            return token
        } catch (error) {
            console.error('Error getting auth token:', error)
            return null
        }
    }

    const renderProductItem = ({ item }) => (
        <TouchableOpacity
            style={styles.productItem}
            onPress={() => addProductToList(item)}
        >
            <View style={styles.productInfo}>
                {item.imageUrl && (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.productImage}
                    />
                )}
                <View style={styles.productDetails}>
                    <CustomText style={styles.productName} numberOfLines={2}>
                        {item.name}
                    </CustomText>
                    {item.brands && (
                        <CustomText
                            style={styles.productBrand}
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
                            <CustomText style={styles.calories}>
                                {Math.round(item.nutrition.calories)} kcal
                            </CustomText>
                        )}
                    </View>
                </View>
            </View>
            <Ionicons name="add-circle" size={24} color="#9C86FC" />
        </TouchableOpacity>
    )

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.categoryItem,
                selectedCategory === item.key && styles.selectedCategory,
            ]}
            onPress={() => {
                setSelectedCategory(
                    selectedCategory === item.key ? null : item.key
                )
                setSearchQuery('')
            }}
        >
            <CustomText
                style={[
                    styles.categoryText,
                    selectedCategory === item.key &&
                        styles.selectedCategoryText,
                ]}
            >
                {item.name}
            </CustomText>
        </TouchableOpacity>
    )

    const getGradeColor = (grade) => {
        const colors = {
            a: '#00AA00',
            b: '#85BB2F',
            c: '#FFAA00',
            d: '#FF6600',
            e: '#FF0000',
        }
        return colors[grade.toLowerCase()] || '#ccc'
    }

    if (!visible) return null

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                    <CustomText style={styles.headerTitle}>
                        Hae tuotteita
                    </CustomText>
                    <TouchableOpacity onPress={() => setShowScanner(true)}>
                        <Ionicons name="barcode" size={24} color="#9C86FC" />
                    </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <CustomInput
                        placeholder="Hae tuotteiden nimellä..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                    />
                </View>

                {/* Categories */}
                <View style={styles.categoriesContainer}>
                    <CustomText style={styles.sectionTitle}>
                        Kategoriat
                    </CustomText>
                    <FlatList
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesList}
                    />
                </View>

                {/* Loading indicator */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#9C86FC" />
                        <CustomText style={styles.loadingText}>
                            Haetaan tuotteita...
                        </CustomText>
                    </View>
                )}

                {/* Search Results */}
                <FlatList
                    data={searchResults}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.barcode}
                    style={styles.resultsList}
                    contentContainerStyle={styles.resultsContainer}
                    ListEmptyComponent={
                        !loading && searchQuery.length >= 2 ? (
                            <View style={styles.emptyContainer}>
                                <CustomText style={styles.emptyText}>
                                    Ei tuloksia haulle "{searchQuery}"
                                </CustomText>
                            </View>
                        ) : null
                    }
                />

                {/* Barcode Scanner Modal */}
                {showScanner && (
                    <Modal visible={showScanner} animationType="slide">
                        <BarcodeScanner
                            onScanSuccess={handleBarcodeScanned}
                            onCancel={() => setShowScanner(false)}
                            isVisible={showScanner}
                        />
                    </Modal>
                )}
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
    },
    searchInput: {
        marginBottom: 0,
    },
    categoriesContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    categoriesList: {
        paddingHorizontal: 16,
    },
    categoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    selectedCategory: {
        backgroundColor: '#9C86FC',
    },
    categoryText: {
        fontSize: 14,
        color: '#333',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
    },
    resultsList: {
        flex: 1,
    },
    resultsContainer: {
        padding: 16,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    productInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 12,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productBrand: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    productMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gradeBox: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: 8,
    },
    gradeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    calories: {
        fontSize: 12,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
})

export default FoodSearch
