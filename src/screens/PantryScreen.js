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
                // Get the items array from the pantry
                const pantryItems = response.data.pantry.items || []

                // Process items with data from foodItem if it exists in the response
                const processedItems = pantryItems.map((item) => {
                    // Get foodItem data from the response
                    const foodItem = response.data.foodItem || {}

                    return {
                        ...item,
                        // Use foodItem data if available, otherwise use item data or defaults
                        unit: item.unit || foodItem.unit || 'kpl',
                        category: item.category || foodItem.category || [],
                        calories: item.calories || foodItem.calories || 0,
                        price: item.price || foodItem.price || 0,
                    }
                })

                console.log('Processed pantry items:', processedItems)
                setPantryItems(processedItems)
            } else {
                console.error(
                    'Failed to fetch pantry items:',
                    response.data.message
                )
                Alert.alert('Virhe', 'Ruokakomeron haku epäonnistui')
                setPantryItems([])
            }
        } catch (error) {
            console.error(
                'Error fetching pantry items:',
                error?.response?.data || error
            )
            Alert.alert('Virhe', 'Ruokakomeron haku epäonnistui')
            setPantryItems([])
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
                getServerUrl('/pantry/items'),
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

    const renderPantryItem = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.listHeader}>
                <CustomText style={styles.listTitle}>{item.name}</CustomText>
                <View style={styles.itemCategories}>
                    {item.category?.length > 0 ? (
                        item.category.map((category, index) => (
                            <CustomText key={index} style={styles.category}>
                                {category}
                            </CustomText>
                        ))
                    ) : (
                        <CustomText style={styles.category}>
                            Ei kategoriaa
                        </CustomText>
                    )}
                </View>
            </View>
            <View style={styles.listStats}>
                <CustomText>
                    {item.quantity} {item.unit || 'kpl'}
                </CustomText>
                <CustomText>
                    {item.calories ? `${item.calories} kcal/100g` : ''}
                </CustomText>
            </View>
            <CustomText style={styles.expirationDate}>
                Parasta ennen:{' '}
                {new Date(item.expirationDate).toLocaleDateString()}
            </CustomText>
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
                        <FormFoodItem
                            onSubmit={handleAddItem}
                            location="pantry"
                            style={styles.formContainer}
                        />
                    </View>
                </View>
            </Modal>
            <CustomText style={styles.introText}>
                Selaa pentteriäsi eli ruokakomeroasi joita kotoasi jo löytyy ja
                käytä niitä avuksi ateriasuunnittelussa ja ostoslistan
                luonnissa. Voit myös lisätä täällä uusia elintarvikkeita
                pentteriisi. Ostoslistan tuotteet lisätään automaattisesti
                pentteriin
            </CustomText>
            <Button
                style={styles.primaryButton}
                title="Lisää elintarvike"
                onPress={() => setModalVisible(true)}
            />
            {loading ? (
                <CustomText>Ladataan...</CustomText>
            ) : Array.isArray(pantryItems) && pantryItems.length > 0 ? (
                <FlatList
                    style={styles.listContainer}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    data={pantryItems}
                    renderItem={renderPantryItem}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <CustomText style={styles.emptyText}>
                    Ei vielä tuotteita ruokakomerossa. Lisää tuotteita
                    painamalla "Lisää tuote" -nappia.
                </CustomText>
            )}
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
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
        position: 'relative',
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
        marginTop: 30,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
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
    },
    tertiaryButton: {
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
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    errorMsg: {
        color: 'red',
    },
    listItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    listHeader: {
        marginBottom: 10,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
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
    expirationDate: {
        color: '#666',
        fontSize: 14,
    },
    listContainer: {
        width: '100%',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    formContainer: {
        padding: 20,
    },
})
