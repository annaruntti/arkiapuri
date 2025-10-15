import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import Button from './Button'
import CustomText from './CustomText'
import FormFoodItem from './FormFoodItem'
import ResponsiveModal from './ResponsiveModal'

const FormAddShoppingList = ({ onSubmit, onClose }) => {
    const { isDesktop } = useResponsiveDimensions()
    const [items, setItems] = useState([])
    const [foodItemModalVisible, setFoodItemModalVisible] = useState(false)
    const [showInlineFoodForm, setShowInlineFoodForm] = useState(false)
    const [pantryModalVisible, setPantryModalVisible] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [totalEstimatedPrice, setTotalEstimatedPrice] = useState('')
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
        // Transform categories into an array of strings
        // FormFoodItem sends 'category' (singular), so we need to handle both cases
        const categoryData = itemData.category || itemData.categories || []
        const transformedCategories = Array.isArray(categoryData)
            ? categoryData.map((cat) =>
                  typeof cat === 'object' ? cat.name : cat
              )
            : []

        const newItem = {
            ...itemData,
            location: 'shopping-list',
            quantity: itemData.quantity,
            unit: itemData.unit || 'kpl',
            categories: transformedCategories,
        }
        setItems([...items, newItem])
        setShowInlineFoodForm(false)
    }

    const handleSubmitForm = async (data) => {
        try {
            const token = await storage.getItem('userToken')

            if (!token) {
                console.error('No token found')
                Alert.alert('Virhe', 'Kirjaudu sisään uudelleen')
                return
            }

            // Process items to ensure quantities and categories are properly formatted
            const processedItems = items.map((item) => {
                // Handle categories more robustly
                let processedCategories = []
                if (item.categories) {
                    if (Array.isArray(item.categories)) {
                        processedCategories = item.categories.map((cat) => {
                            if (typeof cat === 'string') {
                                return cat
                            } else if (typeof cat === 'object' && cat.name) {
                                return cat.name
                            } else {
                                return String(cat)
                            }
                        })
                    } else if (typeof item.categories === 'string') {
                        // Handle case where categories might be a stringified array
                        try {
                            const parsed = JSON.parse(item.categories)
                            if (Array.isArray(parsed)) {
                                processedCategories = parsed.map((cat) =>
                                    typeof cat === 'object' ? cat.name : cat
                                )
                            } else {
                                processedCategories = [item.categories]
                            }
                        } catch (e) {
                            processedCategories = [item.categories]
                        }
                    }
                }

                const processedItem = {
                    ...item,
                    quantity: parseFloat(item.quantity),
                    price: parseFloat(item.price) || 0,
                    calories: parseInt(item.calories) || 0,
                    categories: processedCategories,
                }

                // Remove the raw category field to avoid conflicts
                delete processedItem.category
                return processedItem
            })

            const shoppingListData = {
                name,
                description,
                totalEstimatedPrice: totalEstimatedPrice || 0,
                items: processedItems,
            }

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

            if (response.data) {
                onSubmit(response.data)
                setName('')
                setDescription('')
                setTotalEstimatedPrice('')
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
        // Add selected pantry items to the shopping list
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
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formContainer}>
                    <CustomText style={styles.label}>
                        Ostoslistan nimi
                    </CustomText>
                    <TextInput
                        style={styles.formInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Kirjoita ostoslistan nimi"
                    />

                    <CustomText style={styles.label}>Kuvaus</CustomText>
                    <TextInput
                        style={styles.formInput}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Kirjoita kuvaus"
                    />

                    <CustomText style={styles.label}>
                        Arvioitu kokonaishinta
                    </CustomText>
                    <TextInput
                        style={styles.formInput}
                        value={totalEstimatedPrice}
                        onChangeText={setTotalEstimatedPrice}
                        placeholder="Syötä arvioitu kokonaishinta"
                        keyboardType="numeric"
                    />

                    {showInlineFoodForm && (
                        <View style={styles.inlineFoodFormContainer}>
                            <CustomText style={styles.inlineFoodFormTitle}>
                                Lisää uusi raaka-aine
                            </CustomText>
                            <FormFoodItem
                                onSubmit={handleAddItem}
                                onClose={() => setShowInlineFoodForm(false)}
                                location="shopping-list"
                                showLocationSelector={true}
                                selectedShoppingListId={selectedShoppingListId}
                            />
                        </View>
                    )}

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

                    <View
                        style={
                            isDesktop
                                ? styles.buttonsRowDesktop
                                : styles.buttonsColumnMobile
                        }
                    >
                        <Button
                            style={[
                                styles.secondaryButton,
                                isDesktop && styles.desktopSecondaryButton,
                            ]}
                            textStyle={styles.buttonText}
                            title="Lisää ostoslistalle tuote"
                            onPress={() =>
                                setShowInlineFoodForm(!showInlineFoodForm)
                            }
                        />
                        <Button
                            style={[
                                styles.primaryButton,
                                isDesktop && styles.desktopPrimaryButton,
                            ]}
                            textStyle={styles.buttonText}
                            title="Tallenna ostoslista"
                            onPress={handleSubmitForm}
                        />
                    </View>
                </View>
            </ScrollView>

            <ResponsiveModal
                visible={pantryModalVisible}
                onClose={() => setPantryModalVisible(false)}
                title="Valitse pentteristä"
                maxWidth={600}
            >
                {isLoading ? (
                    <CustomText style={styles.loadingText}>
                        Ladataan...
                    </CustomText>
                ) : (
                    <View style={styles.modalScrollContainer}>
                        <CustomText style={styles.foundItemsText}>
                            {`${pantryItems.length} elintarviketta löydetty`}
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
                                    isDesktop && styles.desktopPrimaryButton,
                                ]}
                            />
                        </View>
                    </View>
                )}
            </ResponsiveModal>
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
    scrollView: {
        flex: 1,
        paddingHorizontal: 15,
    },
    formContainer: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    label: {
        paddingTop: 10,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: 5,
    },
    formInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 15,
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
        width: '100%',
    },
    desktopPrimaryButton: {
        flex: 1,
        width: 'auto',
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
        width: '100%',
    },
    desktopSecondaryButton: {
        flex: 1,
        width: 'auto',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
    },
    buttonsRowDesktop: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        paddingTop: 20,
    },
    buttonsColumnMobile: {
        flexDirection: 'column',
        gap: 15,
        width: '100%',
        paddingTop: 20,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    inlineFoodFormContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        padding: 20,
        marginVertical: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    inlineFoodFormTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },

    errorMsg: {
        color: 'red',
        marginTop: -5,
    },
})

export default FormAddShoppingList
