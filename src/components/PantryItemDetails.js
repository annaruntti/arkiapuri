import { Feather, MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import * as ImagePicker from 'expo-image-picker'
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
import categories from '../data/categories'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import Button from './Button'
import CategorySelect from './CategorySelect'
import CustomText from './CustomText'
import DateTimePicker from './DateTimePicker'
import ResponsiveModal from './ResponsiveModal'

const PANTRY_PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/1YIQLI04JJpf76ARo3k0b9/87322f1b9ccec07d2f2af66f7d61d53d/undraw_online-groceries_n03y.png'

const PantryItemDetails = ({ item, visible, onClose, onUpdate }) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showCategorySelect, setShowCategorySelect] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

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
            const categoryNames = item.category.map((id) => getCategoryName(id))
            setEditedValues({
                ...item,
                category: categoryNames,
            })
        }
    }, [item])

    if (!item) return null

    const formatDate = (date) => {
        try {
            return format(new Date(date), 'dd.MM.yyyy', { locale: fi })
        } catch (error) {
            return 'Ei päivämäärää'
        }
    }

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
            const categoryIds = editedValues.category.map((name) =>
                getCategoryId(name)
            )

            const updatedValues = {
                ...editedValues,
                category: categoryIds,
            }

            await onUpdate(item._id, updatedValues)
            setEditableFields({})
            setShowCategorySelect(false)
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
                        location: 'pantry',
                        locations: ['pantry'],
                        quantity: item.quantity || 1,
                        quantities: {
                            meal: 0,
                            'shopping-list': 0,
                            pantry: item.quantity || 1,
                        },
                    }

                    const createResponse = await axios.post(
                        getServerUrl('/food-items'),
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

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onClose}
            title="Elintarvikkeen tiedot"
            maxWidth={700}
        >
            <ScrollView style={styles.detailScroll}>
                <View style={styles.itemDetails}>
                    {item.image && item.image.url && (
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: item.image.url }}
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
                                        color="#9C86FC"
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
                    )}
                    {(!item.image || !item.image.url) && (
                        <View style={styles.noImageContainer}>
                            <TouchableOpacity
                                style={styles.addImageButton}
                                onPress={pickImage}
                                disabled={isUploadingImage}
                            >
                                <MaterialIcons
                                    name="add-a-photo"
                                    size={40}
                                    color="#9C86FC"
                                />
                                <CustomText style={styles.addImageText}>
                                    Add Image
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    )}
                    {renderEditableField('name', 'Nimi', item.name)}
                    {renderEditableField(
                        'quantity',
                        'Määrä',
                        item.quantity,
                        'number'
                    )}
                    {renderEditableField('unit', 'Yksikkö', item.unit)}
                    {renderEditableField(
                        'calories',
                        'Kalorit',
                        item.calories || '0',
                        'number'
                    )}

                    <View style={styles.detailRow}>
                        <CustomText style={styles.label}>
                            Kategoriat:
                        </CustomText>
                        <View style={styles.valueContainer}>
                            <CategorySelect
                                value={editedValues.category || []}
                                onChange={handleCategoryChange}
                                isModalVisible={showCategorySelect}
                                setIsModalVisible={setShowCategorySelect}
                                toggleModal={() =>
                                    setShowCategorySelect(!showCategorySelect)
                                }
                                categories={categories}
                            />
                            <TouchableOpacity
                                style={styles.editIcon}
                                onPress={() => setShowCategorySelect(true)}
                            >
                                <Feather name="edit-2" size={18} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <CustomText style={styles.label}>
                            Viimeinen käyttöpäivä:
                        </CustomText>
                        {Platform.OS === 'web' ? (
                            <DateTimePicker
                                value={
                                    new Date(
                                        editedValues.expirationDate ||
                                            item.expirationDate
                                    )
                                }
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        handleChange(
                                            'expirationDate',
                                            selectedDate
                                        )
                                    }
                                }}
                            />
                        ) : (
                            <View style={styles.valueContainer}>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <CustomText>
                                        {formatDate(
                                            editedValues.expirationDate ||
                                                item.expirationDate
                                        )}
                                    </CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.editIcon}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Feather
                                        name="calendar"
                                        size={18}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {Platform.OS !== 'web' && showDatePicker && (
                        <DateTimePicker
                            value={
                                new Date(
                                    editedValues.expirationDate ||
                                        item.expirationDate
                                )
                            }
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false)
                                if (selectedDate) {
                                    handleChange('expirationDate', selectedDate)
                                }
                            }}
                        />
                    )}

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
        borderColor: '#9C86FC',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        width: '100%',
    },
    addImageText: {
        marginTop: 8,
        color: '#9C86FC',
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
    label: {
        fontWeight: 'bold',
        flex: 1,
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
        borderBottomColor: '#9C86FC',
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
        backgroundColor: '#9C86FC',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        minWidth: 200,
        width: '100%',
    },
    categoryButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderRadius: 4,
        backgroundColor: 'white',
    },
})

export default PantryItemDetails
