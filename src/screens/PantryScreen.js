import React, { useState, useEffect } from 'react'
import {
    Alert,
    Modal,
    StyleSheet,
    View,
    Text,
    FlatList,
    Pressable,
} from 'react-native'
import Button from '../components/Button'
import FormFoodItem from '../components/FormFoodItem'
import CustomText from '../components/CustomText'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import categories from '../data/categories'
import { AntDesign } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { analyzeImage } from '../utils/googleVision'

const PantryScreen = ({}) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [pantryItems, setPantryItems] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPantryItems = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            console.log('Pantry response:', response.data)

            if (response.data.success) {
                const items =
                    response.data.pantry?.items || response.data.items || []
                setPantryItems(items)
                console.log('Set pantry items:', items.length)
            } else {
                console.error('Failed to fetch pantry items:', response.data)
                Alert.alert('Virhe', 'Pentterin tietojen haku epäonnistui')
            }
        } catch (error) {
            console.error('Error fetching pantry items:', error)
            Alert.alert('Virhe', 'Pentterin tietojen haku epäonnistui')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPantryItems()
    }, [])

    const handleAddItem = async (itemData) => {
        try {
            const token = await storage.getItem('userToken')

            console.log('Item data before formatting:', itemData)

            if (
                !Array.isArray(itemData.category) ||
                itemData.category.length === 0
            ) {
                Alert.alert('Virhe', 'Valitse vähintään yksi kategoria')
                return
            }

            const formattedItem = {
                name: itemData.name,
                category: itemData.category.map((id) => {
                    const category = categories.find((cat) => cat.id === id)
                    if (!category) {
                        console.error('Category not found for id:', id)
                        return id
                    }
                    return category.name
                }),
                quantity: Number(itemData.quantity),
                unit: itemData.unit,
                price: itemData.price ? Number(itemData.price) : 0,
                calories: itemData.calories ? Number(itemData.calories) : 0,
                expirationDate: itemData.expirationDate,
            }

            console.log('Formatted item:', formattedItem)

            if (!formattedItem.unit) {
                Alert.alert('Virhe', 'Yksikkö on pakollinen tieto')
                return
            }

            const response = await axios.post(
                getServerUrl('/food-items'),
                formattedItem,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                setModalVisible(false)
                setTimeout(async () => {
                    try {
                        await fetchPantryItems()
                    } catch (error) {
                        console.error('Error refreshing list:', error)
                    }
                }, 100)
            } else {
                Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
            }
        } catch (error) {
            console.error('Error adding item:', error?.response?.data || error)
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const handleScanPantry = async () => {
        try {
            // Request camera permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert(
                    'Virhe',
                    'Tarvitsemme kameran käyttöoikeuden skannataksemme tuotteita'
                )
                return
            }

            // Take a photo
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                quality: 0.8,
                base64: true,
            })

            if (!result.canceled) {
                setLoading(true)

                // Analyze the image
                const visionResponse = await analyzeImage(
                    result.assets[0].base64
                )

                // Process the results
                const detectedProducts = processVisionResults(visionResponse)

                // Update pantry
                await updatePantryWithDetectedItems(detectedProducts)

                Alert.alert('Onnistui', 'Pentterin tiedot päivitetty')
            }
        } catch (error) {
            console.error('Error scanning pantry:', error)
            Alert.alert('Virhe', 'Skannaus epäonnistui')
        } finally {
            setLoading(false)
        }
    }

    const processVisionResults = (visionResponse) => {
        const products = []

        // Process text detection (for product names, quantities, etc.)
        if (visionResponse.textAnnotations) {
            const text = visionResponse.textAnnotations[0]?.description || ''
            // Add logic to extract product information from text
        }

        // Process object detection
        if (visionResponse.localizedObjectAnnotations) {
            visionResponse.localizedObjectAnnotations.forEach((obj) => {
                if (
                    obj.name.toLowerCase().includes('food') ||
                    obj.name.toLowerCase().includes('package')
                ) {
                    products.push({
                        name: obj.name,
                        confidence: obj.score,
                    })
                }
            })
        }

        // Process labels
        if (visionResponse.labelAnnotations) {
            visionResponse.labelAnnotations.forEach((label) => {
                if (label.score > 0.7) {
                    // Confidence threshold
                    products.push({
                        name: label.description,
                        confidence: label.score,
                    })
                }
            })
        }

        return products
    }

    const updatePantryWithDetectedItems = async (detectedProducts) => {
        try {
            const token = await storage.getItem('userToken')

            // Map detected products to match your food item schema
            const formattedItems = detectedProducts.map((product) => ({
                name: product.name,
                category: ['other'], // Default category
                unit: 'kpl', // Default unit
                price: 0, // Default price
                calories: 0, // Default calories
                locations: ['pantry'], // Set location
                quantities: {
                    meal: 0,
                    'shopping-list': 0,
                    pantry: 1, // Set quantity for pantry
                },
                expirationDate: null, // Optional
                expireDay: null, // Optional
            }))

            const response = await axios.post(
                getServerUrl('/food-items'),
                formattedItems[0], // Send first detected item
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                await fetchPantryItems()
                Alert.alert(
                    'Onnistui',
                    `Tuote "${formattedItems[0].name}" lisätty pentteriin`
                )
            } else {
                console.error('Failed to add detected item:', response.data)
                Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
            }
        } catch (error) {
            console.error('Error adding detected item:', error)
            console.error('Error response:', error.response?.data)
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemInfo}>
                <CustomText style={styles.itemName}>{item.name}</CustomText>
                <CustomText style={styles.itemDetails}>
                    {item.quantity} {item.unit}
                </CustomText>
                {item.expirationDate && (
                    <CustomText style={styles.itemDetails}>
                        Parasta ennen:{' '}
                        {new Date(item.expirationDate).toLocaleDateString(
                            'fi-FI'
                        )}
                    </CustomText>
                )}
            </View>
            <View style={styles.itemActions}>
                <Button
                    title="Poista"
                    onPress={() => handleDeleteItem(item._id)}
                    style={styles.tertiaryButton}
                />
            </View>
        </View>
    )

    console.log('Current pantryItems state:', pantryItems)

    return (
        <View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Pressable
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <AntDesign name="close" size={24} color="black" />
                        </Pressable>
                        <View style={styles.modalHeader}>
                            <CustomText style={styles.modalTitle}>
                                Lisää tuote ruokakomeroon
                            </CustomText>
                        </View>
                        <View style={styles.modalBody}>
                            <FormFoodItem
                                onSubmit={handleAddItem}
                                location="pantry"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            <CustomText style={styles.introText}>
                Selaa pentteriäsi eli ruokakomeroasi joita kotoasi jo löytyy ja
                käytä niitä avuksi ateriasuunnittelussa ja ostoslistan
                luonnissa.
            </CustomText>
            <CustomText style={styles.infoText}>
                Voit lisätä uusia elintarvikkeita pentteriisi manuaalisesti
                lomakkeen avulla tai skannata ne kameran avulla. Ostoslistan
                tuotteet lisätään automaattisesti pentteriin kun ne merkitään
                ostetuiksi.
            </CustomText>
            <View style={styles.buttonContainer}>
                <Button
                    title="Lisää elintarvike"
                    onPress={() => setModalVisible(true)}
                    style={styles.primaryButton}
                />
                <Button
                    title="Skannaa pentteri"
                    onPress={handleScanPantry}
                    style={styles.secondaryButton}
                />
            </View>
            <FlatList
                data={pantryItems}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading && (
                        <CustomText style={styles.emptyText}>
                            Pentteri on tyhjä
                        </CustomText>
                    )
                }
            />
        </View>
    )
}

export default PantryScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    introText: {
        fontSize: 17,
        textAlign: 'center',
        padding: 20,
    },
    infoText: {
        fontSize: 15,
        textAlign: 'center',
        paddingTop: 5,
        paddingBottom: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        flex: 1,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: 50,
        paddingHorizontal: 20,
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 5,
        zIndex: 1,
    },
    modalHeader: {
        width: '100%',
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalBody: {
        flex: 1,
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
        marginBottom: 20,
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
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    errorMsg: {
        color: 'red',
    },
    itemContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemInfo: {
        flexDirection: 'column',
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemDetails: {
        color: '#666',
        fontSize: 14,
    },
    itemActions: {
        flexDirection: 'row',
        gap: 5,
    },
    deleteButton: {
        backgroundColor: '#ff3b30',
        padding: 5,
        borderRadius: 5,
    },
    list: {
        width: '100%',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    formContainer: {
        padding: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
})
