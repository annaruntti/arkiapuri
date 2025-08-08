import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    TextInput,
    Pressable,
    FlatList,
    Alert,
    Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import CustomText from './CustomText'
import Button from './Button'
import FormFoodItem from './FormFoodItem'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import { useLogin } from '../context/LoginProvider'
import FoodItemSelector from './FoodItemSelector'
import CustomModal from './CustomModal'
import Info from './Info'
import DifficultySelector from './DifficultySelector'
import {
    mealRoles,
    getDifficultyText,
    getDifficultyEnum,
} from '../utils/mealUtils'

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

    const fetchPantryItems = async () => {
        try {
            setIsLoading(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success && response.data.pantry) {
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

        setFoodItems([...foodItems, ...formattedPantryItems])
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
            if (!selectedRoles || selectedRoles.length === 0) {
                Alert.alert('Virhe', 'Valitse vähintään yksi ateriatyyppi')
                return
            }

            if (!foodItems || foodItems.length === 0) {
                Alert.alert('Virhe', 'Lisää vähintään yksi raaka-aine')
                return
            }

            const token = await storage.getItem('userToken')

            const createdFoodItemIds = await Promise.all(
                foodItems.map(async (item) => {
                    try {
                        const foodItemData = {
                            name: item.name,
                            unit: item.unit || 'kpl',
                            category: Array.isArray(item.category)
                                ? item.category.map((cat) =>
                                      typeof cat === 'object' ? cat.name : cat
                                  )
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
                        if (item._id) {
                            try {
                                response = await axios.put(
                                    getServerUrl(`/food-items/${item._id}`),
                                    foodItemData,
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                )
                            } catch (updateError) {
                                if (updateError.response?.status === 404) {
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
                        } else {
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
                                category: Array.isArray(item.category)
                                    ? item.category.map((cat) =>
                                          typeof cat === 'object'
                                              ? cat.name
                                              : cat
                                      )
                                    : [],
                                calories: parseInt(item.calories) || 0,
                                price: parseFloat(item.price) || 0,
                            }

                            await axios.post(
                                getServerUrl(
                                    `/shopping-lists/${item.shoppingListId}/items`
                                ),
                                { items: [shoppingListItem] },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            )
                        }

                        return foodItem._id
                    } catch (error) {
                        throw new Error(
                            `Failed to process food item ${item.name}: ${error.message}`
                        )
                    }
                })
            )

            const mealData = {
                name,
                recipe,
                difficultyLevel: getDifficultyEnum(difficultyLevel),
                cookingTime: parseInt(cookingTime) || 0,
                foodItems: createdFoodItemIds,
                defaultRoles: [...selectedRoles],
                plannedCookingDate,
                user: profile._id,
            }

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

            if (response.data.success) {
                onSubmit(response.data.meal)
            }
        } catch (error) {
            console.error('Error creating meal:', error)
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
        const newFoodItem = {
            ...foodItemData,
            shoppingListId: selectedShoppingListId,
            locations: foodItemData.locations,
            quantities: foodItemData.quantities,
        }

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
            quantity: newQuantity, // This for backward compatibility
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
                        <DifficultySelector
                            value={difficultyLevel}
                            onSelect={setDifficultyLevel}
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
                        <View style={styles.labelWithInfo}>
                            <CustomText style={styles.label}>
                                Suunniteltu valmistuspäivä
                            </CustomText>
                            <Info
                                title="Suunniteltu valmistuspäivä"
                                content="Tässä voit valita päivän, jolloin aiot valmistaa tämän aterian. Valittuasi suunnitellun valmistuspäivän, ateria ilmestyy lukujärjestykseesi kyseisen päivän kohdalle. Voit muuttaa päivämäärää myöhemmin tarvittaessa. Luotu ateria jää myös talteen Ateriat-listaasi ja voit asettaa aina uudelleen suunnitellun valmistuspäivämää sille kun haluat taas valmistaa kyseisen aterian."
                            />
                        </View>
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

            <CustomModal
                visible={foodItemModalVisible}
                onClose={() => setFoodItemModalVisible(false)}
                title="Lisää uusi raaka-aine"
            >
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
            </CustomModal>

            <CustomModal
                visible={pantryModalVisible}
                onClose={() => setPantryModalVisible(false)}
                title="Valitse pentteristä"
            >
                <View style={styles.modalBody}>
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
                </View>
            </CustomModal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    formContainer: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    formScroll: {
        flexGrow: 1,
    },
    label: {
        marginTop: 10,
        marginBottom: 5,
    },
    labelWithInfo: {
        flexDirection: 'row',
        alignItems: 'center',
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
        paddingHorizontal: 15,
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
        padding: 5,
        marginBottom: 10,
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
        marginTop: 20,
        marginBottom: 20,
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
    },
    difficultyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    difficultyInput: {
        flex: 1,
        marginRight: 10,
    },
    difficultyText: {
        fontSize: 16,
        color: '#666',
        minWidth: 100,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginTop: 8,
    },
    quantityLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 8,
        color: '#333',
    },
    quantityInput: {
        flex: 1,
        height: 36,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginRight: 8,
    },
    unitText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        minWidth: 30,
    },
})

export default AddMealForm
