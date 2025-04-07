import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    TextInput,
    Pressable,
    Modal,
    FlatList,
    Alert,
    Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import CustomText from './CustomText'
import Button from './Button'
import FormFoodItem from './FormFoodItem'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import { useLogin } from '../context/LoginProvider'
import FoodItemSelector from './FoodItemSelector'

const AddMealForm = ({ onSubmit, onClose }) => {
    const { profile } = useLogin()
    const [name, setName] = useState('')
    const [recipe, setRecipe] = useState('')
    const [difficultyLevel, setDifficultyLevel] = useState('')
    const [cookingTime, setCookingTime] = useState('')
    const [foodItems, setFoodItems] = useState([])
    const [foodItemModalVisible, setFoodItemModalVisible] = useState(false)
    const [pantryModalVisible, setPantryModalVisible] = useState(false)
    const [pantryItems, setPantryItems] = useState([])
    const [selectedPantryItems, setSelectedPantryItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedRoles, setSelectedRoles] = useState([])
    const [plannedCookingDate, setPlannedCookingDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [shoppingLists, setShoppingLists] = useState([])
    const [selectedShoppingListId, setSelectedShoppingListId] = useState(null)
    const [pantryItemQuantities, setPantryItemQuantities] = useState({})

    const mealRoles = {
        breakfast: 'Aamiainen',
        lunch: 'Lounas',
        snack: 'Välipala',
        dinner: 'Päivällinen',
        supper: 'Iltapala',
        dessert: 'Jälkiruoka',
        other: 'Muu',
    }

    const getDifficultyEnum = (level) => {
        const numLevel = parseInt(level)
        if (isNaN(numLevel) || numLevel < 1 || numLevel > 5) {
            return 'medium' // default value if invalid
        }
        if (numLevel <= 2) return 'easy'
        if (numLevel <= 4) return 'medium'
        return 'hard'
    }

    const fetchPantryItems = async () => {
        try {
            setIsLoading(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            console.log('Pantry response:', response.data)
            if (response.data.success && response.data.pantry) {
                console.log('Setting pantry items:', response.data.pantry.items)
                setPantryItems(response.data.pantry.items)
            }
        } catch (error) {
            console.error('Error fetching pantry items:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenPantryModal = async () => {
        setPantryModalVisible(true)
        await fetchPantryItems()
        const initialQuantities = {}
        pantryItems.forEach((item) => {
            initialQuantities[item._id] = item.quantity || 0
        })
        setPantryItemQuantities(initialQuantities)
    }

    const togglePantryItemSelection = (item) => {
        const isSelected = selectedPantryItems.some(
            (selected) => selected._id === item._id
        )
        if (isSelected) {
            setSelectedPantryItems(
                selectedPantryItems.filter(
                    (selected) => selected._id !== item._id
                )
            )
        } else {
            setSelectedPantryItems([...selectedPantryItems, item])
        }
    }

    const addSelectedPantryItems = () => {
        console.log('Adding selected pantry items:', selectedPantryItems)

        const formattedPantryItems = selectedPantryItems.map((item) => ({
            name: item.name,
            unit: item.unit || 'kpl',
            category: item.foodId?.category || item.category || [],
            calories: parseInt(item.calories) || 0,
            price: parseFloat(item.price) || 0,
            locations: ['meal'],
            quantities: {
                meal: parseFloat(pantryItemQuantities[item._id]) || 0,
                'shopping-list': 0,
                pantry: 0,
            },
            quantity: parseFloat(pantryItemQuantities[item._id]) || 0,
            foodId: item.foodId?._id || item.foodId,
            expirationDate: item.expirationDate,
        }))

        const newFoodItems = [...foodItems, ...formattedPantryItems]
        console.log('Updated food items:', newFoodItems)
        setFoodItems(newFoodItems)
        setSelectedPantryItems([])
        setPantryModalVisible(false)
    }

    const renderPantryItem = ({ item }) => {
        const isSelected = selectedPantryItems.some(
            (selected) => selected._id === item._id
        )

        return (
            <View
                style={[
                    styles.pantryItem,
                    isSelected && styles.selectedPantryItem,
                ]}
            >
                <Pressable
                    style={styles.itemRow}
                    onPress={() => togglePantryItemSelection(item)}
                >
                    <View style={styles.itemContent}>
                        <CustomText style={styles.itemName}>
                            {item.name}
                        </CustomText>
                        <CustomText style={styles.itemDetails}>
                            Saatavilla: {item.quantity} {item.unit}
                        </CustomText>
                    </View>
                    <View style={styles.checkboxContainer}>
                        <MaterialIcons
                            name={
                                isSelected
                                    ? 'check-box'
                                    : 'check-box-outline-blank'
                            }
                            size={24}
                            color={isSelected ? '#38E4D9' : '#666'}
                        />
                    </View>
                </Pressable>

                {isSelected && (
                    <View style={styles.quantityContainer}>
                        <CustomText style={styles.quantityLabel}>
                            Määrä:
                        </CustomText>
                        <TextInput
                            style={styles.quantityInput}
                            value={pantryItemQuantities[item._id]?.toString()}
                            onChangeText={(text) => {
                                // Allow empty string or numbers with optional decimal point
                                if (text === '' || /^\d*\.?\d*$/.test(text)) {
                                    setPantryItemQuantities({
                                        ...pantryItemQuantities,
                                        [item._id]: text,
                                    })
                                }
                            }}
                            keyboardType="numeric"
                            placeholder="0"
                            selectTextOnFocus={true} // Selects all text when focused
                        />
                        <CustomText style={styles.unitText}>
                            {item.unit}
                        </CustomText>
                    </View>
                )}
            </View>
        )
    }

    const fetchShoppingLists = async () => {
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/shopping-lists'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success) {
                setShoppingLists(response.data.shoppingLists)
                if (response.data.shoppingLists.length === 1) {
                    setSelectedShoppingListId(
                        response.data.shoppingLists[0]._id
                    )
                }
            }
        } catch (error) {
            console.error('Error fetching shopping lists:', error)
            Alert.alert('Virhe', 'Ostoslistojen hakeminen epäonnistui')
        }
    }

    const handleFormSubmit = async () => {
        try {
            // Add validation to ensure selectedRoles is not empty
            if (!selectedRoles || selectedRoles.length === 0) {
                Alert.alert('Virhe', 'Valitse vähintään yksi ateriatyyppi')
                return
            }

            // Validation for all required fields
            if (!foodItems || foodItems.length === 0) {
                Alert.alert('Virhe', 'Lisää vähintään yksi raaka-aine')
                return
            }

            const token = await storage.getItem('userToken')

            // First create/update all food items
            const createdFoodItemIds = await Promise.all(
                foodItems.map(async (item) => {
                    try {
                        const foodItemData = {
                            name: item.name,
                            unit: item.unit || 'kpl',
                            category: Array.isArray(item.category)
                                ? item.category
                                : [],
                            calories: parseInt(item.calories) || 0,
                            price: parseFloat(item.price) || 0,
                            locations: item.locations || ['meal'],
                            quantities: {
                                meal:
                                    parseFloat(item.quantities?.meal) ||
                                    parseFloat(item.quantity) ||
                                    0,
                                'shopping-list':
                                    parseFloat(
                                        item.quantities?.['shopping-list']
                                    ) || 0,
                                pantry:
                                    parseFloat(item.quantities?.pantry) || 0,
                            },
                            expirationDate: item.expirationDate,
                            user: profile._id,
                        }

                        let response
                        try {
                            // Try to update if item has _id
                            if (item._id) {
                                response = await axios.put(
                                    getServerUrl(`/food-items/${item._id}`),
                                    foodItemData,
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                )
                            }
                        } catch (updateError) {
                            // If update fails (404), create new item
                            if (updateError.response?.status === 404) {
                                console.log(
                                    `Food item ${item.name} not found, creating new one`
                                )
                                response = await axios.post(
                                    getServerUrl('/food-items'),
                                    foodItemData,
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                )
                            } else {
                                throw updateError
                            }
                        }

                        // If not made a request yet (no _id), create new item
                        if (!response) {
                            response = await axios.post(
                                getServerUrl('/food-items'),
                                foodItemData,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            )
                        }

                        const foodItem = response.data.foodItem || response.data

                        // If, this item will added to shopping list
                        if (
                            item.locations?.includes('shopping-list') &&
                            item.shoppingListId
                        ) {
                            const shoppingListItem = {
                                foodId: foodItem._id,
                                name: item.name,
                                estimatedPrice: parseFloat(item.price) || 0,
                                quantity:
                                    parseFloat(
                                        item.quantities['shopping-list']
                                    ) || 0,
                                unit: item.unit || 'kpl',
                                category: item.category || [],
                                calories: parseInt(item.calories) || 0,
                                price: parseFloat(item.price) || 0,
                            }

                            // Add item to selected shopping list
                            await axios.post(
                                getServerUrl(
                                    `/shopping-lists/${item.shoppingListId}/items`
                                ),
                                {
                                    items: [shoppingListItem],
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            )
                        }

                        return foodItem._id
                    } catch (error) {
                        console.error('Error processing food item:', error)
                        throw new Error(
                            `Failed to process food item ${item.name}: ${error.message}`
                        )
                    }
                })
            )

            // Log the selected role right after user selection
            console.log('Initially selected role:', selectedRoles)

            // Create the meal with the food item IDs
            const mealData = {
                id: `meal_${Date.now()}`,
                name,
                recipe,
                difficultyLevel: getDifficultyEnum(difficultyLevel),
                cookingTime: parseInt(cookingTime) || 0,
                foodItems: createdFoodItemIds,
                defaultRoles: [...selectedRoles], // Create a new array to ensure no reference issues
                plannedCookingDate,
                user: profile._id,
            }

            // Log the exact structure being sent
            console.log(
                'Meal data structure:',
                JSON.stringify(mealData, null, 2)
            )
            console.log('defaultRoles type:', typeof mealData.defaultRoles)
            console.log(
                'defaultRoles isArray:',
                Array.isArray(mealData.defaultRoles)
            )

            const response = await axios.post(
                getServerUrl('/meals'),
                mealData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            // Add this log to see the exact request configuration
            console.log('Request config:', {
                url: response.config.url,
                method: response.config.method,
                headers: response.config.headers,
                data: JSON.parse(response.config.data), // Parse the stringified data back to an object
            })

            // Log the exact response structure
            console.log(
                'Full server response:',
                JSON.stringify(response.data, null, 2)
            )

            if (response.data.success) {
                if (response.data.meal.defaultRoles[0] !== selectedRoles[0]) {
                    console.error('Role mismatch detected:', {
                        originalSelection: selectedRoles[0],
                        sentInPayload: mealData.defaultRoles[0],
                        receivedFromServer: response.data.meal.defaultRoles[0],
                    })
                }
                onSubmit(response.data.meal)
            }
        } catch (error) {
            console.error('Error creating meal:', error)
            console.error('Error response:', error.response?.data)
            Alert.alert(
                'Virhe',
                'Aterian lisääminen epäonnistui: ' +
                    (error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message)
            )
        }
    }

    const handleAddFoodItem = (foodItemData) => {
        console.log('Adding food item:', foodItemData)
        const newFoodItem = {
            ...foodItemData,
            shoppingListId: selectedShoppingListId,
            locations: foodItemData.locations,
            quantities: {
                meal: parseFloat(foodItemData.quantity) || 0,
                'shopping-list': foodItemData.locations.includes(
                    'shopping-list'
                )
                    ? parseFloat(foodItemData.quantities?.['shopping-list']) ||
                      0
                    : 0,
                pantry: parseFloat(foodItemData.quantities?.pantry) || 0,
            },
        }

        console.log('Creating food item with data:', newFoodItem)
        setFoodItems([...foodItems, newFoodItem])
        setFoodItemModalVisible(false)
    }

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setPlannedCookingDate(selectedDate)
        }
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('fi-FI')
    }

    const handleUpdateQuantity = (index, newQuantity) => {
        const updatedFoodItems = [...foodItems]
        updatedFoodItems[index] = {
            ...updatedFoodItems[index],
            quantities: {
                ...updatedFoodItems[index].quantities,
                meal: newQuantity,
            },
            quantity: newQuantity, // Keep this for backward compatibility
        }
        setFoodItems(updatedFoodItems)
    }

    const handleRemoveFoodItem = (index) => {
        const updatedFoodItems = foodItems.filter((_, i) => i !== index)
        setFoodItems(updatedFoodItems)
    }

    useEffect(() => {
        fetchShoppingLists()
    }, [])

    return (
        <View style={styles.container}>
            <FlatList
                data={[{ key: 'form' }]}
                renderItem={() => (
                    <View style={styles.formContainer}>
                        <CustomText style={styles.label}>
                            Aterian nimi
                        </CustomText>
                        <TextInput
                            style={styles.formInput}
                            value={name}
                            onChangeText={setName}
                        />

                        <CustomText style={styles.label}>Resepti</CustomText>
                        <TextInput
                            style={[styles.formInput, styles.multilineInput]}
                            value={recipe}
                            onChangeText={setRecipe}
                            multiline
                            numberOfLines={4}
                        />

                        <CustomText style={styles.label}>
                            Vaikeustaso (1-5)
                        </CustomText>
                        <TextInput
                            style={styles.formInput}
                            value={difficultyLevel}
                            onChangeText={(text) => {
                                if (text === '' || /^[1-5]$/.test(text)) {
                                    setDifficultyLevel(text)
                                }
                            }}
                            keyboardType="numeric"
                            maxLength={1}
                            placeholder="1-5 (1-2 helppo, 3-4 keskivaikea, 5 vaikea)"
                        />

                        <CustomText style={styles.label}>
                            Valmistusaika (min)
                        </CustomText>
                        <TextInput
                            style={styles.formInput}
                            value={cookingTime}
                            onChangeText={setCookingTime}
                            keyboardType="numeric"
                        />

                        <CustomText style={styles.label}>
                            Aterian tyyppi
                        </CustomText>
                        <View style={styles.checkboxGroup}>
                            {Object.entries(mealRoles).map(([value, label]) => (
                                <Pressable
                                    key={value}
                                    style={styles.checkboxRow}
                                    onPress={() => {
                                        setSelectedRoles([value])
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.checkbox,
                                            selectedRoles.includes(value) &&
                                                styles.checkboxChecked,
                                        ]}
                                    >
                                        {selectedRoles.includes(value) && (
                                            <MaterialIcons
                                                name="check"
                                                size={16}
                                                color="white"
                                            />
                                        )}
                                    </View>
                                    <CustomText style={styles.checkboxLabel}>
                                        {label}
                                    </CustomText>
                                </Pressable>
                            ))}
                        </View>

                        <CustomText style={styles.label}>
                            Suunniteltu valmistuspäivä
                        </CustomText>
                        <Pressable
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <CustomText>
                                {formatDate(plannedCookingDate)}
                            </CustomText>
                        </Pressable>

                        {showDatePicker && (
                            <DateTimePicker
                                value={plannedCookingDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        <View style={styles.foodItemSelectorContainer}>
                            <FoodItemSelector
                                foodItems={foodItems}
                                onSelectItem={(item) => {
                                    setFoodItems([...foodItems, item])
                                }}
                                onOpenFoodItemModal={() =>
                                    setFoodItemModalVisible(true)
                                }
                                onOpenPantryModal={handleOpenPantryModal}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveFoodItem}
                            />
                        </View>

                        <View style={styles.buttonGroup}>
                            <Button
                                title="Tallenna ateria"
                                onPress={handleFormSubmit}
                                style={styles.primaryButton}
                            />
                        </View>
                    </View>
                )}
                keyExtractor={() => 'form'}
                contentContainerStyle={styles.formScroll}
                showsVerticalScrollIndicator={true}
                bounces={false}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={foodItemModalVisible}
                onRequestClose={() => setFoodItemModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContentView}>
                        <Pressable
                            onPress={() => setFoodItemModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <AntDesign name="close" size={24} color="black" />
                        </Pressable>
                        <View style={styles.modalHeader}>
                            <CustomText style={styles.modalTitle}>
                                Lisää uusi raaka-aine
                            </CustomText>
                        </View>
                        <View style={styles.modalBody}>
                            <FormFoodItem
                                onSubmit={handleAddFoodItem}
                                onClose={() => setFoodItemModalVisible(false)}
                                location="meal"
                                showLocationSelector={true}
                                shoppingLists={shoppingLists}
                                selectedShoppingListId={selectedShoppingListId}
                                onShoppingListSelect={setSelectedShoppingListId}
                                initialValues={{
                                    quantities: {
                                        meal: '',
                                        'shopping-list': '',
                                        pantry: '',
                                    },
                                    locations: ['meal'],
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={pantryModalVisible}
                onRequestClose={() => setPantryModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContentView}>
                        <Pressable
                            onPress={() => setPantryModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <AntDesign name="close" size={24} color="black" />
                        </Pressable>
                        <View style={styles.modalHeader}>
                            <CustomText style={styles.modalTitle}>
                                Valitse pentteristä
                            </CustomText>
                        </View>
                        <View style={styles.modalBody}>
                            {isLoading ? (
                                <CustomText style={styles.loadingText}>
                                    Ladataan...
                                </CustomText>
                            ) : (
                                <View style={styles.modalScrollContainer}>
                                    <CustomText style={styles.foundItemsText}>
                                        {pantryItems.length} elintarviketta
                                        löydetty
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
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    formScroll: {
        flexGrow: 1,
    },
    label: {
        marginTop: 10,
        marginBottom: 5,
    },
    labelTitle: {
        paddingTop: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    formInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 5,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    foodItem: {
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
        marginBottom: 5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        width: '100%',
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
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 10,
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
        width: '100%',
        marginBottom: 10,
    },
    secondaryButton: {
        flex: 1,
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
        marginBottom: 10,
        marginHorizontal: 5,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        width: '100%',
        paddingTop: 15,
    },
    pantryList: {
        flexGrow: 0,
        maxHeight: '80%',
    },
    pantryItem: {
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        marginBottom: 10,
    },
    selectedPantryItem: {
        backgroundColor: '#f8f8f8',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
    },
    itemRow: {
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
    checkboxGroup: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        marginBottom: 15,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#9C86FC',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#9C86FC',
    },
    checkboxLabel: {
        fontSize: 16,
        color: '#000000',
    },
    dateButton: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 20,
        justifyContent: 'center',
        width: '100%',
    },
    modalScrollContainer: {
        padding: 20,
        flex: 1,
    },
    foundItemsText: {
        marginBottom: 10,
    },
    modalButtonGroup: {
        width: '100%',
        paddingTop: 15,
    },
    fullWidthButton: {
        width: '100%',
    },
    foodItemSelectorContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    modalView: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContentView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        width: '100%',
        paddingTop: 35,
    },
    modalHeader: {
        width: '100%',
        paddingTop: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: 20,
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1,
        padding: 5,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        padding: 5,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
    quantityLabel: {
        fontSize: 14,
        marginRight: 10,
    },
    quantityInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        padding: 5,
        width: 70,
        textAlign: 'center',
        height: 36,
    },
    unitText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
    },
})

export default AddMealForm
