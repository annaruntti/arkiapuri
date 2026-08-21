import axios from 'axios'
import { useEffect, useState } from 'react'
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

import categories from '../data/categories'
import { useShowNutrition } from '../hooks/useShowNutrition'
import { getServerUrl } from '../utils/getServerUrl'
import { getFoodItemImageUrl } from '../utils/openFoodFactsMapper'
import storage from '../utils/storage'

import Button from './Button'
import CategorySelect from './CategorySelect'
import CustomText from './CustomText'
import FormDateField from './FormDateField'
import ResponsiveModal from './ResponsiveModal'

const NUTRITION_ROWS = [
    { key: 'calories', label: 'Kalorit', unit: 'kcal' },
    { key: 'proteins', label: 'Proteiini', unit: 'g' },
    { key: 'carbohydrates', label: 'Hiilihydraatit', unit: 'g' },
    { key: 'sugars', label: 'Sokerit', unit: 'g' },
    { key: 'fat', label: 'Rasva', unit: 'g' },
    { key: 'saturatedFat', label: 'Tyydyttynyt rasva', unit: 'g' },
    { key: 'fiber', label: 'Kuitu', unit: 'g' },
    { key: 'salt', label: 'Suola', unit: 'g' },
]

const formatTagList = (value) => {
    if (!value) return ''
    const list = Array.isArray(value) ? value : String(value).split(',')
    return list
        .map((entry) =>
            String(entry)
                .replace(/^[a-z]{2}:/, '')
                .replace(/-/g, ' ')
                .trim()
        )
        .filter(Boolean)
        .join(', ')
}

const getItemNutrition = (item) =>
    item?.nutrition || item?.openFoodFactsData?.nutrition || {}

