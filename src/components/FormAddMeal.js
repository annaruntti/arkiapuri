import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    FlatList,
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import { getDifficultyEnum, mealRoles } from '../utils/mealUtils'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import Button from './Button'
import CustomText from './CustomText'
import DateTimePicker from './DateTimePicker'
import DifficultySelector from './DifficultySelector'
import FormFoodItem from './FormFoodItem'
import UnifiedFoodSearch from './UnifiedFoodSearch'

import Info from './Info'

const AddMealForm = ({ onSubmit }) => {
    const { profile } = useLogin()
    const { isDesktop } = useResponsiveDimensions()
    const [name, setName] = useState('')
    const [recipe, setRecipe] = useState('')
    const [difficultyLevel, setDifficultyLevel] = useState('')
    const [cookingTime, setCookingTime] = useState('')
    const [foodItems, setFoodItems] = useState([])

    const [selectedRoles, setSelectedRoles] = useState([])
    const [plannedCookingDate, setPlannedCookingDate] = useState(new Date())
    const [plannedEatingDates, setPlannedEatingDates] = useState([])
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showEatingDatePicker, setShowEatingDatePicker] = useState(false)
    const [editingEatingDateIndex, setEditingEatingDateIndex] = useState(null)
    const [selectedShoppingListId, setSelectedShoppingListId] = useState(null)
    const [showItemForm, setShowItemForm] = useState(false)
    const [mealImage, setMealImage] = useState(null)

    const fetchShoppingLists = async () => {
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/shopping-lists'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success) {
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

    const pickImage = async () => {
        try {
            if (Platform.OS === 'web') {
                // For web, only show library option
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                })

                if (!result.canceled) {
                    setMealImage(result.assets[0])
                }
                return
            }

            // For mobile, show action sheet with options
            Alert.alert('Valitse kuva', 'valitse, miten haluat lisätä kuvan', [
                {
                    text: 'Camera',
                    onPress: async () => {
                        try {
                            const { status } =
                                await ImagePicker.requestCameraPermissionsAsync()

                            if (status !== 'granted') {
                                Alert.alert(
                                    'Tämä toiminto vaatii kameran käyttöoikeuden.'
                                )
                                return
                            }

                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ['images'],
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 1,
                            })
                            if (!result.canceled) {
                                setMealImage(result.assets[0])
                            }
                        } catch (error) {
                            console.error('Camera error:', error)
                            Alert.alert(
                                'Virhe',
                                'Kameran avaaminen epäonnistui: ' +
                                    error.message
                            )
                        }
                    },
                },
                {
                    text: 'Photo Library',
                    onPress: async () => {
                        const { status } =
                            await ImagePicker.requestMediaLibraryPermissionsAsync()
                        if (status !== 'granted') {
                            Alert.alert(
                                'Tämä toiminto vaatii kameran käyttöoikeuden.'
                            )
                            return
                        }

                        const result =
                            await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ['images'],
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 1,
                            })

                        if (!result.canceled) {
                            setMealImage(result.assets[0])
                        }
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ])
        } catch (error) {
            console.error('Error picking image:', error)
            Alert.alert('Virhe', 'kuvan valitseminen epäonnistui')
        }
    }

    const uploadMealImage = async (mealId, imageFile) => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) {
                throw new Error('No token found')
            }

            const formData = new FormData()

            // Handle web blob URLs differently
            if (Platform.OS === 'web' && imageFile.uri.startsWith('blob:')) {
                // For web, we need to fetch the blob and convert it to a File
                const response = await fetch(imageFile.uri)
                const blob = await response.blob()
                const file = new File([blob], 'meal.jpg', {
                    type: 'image/jpeg',
                })
                formData.append('mealImage', file)
            } else {
                // For mobile platforms
                formData.append('mealImage', {
                    uri: imageFile.uri,
                    type: 'image/jpeg',
                    name: 'meal.jpg',
                })
            }

            const url = getServerUrl(`/meals/${mealId}/image`)

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                return response.data.meal // Return the updated meal with image
            }
        } catch (error) {
            console.error('Error uploading meal image:', error)
            throw error
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
                            category: (() => {
                                // Handle case where category might be a stringified array
                                let categoryArray = item.category
                                if (typeof item.category === 'string') {
                                    try {
                                        categoryArray = JSON.parse(
                                            item.category
                                        )
                                    } catch (e) {
                                        categoryArray = []
                                    }
                                }

                                // Ensure we have an array
                                if (!Array.isArray(categoryArray)) {
                                    return []
                                }

                                // Extract category names from objects or use strings directly
                                return categoryArray
                                    .map((cat) => {
                                        if (
                                            typeof cat === 'object' &&
                                            cat !== null
                                        ) {
                                            return (
                                                cat.name ||
                                                cat.id ||
                                                String(cat)
                                            )
                                        }
                                        return String(cat)
                                    })
                                    .filter((cat) => cat && cat.trim() !== '')
                            })(),
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
                        // Check if item has a real MongoDB ObjectId (not temporary ID)
                        const hasRealId =
                            item._id &&
                            !item._id.startsWith('openfoodfacts-') &&
                            !item._id.startsWith('new-') &&
                            item._id.length === 24 // MongoDB ObjectId length

                        if (hasRealId) {
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
                                category: (() => {
                                    // Handle case where category might be a stringified array
                                    let categoryArray = item.category
                                    if (typeof item.category === 'string') {
                                        try {
                                            categoryArray = JSON.parse(
                                                item.category
                                            )
                                        } catch (e) {
                                            categoryArray = []
                                        }
                                    }

                                    // Ensure we have an array
                                    if (!Array.isArray(categoryArray)) {
                                        return []
                                    }

                                    // Extract category names from objects or use strings directly
                                    return categoryArray
                                        .map((cat) => {
                                            if (
                                                typeof cat === 'object' &&
                                                cat !== null
                                            ) {
                                                return (
                                                    cat.name ||
                                                    cat.id ||
                                                    String(cat)
                                                )
                                            }
                                            return String(cat)
                                        })
                                        .filter(
                                            (cat) => cat && cat.trim() !== ''
                                        )
                                })(),
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

            // If no eating dates specified, default to cooking date
            const eatingDates =
                plannedEatingDates.length > 0
                    ? plannedEatingDates
                    : [plannedCookingDate]

            const mealData = {
                name,
                recipe,
                difficultyLevel: getDifficultyEnum(difficultyLevel),
                cookingTime: parseInt(cookingTime) || 0,
                foodItems: createdFoodItemIds,
                defaultRoles: [...selectedRoles],
                plannedCookingDate,
                plannedEatingDates: eatingDates,
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
                const createdMeal = response.data.meal

                // Upload image if one was selected
                let finalMeal = createdMeal
                if (mealImage) {
                    try {
                        const updatedMeal = await uploadMealImage(
                            createdMeal._id,
                            mealImage
                        )
                        if (updatedMeal) {
                            finalMeal = updatedMeal
                        }
                    } catch (imageError) {
                        console.error('Error uploading meal image:', imageError)
                        Alert.alert(
                            'Varoitus',
                            'Ateria luotu, mutta kuvan lähetys epäonnistui'
                        )
                    }
                }

                onSubmit(finalMeal)
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

    const handleSelectItem = (selectedItem) => {
        // Convert the selected item to the format expected by the meal form
        const newFoodItem = {
            ...selectedItem,
            // Add a unique temporary ID for tracking
            tempId: `${selectedItem._id || selectedItem.name}-${Date.now()}-${Math.random()}`,
            shoppingListId: selectedShoppingListId,
            locations: selectedItem.locations || ['meal'],
            quantities: {
                meal:
                    selectedItem.quantities?.meal || selectedItem.quantity || 1,
                'shopping-list':
                    selectedItem.quantities?.['shopping-list'] || 0,
                pantry: selectedItem.quantities?.pantry || 0,
            },
        }

        // Use functional update to avoid stale closure
        setFoodItems((prevItems) => [...prevItems, newFoodItem])
    }

    const handleAddNewItem = async (itemData) => {
        try {
            const token = await storage.getItem('userToken')

            // Validate required fields
            if (!itemData.name || !itemData.unit) {
                Alert.alert('Virhe', 'Nimi ja yksikkö ovat pakollisia tietoja')
                return
            }

            // Create the FoodItem
            const foodItemData = {
                name: itemData.name,
                unit: itemData.unit,
                category: (() => {
                    // Handle case where category might be a stringified array
                    let categoryArray = itemData.category
                    if (typeof itemData.category === 'string') {
                        try {
                            categoryArray = JSON.parse(itemData.category)
                        } catch (e) {
                            categoryArray = []
                        }
                    }

                    // Ensure we have an array
                    if (!Array.isArray(categoryArray)) {
                        return []
                    }

                    // Extract category names from objects or use strings directly
                    const processedCategories = categoryArray
                        .map((cat) => {
                            if (typeof cat === 'object' && cat !== null) {
                                return cat.name || cat.id || String(cat)
                            }
                            return String(cat)
                        })
                        .filter((cat) => cat && cat.trim() !== '')

                    return processedCategories
                })(),
                calories: Number(itemData.calories) || 0,
                price: Number(itemData.price) || 0,
                locations: ['meal'],
                quantities: {
                    meal: Number(itemData.quantity) || 1,
                    'shopping-list': 0,
                    pantry: 0,
                },
                user: profile._id,
            }

            const response = await axios.post(
                getServerUrl('/food-items'),
                foodItemData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (response.data.success) {
                const newFoodItem = {
                    ...response.data.foodItem,
                    tempId: `new-${response.data.foodItem._id || itemData.name}-${Date.now()}-${Math.random()}`,
                    shoppingListId: selectedShoppingListId,
                }

                setFoodItems((prevItems) => [...prevItems, newFoodItem])
                setShowItemForm(false)
                Alert.alert(
                    'Onnistui',
                    `Tuote "${itemData.name}" lisätty aterialle`
                )
            }
        } catch (error) {
            console.error('Error adding new item:', error)
            Alert.alert(
                'Virhe',
                'Tuotteen lisääminen epäonnistui: ' +
                    (error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message)
            )
        }
    }

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false)
        if (selectedDate) {
            setPlannedCookingDate(selectedDate)
        }
    }

    const handleEatingDateChange = (event, selectedDate) => {
        setShowEatingDatePicker(false)
        if (selectedDate) {
            if (editingEatingDateIndex !== null) {
                // Update existing date
                const updatedDates = [...plannedEatingDates]
                updatedDates[editingEatingDateIndex] = selectedDate
                setPlannedEatingDates(updatedDates)
                setEditingEatingDateIndex(null)
            } else {
                // Add new date
                setPlannedEatingDates([...plannedEatingDates, selectedDate])
            }
        }
    }

    const addEatingDate = () => {
        setEditingEatingDateIndex(null)
        setShowEatingDatePicker(true)
    }

    const editEatingDate = (index) => {
        setEditingEatingDateIndex(index)
        setShowEatingDatePicker(true)
    }

    const removeEatingDate = (index) => {
        const updatedDates = plannedEatingDates.filter((_, i) => i !== index)
        setPlannedEatingDates(updatedDates)
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('fi-FI')
    }

    const handleUpdateQuantity = (index, newQuantity) => {
        setFoodItems((prevItems) => {
            const updatedItems = [...prevItems]
            if (updatedItems[index]) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    quantities: {
                        ...updatedItems[index].quantities,
                        meal: newQuantity,
                    },
                    quantity: newQuantity, // This for backward compatibility
                }
            }
            return updatedItems
        })
    }

    const handleRemoveFoodItem = (index) => {
        setFoodItems((prevItems) => prevItems.filter((_, i) => i !== index))
    }

    const renderSelectedItem = ({ item, index }) => (
        <View style={styles.selectedItem}>
            <View style={styles.itemInfo}>
                <CustomText style={styles.itemName}>{item.name}</CustomText>
                <CustomText style={styles.itemDetails}>
                    {`${item.quantities?.meal || item.quantity || 1} ${item.unit || 'kpl'}`}
                </CustomText>
                <View style={styles.quantityRow}>
                    <CustomText style={styles.quantityLabel}>Määrä:</CustomText>
                    <TextInput
                        style={styles.quantityInput}
                        value={String(
                            item.quantities?.meal || item.quantity || 1
                        )}
                        onChangeText={(text) =>
                            handleUpdateQuantity(index, parseFloat(text) || 0)
                        }
                        keyboardType="numeric"
                        placeholder="0"
                    />
                    <CustomText style={styles.unitText}>
                        {item.unit || 'kpl'}
                    </CustomText>
                </View>
            </View>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveFoodItem(index)}
                >
                    <MaterialIcons name="delete" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    )

    useEffect(() => {
        fetchShoppingLists()
    }, [])

    return (
        <View style={styles.container}>
            {showItemForm ? (
                <FormFoodItem
                    onSubmit={handleAddNewItem}
                    onClose={() => setShowItemForm(false)}
                    location="meal"
                />
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.formScroll}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                >
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
                            Aterian kuva
                        </CustomText>
                        <TouchableOpacity
                            style={styles.imagePicker}
                            onPress={pickImage}
                        >
                            {mealImage ? (
                                <Image
                                    source={{ uri: mealImage.uri }}
                                    style={styles.selectedImage}
                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <MaterialIcons
                                        name="add-a-photo"
                                        size={40}
                                        color="#9C86FC"
                                    />
                                    <CustomText
                                        style={styles.imagePlaceholderText}
                                    >
                                        Lisää kuva
                                    </CustomText>
                                </View>
                            )}
                        </TouchableOpacity>

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
                            <View style={styles.checkboxGrid}>
                                {Object.entries(mealRoles).map(
                                    ([value, label]) => (
                                        <Pressable
                                            key={value}
                                            style={styles.checkboxGridItem}
                                            onPress={() => {
                                                setSelectedRoles((prev) =>
                                                    prev.includes(value)
                                                        ? prev.filter(
                                                              (r) => r !== value
                                                          )
                                                        : [...prev, value]
                                                )
                                            }}
                                        >
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    selectedRoles.includes(
                                                        value
                                                    ) && styles.checkboxChecked,
                                                ]}
                                            >
                                                {selectedRoles.includes(
                                                    value
                                                ) && (
                                                    <MaterialIcons
                                                        name="check"
                                                        size={16}
                                                        color="white"
                                                    />
                                                )}
                                            </View>
                                            <CustomText
                                                style={styles.checkboxLabel}
                                            >
                                                {label}
                                            </CustomText>
                                        </Pressable>
                                    )
                                )}
                            </View>
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
                        {Platform.OS === 'web' ? (
                            <DateTimePicker
                                value={plannedCookingDate}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                minimumDate={new Date()}
                            />
                        ) : (
                            <>
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
                            </>
                        )}

                        <View style={styles.labelWithInfo}>
                            <CustomText style={styles.label}>
                                Suunnitellut syöntipäivät (valinnainen)
                            </CustomText>
                            <Info
                                title="Suunnitellut syöntipäivät"
                                content="Voit lisätä useita päivämääriä, jos aiot syödä saman aterian useampana päivänä. Jos jätät tämän tyhjäksi, syöntipäiväksi asetetaan sama päivä kuin valmistuspäivä."
                            />
                        </View>

                        <View style={styles.eatingDatesContainer}>
                            {plannedEatingDates.length > 0 && (
                                <View style={styles.eatingDatesList}>
                                    {plannedEatingDates.map((date, index) => (
                                        <View
                                            key={index}
                                            style={styles.eatingDateItem}
                                        >
                                            <Pressable
                                                onPress={() =>
                                                    editEatingDate(index)
                                                }
                                                style={styles.eatingDateButton}
                                            >
                                                <MaterialIcons
                                                    name="event"
                                                    size={20}
                                                    color="#333"
                                                />
                                                <CustomText
                                                    style={
                                                        styles.eatingDateText
                                                    }
                                                >
                                                    {formatDate(date)}
                                                </CustomText>
                                            </Pressable>
                                            <Pressable
                                                onPress={() =>
                                                    removeEatingDate(index)
                                                }
                                                style={styles.removeDateButton}
                                            >
                                                <MaterialIcons
                                                    name="close"
                                                    size={20}
                                                    color="#FF6B6B"
                                                />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <Button
                                title="+ Lisää syöntipäivä"
                                onPress={addEatingDate}
                                style={styles.tertiaryButton}
                                textStyle={styles.buttonText}
                            />

                            {showEatingDatePicker && (
                                <View style={styles.datePickerContainer}>
                                    <DateTimePicker
                                        value={
                                            editingEatingDateIndex !== null
                                                ? plannedEatingDates[
                                                      editingEatingDateIndex
                                                  ]
                                                : new Date()
                                        }
                                        mode="date"
                                        display="default"
                                        onChange={handleEatingDateChange}
                                        minimumDate={new Date()}
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.foodItemSelectorContainer}>
                            <CustomText style={styles.label}>
                                Raaka-aineet
                            </CustomText>
                            <UnifiedFoodSearch
                                onSelectItem={handleSelectItem}
                                location="meal"
                                allowDuplicates={true}
                            />

                            <View style={styles.manualAddContainer}>
                                <Button
                                    title="+ Luo uusi tuote"
                                    onPress={() => setShowItemForm(true)}
                                    style={[
                                        styles.tertiaryButton,
                                        isDesktop &&
                                            styles.desktopPrimaryButton,
                                    ]}
                                    textStyle={styles.buttonText}
                                />
                            </View>

                            {/* Display selected food items */}
                            {foodItems.length > 0 && (
                                <View style={styles.selectedItemsContainer}>
                                    <CustomText
                                        style={styles.selectedItemsTitle}
                                    >
                                        Valitut raaka-aineet:
                                    </CustomText>
                                    <FlatList
                                        data={foodItems}
                                        renderItem={renderSelectedItem}
                                        keyExtractor={(item, index) =>
                                            item.tempId ||
                                            `${item._id || item.name}-${index}`
                                        }
                                        style={styles.selectedItemsList}
                                        showsVerticalScrollIndicator={true}
                                        nestedScrollEnabled={true}
                                        scrollEnabled={true}
                                        removeClippedSubviews={false}
                                        getItemLayout={(data, index) => ({
                                            length: 100,
                                            offset: 100 * index,
                                            index,
                                        })}
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.buttonGroup}>
                            <Button
                                title="Tallenna ateria"
                                onPress={handleFormSubmit}
                                style={[
                                    styles.primaryButton,
                                    isDesktop && styles.desktopPrimaryButton,
                                ]}
                                textStyle={styles.buttonText}
                            />
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    formContainer: {
        paddingVertical: 5,
        zIndex: 1,
    },
    formScroll: {
        flexGrow: 1,
        paddingBottom: 20,
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
    desktopPrimaryButton: {
        maxWidth: 300,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
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
        alignItems: 'center',
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemDetails: {
        color: '#666',
        fontSize: 14,
    },
    checkboxGroup: {
        backgroundColor: 'white',
        padding: 5,
        marginBottom: 10,
    },
    checkboxGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    checkboxGridItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        width: '48%',
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
        zIndex: 9998,
        position: 'relative',
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
    quantityLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 10,
        color: '#333',
        minWidth: 50,
    },
    quantityInput: {
        width: 60,
        height: 32,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: 'white',
        fontSize: 14,
        textAlign: 'center',
        marginRight: 8,
    },
    unitText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        minWidth: 30,
    },
    selectedItemsContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    selectedItemsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    selectedItemsList: {
        maxHeight: 400,
        minHeight: 100,
        flexGrow: 0,
    },
    selectedItem: {
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
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 8,
    },
    removeButton: {
        backgroundColor: '#e0e0e0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    manualAddContainer: {
        marginTop: 10,
        marginBottom: 15,
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        width: 'auto',
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    imagePicker: {
        borderWidth: 2,
        borderColor: '#9C86FC',
        borderStyle: 'dashed',
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: '#9C86FC',
        fontSize: 16,
        fontWeight: '500',
    },
    selectedImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    eatingDatesContainer: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    eatingDatesList: {
        marginBottom: 10,
    },
    eatingDateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    eatingDateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    eatingDateText: {
        fontSize: 16,
        color: '#333',
    },
    removeDateButton: {
        padding: 4,
    },
    datePickerContainer: {
        marginTop: 10,
        marginLeft: -10,
    },
})

export default AddMealForm
