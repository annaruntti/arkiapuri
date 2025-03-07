import React, { useState, useEffect } from 'react'
import {
    Alert,
    Modal,
    StyleSheet,
    View,
    FlatList,
    Pressable,
} from 'react-native'
import Button from '../components/Button'
import FormFoodItem from '../components/FormFoodItem'
import CustomText from '../components/CustomText'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import { AntDesign } from '@expo/vector-icons'
import { scanItems } from '../utils/scanItems'

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
                timeout: 10000,
            })

            console.log('Pantry response:', response.data)

            if (response.data.success) {
                const items =
                    response.data.pantry?.items || response.data.items || []
                setPantryItems(items)
                console.log('Set pantry items:', items.length)
            } else {
                console.error('Failed to fetch pantry items:', response.data)
                Alert.alert('Virhe', 'Pentterin sisältöä ei voitu hakea')
                setPantryItems([]) // Clear items on error
            }
        } catch (error) {
            console.error('Error fetching pantry items:', error)
            Alert.alert(
                'Virhe',
                'Pentterin tietojen haku epäonnistui: ' +
                    (error.message === 'timeout exceeded'
                        ? 'Yhteys aikakatkaistiin'
                        : error.message || 'Tuntematon virhe')
            )
            setPantryItems([]) // Clear items on error
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

            // Validate required fields
            if (!itemData.name || !itemData.unit) {
                Alert.alert('Virhe', 'Nimi ja yksikkö ovat pakollisia tietoja')
                return
            }

            // First create the FoodItem
            const foodItemData = {
                name: itemData.name.trim(),
                category: itemData.category || [],
                unit: itemData.unit,
                price: Number(itemData.price) || 0,
                calories: Number(itemData.calories) || 0,
                locations: ['pantry'],
                quantities: {
                    meal: 0,
                    'shopping-list': 0,
                    pantry: Number(itemData.quantity) || 1,
                },
                expirationDate:
                    itemData.expirationDate ||
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }

            console.log('Creating FoodItem:', foodItemData)

            const foodItemResponse = await axios.post(
                getServerUrl('/food-items'),
                foodItemData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (foodItemResponse.data.success) {
                // Then create the pantry item
                const pantryItemData = {
                    name: itemData.name.trim(),
                    quantity: Number(itemData.quantity) || 1,
                    unit: itemData.unit,
                    expirationDate:
                        itemData.expirationDate ||
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    foodId: foodItemResponse.data.foodItem._id,
                    category: itemData.category || [],
                    calories: Number(itemData.calories) || 0,
                    price: Number(itemData.price) || 0,
                    addedFrom: 'pantry',
                }

                console.log('Creating Pantry item:', pantryItemData)

                const pantryResponse = await axios.post(
                    getServerUrl('/pantry/items'),
                    pantryItemData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                )

                if (pantryResponse.data.success) {
                    setModalVisible(false)
                    await fetchPantryItems()
                    Alert.alert(
                        'Onnistui',
                        `Tuote "${itemData.name}" lisätty pentteriin`
                    )
                } else {
                    throw new Error('Failed to add item to pantry')
                }
            } else {
                throw new Error('Failed to create food item')
            }
        } catch (error) {
            console.error('Error adding item:', error?.response?.data || error)
            Alert.alert(
                'Virhe',
                'Tuotteen lisääminen epäonnistui: ' +
                    (error.message || 'Tuntematon virhe')
            )
        }
    }

    const handleScanPantry = async () => {
        try {
            setLoading(true)
            const response = await scanItems('pantry')

            if (response?.success) {
                await fetchPantryItems()
                Alert.alert('Onnistui', 'Pentterin tiedot päivitetty')
            } else {
                throw new Error('Skannaus epäonnistui')
            }
        } catch (error) {
            console.error('Error scanning pantry:', error)
            Alert.alert(
                'Virhe',
                'Skannaus epäonnistui: ' +
                    (error.message === 'timeout exceeded'
                        ? 'Yhteys aikakatkaistiin'
                        : error.message || 'Tuntematon virhe')
            )
            await fetchPantryItems() // Try to restore pantry items
        } finally {
            setLoading(false)
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
                Selaa pentteriäsi eli ruokakomeroasi ja käytä kotoasi jo
                löytyviä elintarvikkeita avuksi ateriasuunnittelussa ja
                ostoslistan luonnissa.
            </CustomText>
            <CustomText style={styles.infoText}>
                Voit lisätä uusia elintarvikkeita pentteriisi manuaalisesti
                lomakkeen avulla tai skannata ne kameran avulla.
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