const PantryItemDetails = ({
    item,
    visible,
    onClose,
    onUpdate,
    embedded = false,
    showInventoryFields = true,
}) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const showNutrition = useShowNutrition()

    const getCategoryName = (id) => {
        // Search through all categories and their children to find the matching name
        for (const category of categories) {
            const subcategory = category.children.find(
                (c) => String(c.id) === String(id)
            )
            if (subcategory) return subcategory.name
        }
        return id // Fallback to ID if name not found
    }

    const getCategoryId = (name) => {
        // Search through all categories and their children to find the matching ID
        for (const category of categories) {
            const subcategory = category.children.find((c) => c.name === name)
            if (subcategory) return subcategory.id
        }
        return name // Fallback to name if ID not found
    }

    useEffect(() => {
        if (item) {
            // Convert category IDs to names when loading
            const categoryNames = (item.category || []).map((id) =>
                getCategoryName(id)
            )
            setEditedValues({
                ...item,
                category: categoryNames,
            })
        }
    }, [item])

    if (!item) return null

    const imageUrl = getFoodItemImageUrl(item)
    const off = item.openFoodFactsData || {}
    const nutrition = getItemNutrition(item)
    const caloriesValue =
        item.calories || nutrition.calories || off.nutrition?.calories || '0'
    const nutritionRows = NUTRITION_ROWS.map((row) => {
        const value =
            row.key === 'calories'
                ? caloriesValue
                : nutrition[row.key] ?? off.nutrition?.[row.key]
        const numeric = parseFloat(value)
        return {
            ...row,
            value: Number.isFinite(numeric) && numeric !== 0 ? numeric : null,
        }
    }).filter((row) => row.value != null)

    const toggleEdit = (field) => {
        setEditableFields((prev) => ({
            ...prev,
            [field]: !prev[field],
        }))
        if (!editedValues[field]) {
            setEditedValues((prev) => ({
                ...prev,
                [field]: item[field],
            }))
        }
    }

    const handleChange = (field, value) => {
        setEditedValues((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleCategoryChange = (selectedItems) => {
        // selectedItems are IDs, convert them to names for display
        const categoryNames = selectedItems.map((id) => getCategoryName(id))
        setEditedValues((prev) => ({
            ...prev,
            category: categoryNames,
        }))
    }

    const handleSave = async () => {
        try {
            // Convert category names back to IDs before saving
            const categoryIds = (editedValues.category || []).map((name) =>
                getCategoryId(name)
            )

            const updatedValues = {
                ...editedValues,
                category: categoryIds,
            }

            await onUpdate(item._id, updatedValues)
            setEditableFields({})
        } catch (error) {
            console.error('Error saving updates:', error)
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
                    await uploadFoodItemImage(result.assets[0])
                }
                return
            }

            // For mobile, show action sheet with options
            Alert.alert('Valitse kuva', 'Valitse, miten haluat lisätä kuvan', [
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
                                await uploadFoodItemImage(result.assets[0])
                            }
                        } catch (error) {
                            console.error('Camera error:', error)
                            Alert.alert(
                                'Error',
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
                            await uploadFoodItemImage(result.assets[0])
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

    const uploadFoodItemImage = async (imageFile) => {
        try {
            setIsUploadingImage(true)
            const token = await storage.getItem('userToken')
            if (!token) {
                throw new Error('No token found')
            }

            // Verify the food item still exists before uploading
            if (!item) {
                throw new Error('Food item not found')
            }

            let foodItemId = item.foodId?._id

            // If no food item exists, create one
            if (!foodItemId) {
                try {
                    const newFoodItemData = {
                        name: item.name,
                        category: item.category || [],
                        unit: item.unit,
                        calories: item.calories || 0,
                        price: item.price || 0,
                    }

                    const createResponse = await axios.post(
                        getServerUrl('/food-items/find-or-create'),
                        newFoodItemData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (createResponse.data.success) {
                        const newFoodItem = createResponse.data.foodItem
                        foodItemId = newFoodItem._id

                        // Update the pantry item to reference the new food item
                        // This will be handled by the parent component's onUpdate callback
                    } else {
                        throw new Error('Failed to create new food item')
                    }
                } catch (createError) {
                    console.error('Error creating new food item:', createError)
                    throw new Error(
                        'Could not create food item for image upload'
                    )
                }
            }

            const formData = new FormData()
            if (Platform.OS === 'web' && imageFile.uri.startsWith('blob:')) {
                const response = await fetch(imageFile.uri)
                const blob = await response.blob()
                const file = new File([blob], 'food-item.jpg', {
                    type: 'image/jpeg',
                })
                formData.append('mealImage', file)
            } else {
                formData.append('mealImage', {
                    uri: imageFile.uri,
                    type: 'image/jpeg',
                    name: 'food-item.jpg',
                })
            }

            const url = getServerUrl(`/food-items/${foodItemId}/image`)

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                // Update with both foodId reference AND temporary image for immediate display
                const updatedItem = {
                    ...item,
                    foodId: {
                        ...response.data.foodItem, // Include full FoodItem data temporarily for display
                    },
                    image: response.data.foodItem.image, // Temporary image for immediate display
                }

                onUpdate(item._id, updatedItem)
            }
        } catch (error) {
            console.error('Error uploading food item image:', error)
            if (error.message === 'Food item not found') {
                Alert.alert(
                    'Virhe',
                    'Tämä elintarvike ei ole enää olemassa. Päivitä varastosi ja yritä uudelleen.'
                )
            } else {
                Alert.alert(
                    'Virhe',
                    'Kuvien lataaminen epäonnistui: ' + error.message
                )
            }
        } finally {
            setIsUploadingImage(false)
        }
    }

    const removeFoodItemImage = () => {
        Alert.alert('Poista kuva', 'Haluatko varmasti poistaa kuvan?', [
            { text: 'Peruuta', style: 'cancel' },
            {
                text: 'Poista',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await storage.getItem('userToken')
                        if (!token) {
                            throw new Error('No token found')
                        }

                        const response = await axios.delete(
                            getServerUrl(
                                `/food-items/${item.foodId._id}/image`
                            ),
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        )

                        if (response.data.success) {
                            const updatedItem = { ...item, image: null }
                            onUpdate(item._id, updatedItem)
                            Alert.alert(
                                'Success',
                                'Kuva poistettu onnistuneesti'
                            )
                        }
                    } catch (error) {
                        console.error('Error removing food item image:', error)
                        Alert.alert('Virhe', 'kuvan poistaminen epäonnistui')
                    }
                },
            },
        ])
    }

    const renderEditableField = (field, label, value, type = 'text') => {
        return (
            <View style={styles.detailRow}>
                <CustomText style={styles.label}>{label}:</CustomText>
                <View style={styles.valueContainer}>
                    {editableFields[field] ? (
                        <TextInput
                            style={styles.input}
                            value={String(editedValues[field])}
                            onChangeText={(text) => handleChange(field, text)}
                            keyboardType={
                                type === 'number' ? 'numeric' : 'default'
                            }
                            autoFocus
                            selectTextOnFocus
                        />
                    ) : (
                        <CustomText>{value}</CustomText>
                    )}
                    <TouchableOpacity
                        style={styles.editIcon}
                        onPress={() => toggleEdit(field)}
                    >
                        <Feather
                            name={editableFields[field] ? 'check' : 'edit-2'}
                            size={18}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const content = (
        <ScrollView style={styles.detailScroll}>
            <View style={styles.itemDetails}>
                {imageUrl ? (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.itemImage}
                            resizeMode="cover"
                        />
                        <View style={styles.imageActions}>
                            <TouchableOpacity
                                style={styles.imageActionButton}
                                onPress={pickImage}
                                disabled={isUploadingImage}
                            >
                                <MaterialIcons
                                    name="edit"
                                    size={20}
                                    color="#5844BB"
                                />
                                <CustomText style={styles.imageActionText}>
                                    Change
                                </CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.imageActionButton}
                                onPress={removeFoodItemImage}
                                disabled={isUploadingImage}
                            >
                                <MaterialIcons
                                    name="delete"
                                    size={20}
                                    color="#ff4444"
                                />
                                <CustomText style={styles.imageActionText}>
                                    Remove
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.noImageContainer}>
                        <TouchableOpacity
                            style={styles.addImageButton}
                            onPress={pickImage}
                            disabled={isUploadingImage}
                        >
                            <MaterialIcons
                                name="add-a-photo"
                                size={40}
                                color="#5844BB"
                            />
                            <CustomText style={styles.addImageText}>
                                Add Image
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                )}
                {renderEditableField('name', 'Nimi', item.name)}
                {showInventoryFields
                    ? renderEditableField(
                          'quantity',
                          'Määrä',
                          item.quantity,
                          'number'
                      )
                    : null}
                {showInventoryFields
                    ? renderEditableField('unit', 'Yksikkö', item.unit)
                    : null}
                {showNutrition &&
                    renderEditableField(
                        'calories',
                        'Kalorit',
                        caloriesValue,
                        'number'
                    )}

                {showNutrition && nutritionRows.length > 0 ? (
                    <View style={styles.nutritionBlock}>
                        <CustomText style={styles.sectionLabel}>
                            Ravintoarvot (per 100 g / 100 ml)
                        </CustomText>
                        {nutritionRows
                            .filter((row) => row.key !== 'calories')
                            .map((row) => (
                                <View key={row.key} style={styles.nutritionRow}>
                                    <CustomText style={styles.nutritionLabel}>
                                        {row.label}
                                    </CustomText>
                                    <CustomText style={styles.nutritionValue}>
                                        {row.value} {row.unit}
                                    </CustomText>
                                </View>
                            ))}
                    </View>
                ) : null}

                {off.brands ||
                off.barcode ||
                off.nutritionGrade ||
                off.quantityLabel ||
                off.allergens ||
                off.labels ? (
                    <View style={styles.offBlock}>
                        <CustomText style={styles.sectionLabel}>
                            Open Food Facts
                        </CustomText>
                        {off.brands ? (
                            <View style={styles.nutritionRow}>
                                <CustomText style={styles.nutritionLabel}>
                                    Merkki
                                </CustomText>
                                <CustomText style={styles.nutritionValue}>
                                    {off.brands}
                                </CustomText>
                            </View>
                        ) : null}
                        {off.barcode ? (
                            <View style={styles.nutritionRow}>
                                <CustomText style={styles.nutritionLabel}>
                                    Viivakoodi
                                </CustomText>
                                <CustomText style={styles.nutritionValue}>
                                    {off.barcode}
                                </CustomText>
                            </View>
                        ) : null}
                        {off.nutritionGrade ? (
                            <View style={styles.nutritionRow}>
                                <CustomText style={styles.nutritionLabel}>
                                    Nutri-Score
                                </CustomText>
                                <CustomText style={styles.nutritionValue}>
                                    {String(off.nutritionGrade).toUpperCase()}
                                </CustomText>
                            </View>
                        ) : null}
                        {off.quantityLabel ? (
                            <View style={styles.nutritionRow}>
                                <CustomText style={styles.nutritionLabel}>
                                    Pakkauskoko
                                </CustomText>
                                <CustomText style={styles.nutritionValue}>
                                    {off.quantityLabel}
                                </CustomText>
                            </View>
                        ) : null}
                        {formatTagList(off.allergens) ? (
                            <View style={styles.offTextRow}>
                                <CustomText style={styles.nutritionLabel}>
                                    Allergeenit
                                </CustomText>
                                <CustomText style={styles.offTextValue}>
                                    {formatTagList(off.allergens)}
                                </CustomText>
                            </View>
                        ) : null}
                        {formatTagList(off.labels) ? (
                            <View style={styles.offTextRow}>
                                <CustomText style={styles.nutritionLabel}>
                                    Merkinnät
                                </CustomText>
                                <CustomText style={styles.offTextValue}>
                                    {formatTagList(off.labels)}
                                </CustomText>
                            </View>
                        ) : null}
                    </View>
                ) : null}

                <View style={styles.categoryRow}>
                    <CustomText style={styles.label}>Kategoriat:</CustomText>
                    <CategorySelect
                        value={editedValues.category || []}
                        onChange={handleCategoryChange}
                        categories={categories}
                    />
                </View>

                {showInventoryFields ? (
                    <FormDateField
                        label="Viimeinen käyttöpäivä"
                        value={
                            new Date(
                                editedValues.expirationDate ||
                                    item.expirationDate
                            )
                        }
                        onChange={(selectedDate) =>
                            handleChange('expirationDate', selectedDate)
                        }
                        style={styles.expirationDateField}
                        testID="pantryExpirationDate"
                    />
                ) : null}

                {Object.keys(editedValues).length > 0 && (
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Tallenna muutokset"
                            onPress={handleSave}
                            style={styles.saveButton}
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    )

    if (embedded) {
        return content
    }

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onClose}
            title="Elintarvikkeen tiedot"
            maxWidth={640}
        >
            {content}
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    detailScroll: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    itemDetails: {
        paddingTop: 10,
    },
    imageContainer: {
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    noImageContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    itemImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    imageActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    imageActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        gap: 5,
    },
    imageActionText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    addImageButton: {
        borderWidth: 2,
        borderColor: '#5844BB',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        width: '100%',
    },
    addImageText: {
        marginTop: 8,
        color: '#5844BB',
        fontSize: 16,
        fontWeight: '500',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryRow: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 8,
    },
    expirationDateField: {
        marginTop: 4,
        marginBottom: 8,
    },
    label: {
        fontWeight: 'bold',
        flex: 1,
    },
    sectionLabel: {
        fontWeight: '600',
        fontSize: 15,
        color: '#1f2937',
        marginBottom: 8,
    },
    nutritionBlock: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    offBlock: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    nutritionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        gap: 12,
    },
    nutritionLabel: {
        color: '#4b5563',
        fontSize: 14,
        flexShrink: 0,
    },
    nutritionValue: {
        color: '#1f2937',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
    },
    offTextRow: {
        paddingVertical: 6,
        gap: 4,
    },
    offTextValue: {
        color: '#1f2937',
        fontSize: 14,
        lineHeight: 20,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
        justifyContent: 'flex-end',
    },
    editIcon: {
        padding: 5,
        marginLeft: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#5844BB',
        padding: 2,
        minWidth: 50,
        textAlign: 'right',
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#AE9CFC',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        minWidth: 200,
        width: '100%',
    },
})

export default PantryItemDetails
