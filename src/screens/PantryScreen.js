import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import FormFoodItem from '../components/FormFoodItem'
import PantryItemDetails from '../components/PantryItemDetails'
import ResponsiveModal from '../components/ResponsiveModal'
import UnifiedFoodSearch from '../components/UnifiedFoodSearch'
import { getServerUrl } from '../utils/getServerUrl'
import { scanItems } from '../utils/scanItems'
import storage from '../utils/storage'

const PantryScreen = ({}) => {
    const [showItemForm, setShowItemForm] = useState(false)
    const [pantryItems, setPantryItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [detailsVisible, setDetailsVisible] = useState(false)

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
                    setShowItemForm(false)
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

    const handleRemoveItem = async (itemId) => {
        try {
            const token = await storage.getItem('userToken')

            // Show confirmation dialog
            Alert.alert(
                'Poista tuote',
                'Haluatko varmasti poistaa tuotteen pentteristä?',
                [
                    {
                        text: 'Peruuta',
                        style: 'cancel',
                    },
                    {
                        text: 'Poista',
                        onPress: async () => {
                            try {
                                setLoading(true) // Show loading state
                                const response = await axios.delete(
                                    getServerUrl(`/pantry/items/${itemId}`),
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                )

                                if (response.data.success) {
                                    // Update local state to remove the item
                                    setPantryItems((prevItems) =>
                                        prevItems.filter(
                                            (item) => item._id !== itemId
                                        )
                                    )
                                    // Fetch updated list to ensure sync with server
                                    await fetchPantryItems()
                                } else {
                                    Alert.alert(
                                        'Virhe',
                                        'Tuotteen poisto epäonnistui'
                                    )
                                }
                            } catch (error) {
                                console.error('Error removing item:', error)
                                Alert.alert(
                                    'Virhe',
                                    'Tuotteen poisto epäonnistui: ' +
                                        (error.response?.data?.message ||
                                            error.message)
                                )
                            } finally {
                                setLoading(false) // Hide loading state
                            }
                        },
                        style: 'destructive',
                    },
                ]
            )
        } catch (error) {
            console.error('Error in handleRemoveItem:', error)
            Alert.alert('Virhe', 'Tuotteen poisto epäonnistui')
        }
    }

    const handleUpdateItem = async (itemId, updatedData) => {
        try {
            const token = await storage.getItem('userToken')
            setLoading(true)

            console.log('Sending update to backend:', updatedData)

            const response = await axios.put(
                getServerUrl(`/pantry/items/${itemId}`),
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                // Update the local state with the response data
                setPantryItems((prevItems) =>
                    prevItems.map((item) =>
                        item._id === itemId
                            ? {
                                  ...item,
                                  ...updatedData, // Use the updatedData directly
                                  category: updatedData.category, // check is category is updated
                              }
                            : item
                    )
                )
                setDetailsVisible(false)
                Alert.alert('Onnistui', 'Tuotteen tiedot päivitetty')
            } else {
                Alert.alert('Virhe', 'Tuotteen päivitys epäonnistui')
            }
        } catch (error) {
            console.error('Error updating item:', error)
            Alert.alert(
                'Virhe',
                'Tuotteen päivitys epäonnistui: ' +
                    (error.response?.data?.message || error.message)
            )
        } finally {
            setLoading(false)
        }
    }

    const handleSearchItemSelect = (item) => {
        // Add item to pantry or refresh the list if it was added via API
        fetchPantryItems()
        Alert.alert('Onnistui', `${item.name} lisätty pentteriisi`)
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => {
                setSelectedItem(item)
                setDetailsVisible(true)
            }}
        >
            <View style={styles.itemInfo}>
                <CustomText style={styles.itemName}>{item.name}</CustomText>
                <CustomText style={styles.itemDetails}>
                    {item.quantity} {item.unit}
                </CustomText>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                        handleRemoveItem(item._id)
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="delete" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )

    console.log('Current pantryItems state:', pantryItems)

    return (
        <View style={styles.container}>
            <ResponsiveModal
                visible={showItemForm}
                onClose={() => setShowItemForm(false)}
                title="Lisää tuote pantteriin"
                maxWidth={600}
            >
                <FormFoodItem onSubmit={handleAddItem} location="pantry" />
            </ResponsiveModal>
            <CustomText style={styles.infoTitle}>
                Etsi ja lisää tuotteita
            </CustomText>
            <CustomText style={styles.infoText}>
                Etsi tuotteita nimellä tai skannaa viivakoodi. Tulokset
                sisältävät sekä itse lisäämäsi tuotteet että Open Food Facts
                -tietokannasta löytyvät elintarvikkeet.
            </CustomText>
            <View style={styles.searchContainer}>
                <UnifiedFoodSearch
                    onSelectItem={handleSearchItemSelect}
                    location="pantry"
                />
            </View>

            <View style={styles.manualAddContainer}>
                <Button
                    title="+ Lisää tuote manuaalisesti"
                    onPress={() => setShowItemForm(true)}
                    style={styles.tertiaryButton}
                />
            </View>

            <View style={styles.stats}>
                <CustomText>
                    Tuotteita: {pantryItems?.length || 0} kpl
                </CustomText>
            </View>
            <FlatList
                data={pantryItems}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                extraData={pantryItems}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading && (
                        <CustomText style={styles.emptyText}>
                            Pentterissäsi ei ole vielä lisätty elintarvikkeita.
                        </CustomText>
                    )
                }
            />
            <PantryItemDetails
                item={selectedItem}
                visible={detailsVisible}
                onClose={() => {
                    setDetailsVisible(false)
                    setSelectedItem(null)
                }}
                onUpdate={handleUpdateItem}
            />
        </View>
    )
}

export default PantryScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 10,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 20,
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
        width: '48%',
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
        width: '48%',
    },
    itemContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemInfo: {
        flex: 1,
        flexDirection: 'column',
        marginRight: 10,
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
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#e0e0e0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
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
        padding: 15,
    },
    searchContainer: {
        marginBottom: 15,
        zIndex: 9998,
    },
    infoTitle: {
        paddingTop: 10,
        marginBottom: 20,
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
    manualAddContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
})
