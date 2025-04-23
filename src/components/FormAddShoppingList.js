import React, { useState } from 'react'
import {
    StyleSheet,
    View,
    Alert,
    TouchableOpacity,
    FlatList,
} from 'react-native'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import CustomInput from './CustomInput'
import CustomText from './CustomText'
import Button from './Button'
import FormFoodItem from './FormFoodItem'
import storage from '../utils/storage'
import { getServerUrl } from '../utils/getServerUrl'
import CustomModal from './CustomModal'

const FormAddShoppingList = ({ onSubmit, onClose }) => {
    const [showItemForm, setShowItemForm] = useState(true)
    const [items, setItems] = useState([])
    const [foodItemModalVisible, setFoodItemModalVisible] = useState(false)
    const [pantryModalVisible, setPantryModalVisible] = useState(false)
    const [pantryItems, setPantryItems] = useState([])
    const [selectedShoppingListId, setSelectedShoppingListId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
            totalEstimatedPrice: '',
        },
    })

    const handleAddItem = (itemData) => {
        console.log('Item data received in handleAddItem:', itemData)
        const newItem = {
            ...itemData,
            location: 'shopping-list',
            quantity: itemData.quantity, // Keep the original quantity string
            unit: itemData.unit || 'kpl',
        }
        console.log('New item being added:', newItem)
        setItems([...items, newItem])
        setShowItemForm(false)
    }

    const handleSubmitForm = async (data) => {
        try {
            const token = await storage.getItem('userToken')
            console.log('Token for submit:', token)

            if (!token) {
                console.error('No token found')
                Alert.alert('Virhe', 'Kirjaudu sisään uudelleen')
                return
            }

            console.log('Items before processing:', items)

            // Process items to ensure quantities are properly formatted
            const processedItems = items.map((item) => {
                console.log('Processing item:', item)
                const processedItem = {
                    ...item,
                    quantity: parseFloat(item.quantity),
                    price: parseFloat(item.price) || 0,
                    calories: parseInt(item.calories) || 0,
                }
                console.log('Processed item:', processedItem)
                return processedItem
            })

            const shoppingListData = {
                ...data,
                items: processedItems,
                totalEstimatedPrice: data.totalEstimatedPrice || 0,
            }

            console.log(
                'Final shopping list data being sent:',
                shoppingListData
            )

            const response = await axios.post(
                getServerUrl('/shopping-lists'),
                shoppingListData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            console.log('Response:', response.data)

            if (response.data) {
                onSubmit(response.data)
                reset()
                setItems([])
                onClose()
            }
        } catch (error) {
            console.error(
                'Error creating shopping list:',
                error?.response?.data || error
            )
            if (error?.response?.status === 401) {
                Alert.alert('Virhe', 'Kirjaudu sisään uudelleen')
            } else {
                Alert.alert('Virhe', 'Ostoslistan luonti epäonnistui')
            }
        }
    }

    const handleAddFoodItem = (itemData) => {
        console.log('Item data received in handleAddFoodItem:', itemData)
        const newItem = {
            ...itemData,
            location: 'shopping-list',
            quantity: itemData.quantity, // Keep the original quantity string
            unit: itemData.unit || 'kpl',
        }
        console.log('New item being added:', newItem)
        setItems([...items, newItem])
        setFoodItemModalVisible(false)
    }

    const handlePantryItemSelect = async (itemId) => {
        try {
            setIsLoading(true)
            const response = await axios.get(
                getServerUrl(`/pantry-items/${itemId}`),
                {
                    headers: {
                        Authorization: `Bearer ${await storage.getItem('userToken')}`,
                    },
                }
            )
            if (response.data) {
                setPantryItems([response.data])
                setPantryModalVisible(true)
            }
        } catch (error) {
            console.error('Error fetching pantry item:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const addSelectedPantryItems = () => {
        // Implementation of adding selected pantry items to the shopping list
        console.log('Adding selected pantry items to shopping list')
        setPantryModalVisible(false)
    }

    const renderPantryItem = ({ item }) => (
        <View style={styles.itemRow}>
            <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => handlePantryItemSelect(item._id)}
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
            </TouchableOpacity>
        </View>
    )

    return (
        <View style={styles.container}>
            <CustomModal
                visible={showItemForm}
                onClose={() => {
                    setShowItemForm(false)
                    onClose()
                }}
                title="Luo uusi ostoslista"
            >
                <View style={styles.modalBody}>
                    <View style={styles.formContainer}>
                        <CustomInput
                            label="Ostoslistan nimi"
                            name="name"
                            placeholder="Kirjoita ostoslistan nimi"
                            control={control}
                            rules={{
                                required: 'Ostoslistan nimi on pakollinen',
                            }}
                        />
                        {errors.name && (
                            <CustomText style={styles.errorMsg}>
                                {errors.name.message}
                            </CustomText>
                        )}

                        <CustomInput
                            label="Kuvaus"
                            name="description"
                            placeholder="Kirjoita kuvaus"
                            control={control}
                        />

                        <CustomInput
                            label="Arvioitu kokonaishinta"
                            name="totalEstimatedPrice"
                            placeholder="Syötä arvioitu kokonaishinta"
                            control={control}
                            keyboardType="numeric"
                        />

                        <Button
                            style={styles.secondaryButton}
                            title="Lisää ostoslistalle tuote"
                            onPress={() => setFoodItemModalVisible(true)}
                        />

                        {items.length > 0 && (
                            <View style={styles.itemsList}>
                                <CustomText style={styles.subtitle}>
                                    Lisätyt tuotteet:
                                </CustomText>
                                {items.map((item, index) => (
                                    <View key={index} style={styles.itemRow}>
                                        <CustomText>
                                            {item.name} - {item.quantity}{' '}
                                            {item.unit} - {item.estimatedPrice}€
                                        </CustomText>
                                    </View>
                                ))}
                            </View>
                        )}

                        <Button
                            style={styles.primaryButton}
                            title="Tallenna ostoslista"
                            onPress={handleSubmit(handleSubmitForm)}
                        />
                    </View>
                </View>
            </CustomModal>

            <CustomModal
                visible={foodItemModalVisible}
                onClose={() => setFoodItemModalVisible(false)}
                title="Lisää uusi raaka-aine"
            >
                <View style={styles.modalBody}>
                    <FormFoodItem
                        onSubmit={handleAddFoodItem}
                        onClose={() => setFoodItemModalVisible(false)}
                        location="shopping-list"
                        showLocationSelector={true}
                        selectedShoppingListId={selectedShoppingListId}
                        onShoppingListSelect={setSelectedShoppingListId}
                        initialValues={{
                            quantities: {
                                meal: '',
                                'shopping-list': '',
                                pantry: '',
                            },
                            locations: ['shopping-list'],
                        }}
                    />
                </View>
            </CustomModal>

            <CustomModal
                visible={pantryModalVisible}
                onClose={() => setPantryModalVisible(false)}
                title="Valitse pentteristä"
            >
                {isLoading ? (
                    <CustomText style={styles.loadingText}>
                        Ladataan...
                    </CustomText>
                ) : (
                    <View style={styles.modalScrollContainer}>
                        <CustomText style={styles.foundItemsText}>
                            {pantryItems.length} elintarviketta löydetty
                        </CustomText>
                        <FlatList
                            data={pantryItems}
                            renderItem={renderPantryItem}
                            keyExtractor={(item) => item._id}
                            style={styles.pantryList}
                        />
                        <View style={styles.modalButtonGroup}>
                            <Button
                                title="Lisää valitut"
                                onPress={addSelectedPantryItems}
                                style={[
                                    styles.primaryButton,
                                    styles.fullWidthButton,
                                ]}
                            />
                        </View>
                    </View>
                )}
            </CustomModal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalBody: {
        flex: 1,
        padding: 15,
    },
    formContainer: {
        flex: 1,
        padding: 15,
    },
    itemsList: {
        marginTop: 10,
    },
    itemRow: {
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
        marginBottom: 5,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemContent: {
        flex: 1,
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
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
    },
    foundItemsText: {
        marginBottom: 10,
    },
    modalScrollContainer: {
        flex: 1,
    },
    modalButtonGroup: {
        width: '100%',
        paddingTop: 15,
    },
    fullWidthButton: {
        width: '100%',
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
        marginTop: 10,
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
        marginBottom: 10,
    },
    errorMsg: {
        color: 'red',
        marginTop: -5,
    },
})

export default FormAddShoppingList
