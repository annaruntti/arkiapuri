import React, { useState } from 'react'
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    Alert,
    Text,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
import CustomText from './CustomText'
import Button from './Button'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import { analyzeImage } from '../utils/googleVision'
import FormFoodItem from './FormFoodItem'
import CustomModal from './CustomModal'

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
            console.log('Moving items:', checkedItemIds)
            console.log('Shopping list ID:', shoppingList._id)

            // Process each checked item
            for (const itemId of checkedItemIds) {
                console.log(`Processing item ${itemId}`)
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
                    console.log('Response for item:', response.data)
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

                console.log('Updated shopping list:', updatedList)
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
            <View style={styles.header}>
                <CustomText style={styles.title}>
                    {shoppingList.name}
                </CustomText>
                <CustomText style={styles.description}>
                    {shoppingList.description}
                </CustomText>
            </View>
            <View style={styles.addItemButtonsContainer}>
                <Button
                    title="Lisää tuote"
                    onPress={() => setShowItemForm(true)}
                    style={[styles.primaryButton, styles.halfWidthButton]}
                />
                <Button
                    title="Skannaa tuote"
                    onPress={handleScanProduct}
                    style={[styles.secondaryButton, styles.halfWidthButton]}
                    disabled={loading}
                />
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
                                      sum + (parseFloat(item.price) || 0),
                                  0
                              )
                              .toFixed(2)
                        : shoppingList.totalEstimatedPrice || 0}
                    €
                </CustomText>
            </View>
            <FlatList
                data={shoppingList.items}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={true}
            />
            {checkedItems.length > 0 && (
                <View style={styles.buttonContainer}>
                    <Button
                        title={`Siirrä ${checkedItems.length} tuotetta ruokavarastoon`}
                        onPress={() => moveCheckedToPantry(checkedItems)}
                        style={styles.secondaryButton}
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        marginBottom: 20,
        color: '#666',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    listContent: {
        paddingBottom: 20,
    },
    itemRow: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
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
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginBottom: 20,
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginTop: 10,
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
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
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
})

export default ShoppingListDetail
