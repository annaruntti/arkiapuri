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
    Picker,
} from 'react-native'
import CustomText from './CustomText'
import Button from './Button'
import FormFoodItem from './FormFoodItem'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import DateTimePicker from '@react-native-community/datetimepicker'

const AddMealForm = ({ onSubmit, onClose }) => {
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
    const [defaultRole, setDefaultRole] = useState('dinner')
    const [plannedCookingDate, setPlannedCookingDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const mealRoles = {
        breakfast: 'Aamiainen',
        lunch: 'Lounas',
        snack: 'Välipala',
        dinner: 'Päivällinen',
        supper: 'Iltapala',
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
        console.log('Adding selected pantry items:', selectedPantryItems) // Debug log
        const newFoodItems = [...foodItems, ...selectedPantryItems]
        console.log('Updated food items:', newFoodItems) // Debug log
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

    const handleSubmit = async () => {
        // Validate required fields
        if (!name) {
            Alert.alert('Virhe', 'Aterian nimi on pakollinen')
            return
        }

        // Map difficulty level to enum values
        const getDifficultyEnum = (level) => {
            const numLevel = parseInt(level)
            if (numLevel <= 2) return 'easy'
            if (numLevel <= 4) return 'medium'
            return 'hard'
        }

        // Get food item IDs and filter out any null or undefined values
        const foodItemIds = foodItems
            .filter((item) => item && item._id) // Only include valid items
            .map((item) => item._id)

        console.log('Food items before submission:', foodItems)
        console.log('Food item IDs to submit:', foodItemIds)

        // Validate that have at least one food item
        if (foodItemIds.length === 0) {
            Alert.alert('Virhe', 'Lisää vähintään yksi raaka-aine')
            return
        }

        const mealData = {
            id: Date.now().toString(),
            name,
            recipe: recipe || '',
            difficultyLevel: getDifficultyEnum(difficultyLevel),
            cookingTime: parseInt(cookingTime) || 0,
            defaultRole,
            plannedCookingDate: plannedCookingDate.toISOString(), // date in ISO format
            foodItems: foodItemIds,
        }

        console.log('Submitting meal data:', mealData)

        try {
            const token = await storage.getItem('userToken')
            console.log('Using token:', token)

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
            } else {
                console.error('Server response:', response.data)
                Alert.alert(
                    'Virhe',
                    response.data.message || 'Aterian luonti epäonnistui'
                )
            }
        } catch (error) {
            console.error('Full error:', error)
            console.error('Error response:', error.response?.data)
            Alert.alert('Virhe', 'Aterian luonti epäonnistui')
        }
    }

    const handleAddFoodItem = async (foodItem) => {
        try {
            // Create the food item
            const token = await storage.getItem('userToken')
            const response = await axios.post(
                getServerUrl('/food-items'),
                foodItem,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                // Add the created food item to the meal's food items
                const createdFoodItem = response.data.foodItem
                setFoodItems([...foodItems, createdFoodItem])

                // If user selected to add to shopping list or pantry, make additional request
                if (foodItem.addTo === 'shopping-list') {
                    await axios.post(
                        getServerUrl('/shopping-lists/items'),
                        { items: [createdFoodItem] },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                } else if (foodItem.addTo === 'pantry') {
                    await axios.post(
                        getServerUrl('/pantry/items'),
                        { items: [createdFoodItem] },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                }

                setFoodItemModalVisible(false)
            } else {
                Alert.alert('Virhe', 'Raaka-aineen lisääminen epäonnistui')
            }
        } catch (error) {
            console.error('Error creating food item:', error)
            Alert.alert('Virhe', 'Raaka-aineen lisääminen epäonnistui')
        }
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
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={defaultRole}
                            onValueChange={(itemValue) =>
                                setDefaultRole(itemValue)
                            }
                            style={styles.picker}
                        >
                            {Object.entries(mealRoles).map(([value, label]) => (
                                <Picker.Item
                                    key={value}
                                    label={label}
                                    value={value}
                                />
                            ))}
                        </Picker>
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
                        onPress={handleSubmit}
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
                                style={styles.formContainer}
                                showLocationSelector={true}
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: '90%',
        maxWidth: 400,
        maxHeight: '95%',
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
        paddingTop: 30,
        paddingBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: 20,
    },
    formContainer: {
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
    pickerContainer: {
        borderRadius: 4,
        backgroundColor: 'white',
        marginBottom: 15,
    },
    picker: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 5,
    },
    dateButton: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 15,
        justifyContent: 'center',
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
