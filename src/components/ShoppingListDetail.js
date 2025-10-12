import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import {
    Alert,
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
import CustomModal from './CustomModal'
import CustomText from './CustomText'
import FormFoodItem from './FormFoodItem'
import UnifiedFoodSearch from './UnifiedFoodSearch'

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
    const { isDesktop } = useResponsiveDimensions()

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

    const itemSections = groupItemsByCategory(shoppingList.items || [])

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
            const newItem = {
                ...itemData,
                location: 'shopping-list',
            }

            const response = await axios.put(
                getServerUrl(`/shopping-lists/${shoppingList._id}`),
                {
                    ...shoppingList,
                    items: [...shoppingList.items, newItem],
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

    const renderItem = ({ item }) => (
        <View style={styles.itemRow}>
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => handleCheckItem(item)}
            >
                <View style={styles.itemContent}>
                    <CustomText style={styles.itemName}>{item.name}</CustomText>
                    <CustomText style={styles.itemDetails}>
                        {item.quantity} {item.unit}
                    </CustomText>
                    {item.categories && item.categories.length > 0 && (
                        <View style={styles.itemCategories}>
                            {item.categories.map((category, index) => (
                                <CustomText key={index} style={styles.category}>
                                    {category}
                                </CustomText>
                            ))}
                        </View>
                    )}
                </View>
                <View style={styles.checkboxContainer}>
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
                </View>
            </TouchableOpacity>
        </View>
    )

    return (
        <View style={styles.container}>
            <CustomModal
                visible={showItemForm}
                onClose={() => setShowItemForm(false)}
                title="Lisää tuote ostoslistaan"
            >
                <View style={styles.formContainer}>
                    <FormFoodItem
                        onSubmit={handleAddItem}
                        location="shopping-list"
                        initialData={scannedProduct}
                        onClose={() => {
                            setShowItemForm(false)
                            setScannedProduct(null)
                        }}
                    />
                </View>
            </CustomModal>

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
                        Hae tuotteita nimellä tai skannaa viivakoodi. Tulokset
                        sisältävät sekä omat tuotteesi että Open Food Facts
                        -tietokannan.
                    </CustomText>
                </View>

                {/* Sticky search section */}
                <View style={styles.stickySearchSection}>
                    <View style={styles.searchAndAddContainer}>
                        <UnifiedFoodSearch
                            onSelectItem={handleSearchItemSelect}
                            location="shopping-list"
                            shoppingListId={shoppingList._id}
                        />

                        <View style={styles.manualAddContainer}>
                            <Button
                                title="+ Luo uusi tuote"
                                onPress={() => setShowItemForm(true)}
                                style={[
                                    styles.tertiaryButton,
                                    isDesktop && styles.desktopPrimaryButton,
                                ]}
                                textStyle={styles.buttonText}
                            />
                        </View>
                    </View>
                    <View style={styles.stats}>
                        <CustomText>
                            Tuotteita: {shoppingList.items?.length || 0} kpl
                        </CustomText>
                        <CustomText>
                            Kokonaishinta:{' '}
                            {shoppingList.items && shoppingList.items.length > 0
                                ? shoppingList.items
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
                </View>

                {/* Items list container */}
                <View style={styles.itemsListContainer}>
                    <SectionList
                        sections={itemSections}
                        renderItem={renderItem}
                        renderSectionHeader={({ section: { title } }) => (
                            <View style={styles.sectionHeader}>
                                <CustomText style={styles.sectionHeaderText}>
                                    {title}
                                </CustomText>
                            </View>
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
                                    isDesktop && styles.desktopPrimaryButton,
                                ]}
                                textStyle={styles.buttonText}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        width: '100%',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    formContainer: {
        padding: 15,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 10,
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
        marginBottom: 20,
        fontSize: 14,
        textAlign: 'left',
    },
    searchAndAddContainer: {
        marginBottom: 15,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 9998,
        position: 'relative',
    },
    manualAddContainer: {
        marginTop: 15,
        marginBottom: 0,
        alignItems: 'center',
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
    sectionHeader: {
        backgroundColor: '#F0EBFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#9C86FC',
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
})

export default ShoppingListDetail
