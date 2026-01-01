import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import {
    Alert,
    Image,
    ScrollView,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import categoriesData from '../data/categories.json'
import { getServerUrl } from '../utils/getServerUrl'
import { analyzeImage } from '../utils/googleVision'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import Button from './Button'
import CategorySectionHeader from './CategorySectionHeader'
import CustomText from './CustomText'
import FormFoodItem from './FormFoodItem'
import GenericFilter from './GenericFilter'
import GenericFilterSection from './GenericFilterSection'
import PantryItemDetails from './PantryItemDetails'
import SearchSection from './SearchSection'

const ShoppingListDetail = ({
    shoppingList,
    onUpdate,
    fetchShoppingLists,
    fetchPantryItems,
}) => {
    const [checkedItems, setCheckedItems] = useState([])
    const [showItemForm, setShowItemForm] = useState(false)
    const [scannedProduct, setScannedProduct] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null)
    const [showItemDetails, setShowItemDetails] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategoryFilters, setSelectedCategoryFilters] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const { isDesktop } = useResponsiveDimensions()

    const SHOPPING_LIST_PLACEHOLDER_IMAGE_URL =
        'https://images.ctfassets.net/2pij69ehhf4n/1YIQLI04JJpf76ARo3k0b9/87322f1b9ccec07d2f2af66f7d61d53d/undraw_online-groceries_n03y.png'

    // Group items by category for section list
    const groupItemsByCategory = (items) => {
        // Get all ingredient categories from categories.json
        const ingredientCategories =
            categoriesData.find((cat) => cat.id === 'ingredients')?.children ||
            []

        // Create a map of category id to category name
        const categoryMap = {}
        ingredientCategories.forEach((cat) => {
            categoryMap[cat.id] = cat.name
        })

        // Group items by their first ingredient category
        const grouped = {}
        const uncategorized = []

        items.forEach((item) => {
            if (item.category && item.category.length > 0) {
                // Find the first matching ingredient category
                let foundCategory = false
                for (const categoryId of item.category) {
                    if (categoryMap[categoryId]) {
                        const categoryName = categoryMap[categoryId]
                        if (!grouped[categoryName]) {
                            grouped[categoryName] = []
                        }
                        grouped[categoryName].push(item)
                        foundCategory = true
                        break
                    }
                }

                if (!foundCategory) {
                    uncategorized.push(item)
                }
            } else {
                uncategorized.push(item)
            }
        })

        // Convert to section list format
        const sections = Object.keys(grouped)
            .sort()
            .map((categoryName) => ({
                title: categoryName,
                data: grouped[categoryName],
            }))

        // Add uncategorized items at the end if any
        if (uncategorized.length > 0) {
            sections.push({
                title: 'Muut',
                data: uncategorized,
            })
        }

        return sections
    }

    // Get ingredient categories from categories.json
    const ingredientCategories =
        categoriesData.find((cat) => cat.id === 'ingredients')?.children || []

    // Filter items based on search query
    const filterItemsBySearch = (items) => {
        if (!searchQuery.trim()) {
            return items
        }

        return items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
    }

    // Filter items based on selected category filters
    const filterItemsByCategory = (items) => {
        if (selectedCategoryFilters.length === 0) {
            return items
        }

        return items.filter((item) => {
            if (!item.category || item.category.length === 0) {
                return false
            }

            // Item must have at least one of the selected category filters
            // Normalize both sides to strings for consistent comparison
            return selectedCategoryFilters.some((filterId) =>
                item.category.some(
                    (itemCatId) => String(itemCatId) === String(filterId)
                )
            )
        })
    }

    const toggleCategoryFilter = (categoryId) => {
        setSelectedCategoryFilters((prev) => {
            // Normalize to string for consistent comparison
            const normalizedId = String(categoryId)

            // Check if already selected (normalize for comparison)
            const isSelected = prev.some((id) => String(id) === normalizedId)

            if (isSelected) {
                return prev.filter((id) => String(id) !== normalizedId)
            } else {
                return [...prev, normalizedId]
            }
        })
    }

    const getCategoryItemCounts = () => {
        const counts = {}
        const searchedItems = filterItemsBySearch(shoppingList.items || [])

        ingredientCategories.forEach((category) => {
            counts[category.id] = searchedItems.filter((item) => {
                if (!item.category || item.category.length === 0) {
                    return false
                }
                return item.category.includes(String(category.id))
            }).length
        })

        return counts
    }

    // Apply both search and category filters
    const filteredItems = filterItemsByCategory(
        filterItemsBySearch(shoppingList.items || [])
    )

    const itemSections = groupItemsByCategory(filteredItems)

    const handleCheckItem = (item) => {
        setCheckedItems((prev) =>
            prev.includes(item._id)
                ? prev.filter((id) => id !== item._id)
                : [...prev, item._id]
        )
    }

    const moveCheckedToPantry = async (checkedItemIds) => {
        try {
            const token = await storage.getItem('userToken')

            // Process each checked item
            for (const itemId of checkedItemIds) {
                try {
                    const response = await axios.post(
                        getServerUrl(
                            `/shopping-lists/${shoppingList._id}/items/${itemId}/bought`
                        ),
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                } catch (itemError) {
                    console.error(`Error processing item ${itemId}:`, itemError)
                    throw itemError
                }
            }
            Alert.alert('Onnistui', 'Tuotteet siirretty ruokavarastoon')

            // Remove moved items from the shopping list
            const updatedItems = shoppingList.items.filter(
                (item) => !checkedItemIds.includes(item._id)
            )
            const updatedList = { ...shoppingList, items: updatedItems }

            // Update the shopping list
            await axios.put(
                getServerUrl(`/shopping-lists/${shoppingList._id}`),
                updatedList,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            // Clear checked items
            setCheckedItems([])

            // Refresh the shopping lists and pantry items
            await fetchShoppingLists()
            await fetchPantryItems()
            onUpdate(updatedList)
        } catch (error) {
            console.error('Error moving items to pantry:', error)
            console.error('Error response:', error.response?.data)
            console.error('Error status:', error.response?.status)
            Alert.alert('Virhe', 'Tuotteiden siirto ruokavarastoon epäonnistui')
        }
    }

    const handleAddItem = async (itemData) => {
        try {
            const token = await storage.getItem('userToken')

            // Create a FoodItem first so we can attach images later
            let foodItemId = itemData.foodId

            if (!foodItemId) {
                try {
                    const foodItemData = {
                        name: itemData.name,
                        category: itemData.category || [],
                        unit: itemData.unit || 'kpl',
                        price: itemData.price || 0,
                        calories: itemData.calories || 0,
                        location: 'shopping-list',
                        locations: ['shopping-list'],
                        quantity: itemData.quantity || 1,
                        quantities: {
                            meal: 0,
                            'shopping-list': itemData.quantity || 1,
                            pantry: 0,
                        },
                    }

                    const foodItemResponse = await axios.post(
                        getServerUrl('/food-items'),
                        foodItemData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (foodItemResponse.data.success) {
                        foodItemId = foodItemResponse.data.foodItem._id
                    }
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

            // Clean existing items to ensure foodId is just an ID
            const cleanedExistingItems = shoppingList.items.map((item) => ({
                ...item,
                foodId: item.foodId?._id || item.foodId,
            }))

            const response = await axios.put(
                getServerUrl(`/shopping-lists/${shoppingList._id}`),
                {
                    items: [...cleanedExistingItems, newItem],
                    totalEstimatedPrice: shoppingList.totalEstimatedPrice || 0,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                // Updating the list with the correct data
                const updatedList = response.data.shoppingList
                onUpdate(updatedList)
                setShowItemForm(false)
            }
        } catch (error) {
            console.error('Error adding item:', error?.response?.data || error)
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const processVisionResults = (visionResponse) => {
        const products = []

        // Process text detection
        if (visionResponse.textAnnotations) {
            const text = visionResponse.textAnnotations[0]?.description || ''
            // logic to extract product information from text
        }

        // Process object detection
        if (visionResponse.localizedObjectAnnotations) {
            visionResponse.localizedObjectAnnotations.forEach((object) => {
                if (object.score > 0.5) {
                    products.push({
                        name: object.name,
                        confidence: object.score,
                    })
                }
            })
        }

        return products
    }

    const handleScanProduct = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert(
                    'Virhe',
                    'Tarvitsemme kameran käyttöoikeuden skannataksemme tuotteita'
                )
                return
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                quality: 0.8,
                base64: true,
            })

            if (!result.canceled) {
                setLoading(true)

                const visionResponse = await analyzeImage(
                    result.assets[0].base64
                )
                const detectedProduct = processVisionResults(visionResponse)

                if (detectedProduct.length > 0) {
                    // Open add item form with pre-filled data
                    setShowItemForm(true)
                    // Pass the detected product to form component
                    setScannedProduct(detectedProduct[0])
                } else {
                    Alert.alert('Virhe', 'Tuotetta ei tunnistettu')
                }
            }
        } catch (error) {
            console.error('Error scanning product:', error)
            Alert.alert('Virhe', 'Skannaus epäonnistui')
        } finally {
            setLoading(false)
        }
    }

    const handleSearchItemSelect = async (selectedItem) => {
        try {
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
            const token = await storage.getItem('userToken')

            // Find the item in the shopping list
            const itemIndex = shoppingList.items.findIndex(
                (item) => item._id === itemId
            )
            if (itemIndex === -1) {
                Alert.alert('Virhe', 'Tuotetta ei löytynyt')
                return
            }

            const currentItem = shoppingList.items[itemIndex]
            let foodItemId = currentItem.foodId?._id || currentItem.foodId

            // If foodId is being updated (from image upload), extract the ID
            if (updatedData.foodId && typeof updatedData.foodId === 'object') {
                foodItemId = updatedData.foodId._id || updatedData.foodId
                updatedData.foodId = foodItemId
            }

            // If there's no foodId but we need one (e.g., for image upload), create a FoodItem
            if (!foodItemId && (updatedData.image || updatedData.category)) {
                try {
                    const foodItemData = {
                        name: updatedData.name || currentItem.name,
                        category:
                            updatedData.category || currentItem.category || [],
                        unit: updatedData.unit || currentItem.unit || 'kpl',
                        price: updatedData.price || currentItem.price || 0,
                        calories:
                            updatedData.calories || currentItem.calories || 0,
                        location: 'shopping-list',
                        locations: ['shopping-list'],
                        quantity:
                            updatedData.quantity || currentItem.quantity || 1,
                        quantities: {
                            meal: 0,
                            'shopping-list':
                                updatedData.quantity ||
                                currentItem.quantity ||
                                1,
                            pantry: 0,
                        },
                    }

                    const foodItemResponse = await axios.post(
                        getServerUrl('/food-items'),
                        foodItemData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (foodItemResponse.data.success) {
                        foodItemId = foodItemResponse.data.foodItem._id
                        updatedData.foodId = foodItemId
                    }
                } catch (foodItemError) {
                    console.error('Error creating food item:', foodItemError)
                    // Continue with update even if food item creation fails
                }
            }

            // Update the items array
            const updatedItems = [...shoppingList.items]
            updatedItems[itemIndex] = {
                ...updatedItems[itemIndex],
                ...updatedData,
            }

            // Clean items to ensure foodId is just an ID, not a populated object
            const cleanedItems = updatedItems.map((item) => ({
                ...item,
                foodId: item.foodId?._id || item.foodId,
            }))

            // Calculate total estimated price
            const totalEstimatedPrice = cleanedItems.reduce(
                (total, item) => total + (parseFloat(item.price) || 0),
                0
            )

            // Update the shopping list - send only items and totalEstimatedPrice
            const response = await axios.put(
                getServerUrl(`/shopping-lists/${shoppingList._id}`),
                {
                    items: cleanedItems,
                    totalEstimatedPrice: totalEstimatedPrice,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                console.log(
                    'Update response:',
                    JSON.stringify(
                        response.data.shoppingList.items[itemIndex],
                        null,
                        2
                    )
                )
                onUpdate(response.data.shoppingList)
                setShowItemDetails(false)
            }
        } catch (error) {
            console.error('Error updating item:', error)
            console.error('Error response:', error.response?.data)
            Alert.alert('Virhe', 'Tuotteen päivitys epäonnistui')
        }
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemRow}>
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => handleItemPress(item)}
                onLongPress={() => handleCheckItem(item)}
            >
                <Image
                    source={{
                        uri:
                            item.image?.url ||
                            SHOPPING_LIST_PLACEHOLDER_IMAGE_URL,
                    }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
                <View style={styles.itemContent}>
                    <CustomText style={styles.itemName}>{item.name}</CustomText>
                    <CustomText style={styles.itemDetails}>
                        {item.quantity} {item.unit}
                    </CustomText>
                </View>
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => handleCheckItem(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons
                        name={
                            checkedItems.includes(item._id)
                                ? 'check-box'
                                : 'check-box-outline-blank'
                        }
                        size={24}
                        color={
                            checkedItems.includes(item._id) ? '#38E4D9' : '#666'
                        }
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    )

    return (
        <View style={styles.container}>
            {showItemForm ? (
                <View style={styles.formWrapper}>
                    <View style={styles.formHeader}>
                        <TouchableOpacity
                            onPress={() => {
                                setShowItemForm(false)
                                setScannedProduct(null)
                            }}
                            style={styles.backButton}
                        >
                            <MaterialIcons
                                name="arrow-back"
                                size={24}
                                color="#000"
                            />
                        </TouchableOpacity>
                        <CustomText style={styles.formTitle}>
                            Lisää tuote ostoslistaan
                        </CustomText>
                    </View>
                    <FormFoodItem
                        onSubmit={handleAddItem}
                        location="shopping-list"
                        initialData={scannedProduct}
                        onClose={() => {
                            setShowItemForm(false)
                            setScannedProduct(null)
                        }}
                        showUnifiedSearch={true}
                        onSearchItemSelect={handleSearchItemSelect}
                        shoppingListId={shoppingList._id}
                    />
                </View>
            ) : (
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
                                                  (parseFloat(item.price) || 0),
                                              0
                                          )
                                          .toFixed(2)
                                    : shoppingList.totalEstimatedPrice || 0}
                                €
                            </CustomText>
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
            )}

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
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        zIndex: 1,
        position: 'relative',
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
        borderColor: '#9C86FC',
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
})

export default ShoppingListDetail
