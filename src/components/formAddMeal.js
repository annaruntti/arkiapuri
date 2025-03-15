import React, { useState } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
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
    const [selectedRoles, setSelectedRoles] = useState(['dinner'])
    const [plannedCookingDate, setPlannedCookingDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const mealRoles = {
        breakfast: 'Aamiainen',
        lunch: 'Lounas',
        snack: 'Välipala',
        dinner: 'Päivällinen',
        supper: 'Iltapala',
    }

    const getDifficultyEnum = (level) => {
        const numLevel = parseInt(level)
        if (numLevel <= 2) return 'helppo'
        if (numLevel <= 4) return 'keskivaikea'
        return 'vaikea'
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
        const newFoodItems = [...foodItems, ...selectedPantryItems]
        console.log('Updated food items:', newFoodItems)
        setFoodItems(newFoodItems)
        setSelectedPantryItems([])
        setPantryModalVisible(false)
    }

    const renderPantryItem = ({ item }) => {
        console.log('Rendering item:', item)
        const isSelected = selectedPantryItems.some(
            (selected) => selected._id === item._id
        )
        return (
            <Pressable
                style={[
                    styles.pantryItem,
                    isSelected && styles.selectedPantryItem,
                ]}
                onPress={() => togglePantryItemSelection(item)}
            >
                <View style={styles.itemRow}>
                    <View style={styles.itemContent}>
                        <CustomText style={styles.itemName}>
                            {item.name}
                        </CustomText>
                        <CustomText style={styles.itemDetails}>
                            {item.quantity} {item.unit}
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
                </View>
            </Pressable>
        )
    }

    const handleFormSubmit = async () => {
        try {
            // Validate all required fields
            if (!name) {
                Alert.alert('Virhe', 'Aterian nimi on pakollinen')
                return
            }

            if (!foodItems || foodItems.length === 0) {
                Alert.alert('Virhe', 'Lisää vähintään yksi raaka-aine')
                return
            }

            if (!difficultyLevel) {
                Alert.alert('Virhe', 'Vaikeustaso on pakollinen')
                return
            }

            const token = await storage.getItem('userToken')

            // First, create food items and store their IDs
            const createdFoodItems = []
            for (const item of foodItems) {
                if (!item._id) {
                    // Only create if it doesn't have an _id already
                    const foodItemData = {
                        name: item.name.trim(),
                        unit: item.unit || 'kpl',
                        category: Array.isArray(item.category)
                            ? item.category
                            : [],
                        calories: parseInt(item.calories) || 0,
                        price: parseFloat(item.price) || 0,
                        locations: ['meal'],
                        quantities: {
                            meal: parseFloat(item.quantities.meal) || 0,
                            'shopping-list':
                                parseFloat(item.quantities['shopping-list']) ||
                                0,
                            pantry: parseFloat(item.quantities.pantry) || 0,
                        },
                        expirationDate: item.expirationDate || null,
                    }

                    try {
                        const response = await axios.post(
                            getServerUrl('/food-items'),
                            foodItemData,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        )
                        if (response.data.success) {
                            createdFoodItems.push(response.data.foodItem)
                        }
                    } catch (error) {
                        console.error('Error creating food item:', error)
                        throw error
                    }
                } else {
                    createdFoodItems.push(item) // Use existing item if it has an _id
                }
            }

            // Now create the meal with the created food items
            const mealData = {
                id: `meal_${Date.now()}`,
                name,
                recipe,
                difficultyLevel: getDifficultyEnum(difficultyLevel),
                cookingTime: parseInt(cookingTime) || 0,
                foodItems: createdFoodItems.map((item) => ({
                    _id: item._id, // Use the _id from created food item
                    name: item.name,
                    quantity: parseFloat(item.quantities.meal) || 0,
                    unit: item.unit,
                    category: item.category,
                    calories: item.calories,
                    price: item.price,
                    locations: ['meal'],
                    quantities: {
                        meal: parseFloat(item.quantities.meal) || 0,
                        'shopping-list':
                            parseFloat(item.quantities['shopping-list']) || 0,
                        pantry: parseFloat(item.quantities.pantry) || 0,
                    },
                })),
                defaultRoles: selectedRoles,
                plannedCookingDate,
                user: profile._id,
                createdAt: new Date().toISOString(),
            }

            console.log('Sending meal data:', JSON.stringify(mealData, null, 2))

            const response = await axios.post(
                getServerUrl('/meals'),
                mealData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                onSubmit(response.data.meal)
            }
        } catch (error) {
            console.error('Full error:', error)
            console.error('Error response:', error.response?.data)
            console.error('Error status:', error.response?.status)
            console.error('Error config:', error.config)
            Alert.alert('Virhe', 'Aterian lisääminen epäonnistui')
        }
    }

    const handleAddFoodItem = (foodItemData) => {
        console.log('Adding food item:', foodItemData)
        const newFoodItem = {
            name: foodItemData.name.trim(),
            unit: foodItemData.unit || 'kpl',
            category: Array.isArray(foodItemData.category)
                ? foodItemData.category
                : [],
            calories: parseInt(foodItemData.calories) || 0,
            price: parseFloat(foodItemData.price) || 0,
            locations: ['meal'],
            quantities: {
                meal: parseFloat(foodItemData.quantity) || 0,
                'shopping-list':
                    parseFloat(foodItemData.quantities?.['shopping-list']) || 0,
                pantry: parseFloat(foodItemData.quantities?.pantry) || 0,
            },
            expirationDate: foodItemData.expirationDate || null,
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

    return (
        <View style={styles.container}>
            <ScrollView style={styles.formScroll}>
                <View style={styles.form}>
                    <CustomText style={styles.label}>Aterian nimi</CustomText>
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
                        onChangeText={setDifficultyLevel}
                        keyboardType="numeric"
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

                    <CustomText style={styles.label}>Aterian tyyppi</CustomText>
                    <View style={styles.checkboxGroup}>
                        {Object.entries(mealRoles).map(([value, label]) => (
                            <Pressable
                                key={value}
                                style={styles.checkboxRow}
                                onPress={() => {
                                    setSelectedRoles((prev) => {
                                        if (prev.includes(value)) {
                                            // Remove if already selected
                                            return prev.filter(
                                                (role) => role !== value
                                            )
                                        } else {
                                            // Add if not selected
                                            return [...prev, value]
                                        }
                                    })
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

                    <CustomText style={styles.labelTitle}>
                        Raaka-aineet:
                    </CustomText>
                    {foodItems.map((item, index) => (
                        <View key={index} style={styles.foodItem}>
                            <CustomText>{item.name}</CustomText>
                        </View>
                    ))}

                    <View style={styles.buttonGroup}>
                        <Button
                            title="Lisää raaka-aine"
                            onPress={() => setFoodItemModalVisible(true)}
                            style={styles.secondaryButton}
                        />
                        <Button
                            title="Valitse pentteristä"
                            onPress={handleOpenPantryModal}
                            style={styles.secondaryButton}
                        />
                    </View>

                    <Button
                        title="Tallenna ateria"
                        onPress={handleFormSubmit}
                        style={styles.primaryButton}
                    />
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={foodItemModalVisible}
                onRequestClose={() => setFoodItemModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Pressable
                            onPress={() => setFoodItemModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <AntDesign name="close" size={24} color="black" />
                        </Pressable>

                        <View style={styles.modalHeader}>
                            <CustomText style={styles.modalTitle}>
                                Lisää raaka-aine
                            </CustomText>
                        </View>

                        <View style={styles.modalBody}>
                            <FormFoodItem
                                onSubmit={handleAddFoodItem}
                                onClose={() => setFoodItemModalVisible(false)}
                                location="meal"
                                showLocationSelector={true}
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
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
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
                                <Button
                                    title="Lisää valitut"
                                    onPress={addSelectedPantryItems}
                                    style={styles.primaryButton}
                                />
                            </View>
                        )}
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
    formScroll: {
        flex: 1,
        padding: 20,
    },
    form: {
        width: '100%',
        paddingBottom: 40,
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
        width: 'auto',
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
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginBottom: 10,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 20,
        marginBottom: 10,
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
})

export default AddMealForm
