import { Feather, MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import { getDifficultyText, getMealTypeText } from '../utils/mealUtils'
import storage from '../utils/storage'
import Button from './Button'
import CustomText from './CustomText'
import DateTimePicker from './DateTimePicker'
import FoodItemRow from './FoodItemRow'
import FormFoodItem from './FormFoodItem'
import ResponsiveModal from './ResponsiveModal'

const difficultyLevels = [
    { value: 'easy', label: 'Helppo' },
    { value: 'medium', label: 'Keskitaso' },
    { value: 'hard', label: 'Vaikea' },
]

const mealTypes = [
    { value: 'breakfast', label: 'Aamiainen' },
    { value: 'lunch', label: 'Lounas' },
    { value: 'snack', label: 'Välipala' },
    { value: 'dinner', label: 'Päivällinen' },
    { value: 'supper', label: 'Iltapala' },
    { value: 'dessert', label: 'Jälkiruoka' },
    { value: 'other', label: 'Muu' },
]

const MealItemDetail = ({ meal, visible, onClose, onUpdate }) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [editingFoodItem, setEditingFoodItem] = useState(null)
    const [activeTab, setActiveTab] = useState('ingredients')
    const [showFoodItemForm, setShowFoodItemForm] = useState(false)
    const [showDifficultyPicker, setShowDifficultyPicker] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    useEffect(() => {
        if (meal) {
            setEditedValues({
                ...meal,
                foodItems: [...meal.foodItems],
            })
        }
    }, [meal])

    if (!meal || !visible) {
        return null
    }

    const toggleEdit = (field) => {
        if (editableFields[field]) {
            // We're saving the edit, so keep the current edited value
            setEditedValues((prev) => ({
                ...prev,
                [field]: prev[field],
            }))
        } else {
            // We're starting to edit, so initialize with current value
            setEditedValues((prev) => ({
                ...prev,
                [field]:
                    field === 'difficultyLevel'
                        ? meal.difficultyLevel || 'MEDIUM'
                        : meal[field],
            }))
        }

        setEditableFields((prev) => ({
            ...prev,
            [field]: !prev[field],
        }))
    }

    const handleChange = (field, value) => {
        setEditedValues((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleFoodItemChange = (index, field, value) => {
        setEditedValues((prev) => {
            const updatedFoodItems = [...prev.foodItems]
            updatedFoodItems[index] = {
                ...updatedFoodItems[index],
                [field]: value,
            }
            return {
                ...prev,
                foodItems: updatedFoodItems,
            }
        })
    }

    const handleAddFoodItem = () => {
        setShowFoodItemForm(true)
    }

    const handleNewFoodItem = (newFoodItem) => {
        setEditedValues((prev) => ({
            ...prev,
            foodItems: [...prev.foodItems, newFoodItem],
        }))
        setShowFoodItemForm(false)
    }

    const handleRemoveFoodItem = (index) => {
        setEditedValues((prev) => ({
            ...prev,
            foodItems: prev.foodItems.filter((_, i) => i !== index),
        }))
    }

    const handleSave = async () => {
        try {
            // Ensure all food items have required fields
            const updatedFoodItems = editedValues.foodItems.map((item) => ({
                ...item,
                quantities: item.quantities || {
                    meal: 0,
                    'shopping-list': 0,
                    pantry: 0,
                },
                locations: item.locations || [],
                category: item.category || [],
                price: item.price || 0,
                calories: item.calories || 0,
                location: item.location || 'meal',
            }))

            // Convert the edited values to the format expected by the backend
            const updatedMeal = {
                ...editedValues,
                foodItems: updatedFoodItems,
                cookingTime: parseInt(editedValues.cookingTime) || 0,
                difficultyLevel:
                    editedValues.difficultyLevel || meal.difficultyLevel,
                defaultRoles: editedValues.defaultRoles
                    ? Array.isArray(editedValues.defaultRoles)
                        ? editedValues.defaultRoles
                        : [editedValues.defaultRoles]
                    : meal.defaultRoles,
                _id: undefined,
                id: undefined,
                __v: undefined,
            }

            await onUpdate(meal._id, updatedMeal)
            setEditableFields({})
            setEditingFoodItem(null)
        } catch (error) {
            console.error('Error saving updates:', error)
        }
    }

    const pickImage = async () => {
        try {
            // Request permissions
            if (Platform.OS !== 'web') {
                const { status } =
                    await ImagePicker.requestMediaLibraryPermissionsAsync()
                if (status !== 'granted') {
                    Alert.alert(
                        'Sorry, we need camera roll permissions to make this work!'
                    )
                    return
                }
            }

            // Pick the image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            })

            if (!result.canceled) {
                await uploadMealImage(result.assets[0])
            }
        } catch (error) {
            console.error('Error picking image:', error)
            Alert.alert('Error', 'Failed to pick image')
        }
    }

    const uploadMealImage = async (imageFile) => {
        try {
            setIsUploadingImage(true)
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

            const url = getServerUrl(`/meals/${meal._id}/image`)
            console.log('Uploading to URL:', url)

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                console.log('Meal image uploaded successfully')
                // Update the meal data with the new image
                const updatedMeal = { ...meal, image: response.data.meal.image }
                onUpdate(meal._id, updatedMeal)
                Alert.alert('Success', 'Image updated successfully')
            }
        } catch (error) {
            console.error('Error uploading meal image:', error)
            Alert.alert('Error', 'Failed to upload image')
        } finally {
            setIsUploadingImage(false)
        }
    }

    const removeMealImage = () => {
        Alert.alert(
            'Remove Image',
            'Are you sure you want to remove this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await storage.getItem('userToken')
                            if (!token) {
                                throw new Error('No token found')
                            }

                            // Call backend to remove image
                            const response = await axios.delete(
                                getServerUrl(`/meals/${meal._id}/image`),
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            )

                            if (response.data.success) {
                                console.log('Meal image removed successfully')
                                // Update the meal data to remove the image
                                const updatedMeal = { ...meal, image: null }
                                onUpdate(meal._id, updatedMeal)
                                Alert.alert(
                                    'Success',
                                    'Image removed successfully'
                                )
                            }
                        } catch (error) {
                            console.error('Error removing meal image:', error)
                            Alert.alert('Error', 'Failed to remove image')
                        }
                    },
                },
            ]
        )
    }

    const renderEditableField = (field, label, value, type = 'text') => {
        if (field === 'difficultyLevel' && editableFields[field]) {
            return (
                <View style={styles.detailRow}>
                    <CustomText style={styles.detailLabel}>{label}:</CustomText>
                    <View style={styles.valueContainer}>
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowDifficultyPicker(true)}
                        >
                            <CustomText style={styles.pickerButtonText}>
                                {difficultyLevels.find(
                                    (level) =>
                                        level.value ===
                                        (editedValues[field] || 'medium')
                                )?.label || 'Valitse vaikeus'}
                            </CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={() => toggleEdit(field)}
                        >
                            <Feather name="check" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

        if (field === 'defaultRoles' && editableFields[field]) {
            // Handle defaultRoles as an array - use first element for picker
            const currentValue = Array.isArray(editedValues[field])
                ? editedValues[field][0]
                : editedValues[field] ||
                  (Array.isArray(value) ? value[0] : value)

            return (
                <View style={styles.detailRow}>
                    <CustomText style={styles.detailLabel}>{label}:</CustomText>
                    <View style={styles.valueContainer}>
                        <View style={styles.mealTypeScrollPicker}>
                            {/* Top scroll indicator */}
                            <View style={styles.mealTypeScrollIndicatorTop}>
                                <MaterialIcons
                                    name="keyboard-arrow-up"
                                    size={16}
                                    color="#999"
                                />
                            </View>

                            <ScrollView
                                style={styles.mealTypeScrollView}
                                contentContainerStyle={
                                    styles.mealTypeScrollContent
                                }
                                showsVerticalScrollIndicator={false}
                                snapToInterval={32}
                                decelerationRate="fast"
                                onMomentumScrollEnd={(event) => {
                                    const y = event.nativeEvent.contentOffset.y
                                    const index = Math.round(y / 32)
                                    const selectedType =
                                        mealTypes[index] || mealTypes[0]
                                    handleChange(field, [selectedType.value])
                                }}
                            >
                                {mealTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[
                                            styles.mealTypeScrollOption,
                                            currentValue === type.value &&
                                                styles.mealTypeScrollOptionSelected,
                                        ]}
                                        onPress={() =>
                                            handleChange(field, [type.value])
                                        }
                                    >
                                        <CustomText
                                            style={[
                                                styles.mealTypeScrollOptionText,
                                                currentValue === type.value &&
                                                    styles.mealTypeScrollOptionTextSelected,
                                            ]}
                                        >
                                            {type.label}
                                        </CustomText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Bottom scroll indicator */}
                            <View style={styles.mealTypeScrollIndicatorBottom}>
                                <MaterialIcons
                                    name="keyboard-arrow-down"
                                    size={16}
                                    color="#999"
                                />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={() => toggleEdit(field)}
                        >
                            <Feather name="check" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }

        return (
            <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>{label}:</CustomText>
                <View style={styles.valueContainer}>
                    {editableFields[field] ? (
                        <TextInput
                            style={styles.input}
                            value={
                                editedValues[field] !== undefined
                                    ? String(editedValues[field])
                                    : String(value)
                            }
                            onChangeText={(text) => handleChange(field, text)}
                            keyboardType={
                                type === 'number' ? 'numeric' : 'default'
                            }
                            placeholder={label}
                        />
                    ) : (
                        <CustomText>
                            {type === 'number' && field === 'cookingTime'
                                ? `${editedValues[field] || value} min`
                                : field === 'difficultyLevel'
                                  ? getDifficultyText(
                                        editedValues[field] || value
                                    )
                                  : field === 'defaultRoles'
                                    ? getMealTypeText(
                                          editedValues[field] || value
                                      )
                                    : editedValues[field] || value}
                        </CustomText>
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

    const renderTabContent = () => {
        if (activeTab === 'ingredients') {
            return (
                <View style={styles.detailSection}>
                    <View style={styles.sectionHeader}>
                        <CustomText style={styles.sectionTitle}>
                            Raaka-aineet:
                        </CustomText>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddFoodItem}
                        >
                            <Feather name="plus" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                    {editedValues.foodItems?.map((item, index) => (
                        <FoodItemRow
                            key={index}
                            item={item}
                            index={index}
                            onEdit={(index) =>
                                setEditingFoodItem(
                                    editingFoodItem === index ? null : index
                                )
                            }
                            onRemove={handleRemoveFoodItem}
                            isEditing={editingFoodItem === index}
                            onItemChange={handleFoodItemChange}
                        />
                    ))}
                </View>
            )
        } else {
            return (
                <View style={styles.detailSection}>
                    <View style={styles.recipeHeader}>
                        <CustomText style={styles.sectionTitle}>
                            Valmistusohje:
                        </CustomText>
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={() => toggleEdit('recipe')}
                        >
                            <Feather
                                name={
                                    editableFields.recipe ? 'check' : 'edit-2'
                                }
                                size={18}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                    {editableFields.recipe ? (
                        <TextInput
                            style={[styles.input, styles.recipeInput]}
                            value={editedValues.recipe}
                            onChangeText={(text) =>
                                handleChange('recipe', text)
                            }
                            multiline
                            numberOfLines={4}
                        />
                    ) : (
                        <CustomText style={styles.recipeText}>
                            {editedValues.recipe || 'Ei valmistusohjetta'}
                        </CustomText>
                    )}
                </View>
            )
        }
    }

    return (
        <>
            <ResponsiveModal
                visible={visible}
                onClose={onClose}
                title={meal.name}
                maxWidth={700}
            >
                <ScrollView style={styles.detailScroll}>
                    <View style={styles.mealDetails}>
                        {meal.image && meal.image.url && (
                            <View style={styles.mealImageContainer}>
                                <Image
                                    source={{ uri: meal.image.url }}
                                    style={styles.mealImage}
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
                                        <CustomText
                                            style={styles.imageActionText}
                                        >
                                            Change
                                        </CustomText>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.imageActionButton}
                                        onPress={removeMealImage}
                                        disabled={isUploadingImage}
                                    >
                                        <MaterialIcons
                                            name="delete"
                                            size={20}
                                            color="#ff4444"
                                        />
                                        <CustomText
                                            style={styles.imageActionText}
                                        >
                                            Remove
                                        </CustomText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        {(!meal.image || !meal.image.url) && (
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
                        {renderEditableField('name', 'Nimi', meal.name)}
                        {renderEditableField(
                            'difficultyLevel',
                            'Vaikeustaso',
                            getDifficultyText(meal.difficultyLevel)
                        )}
                        {renderEditableField(
                            'cookingTime',
                            'Valmistusaika',
                            `${meal.cookingTime} min`,
                            'number'
                        )}

                        <View style={styles.detailRow}>
                            <CustomText style={styles.detailLabel}>
                                Suunniteltu valmistuspäivä:
                            </CustomText>
                            <View style={styles.valueContainer}>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <CustomText>
                                        {format(
                                            new Date(
                                                editedValues.plannedCookingDate ||
                                                    meal.plannedCookingDate
                                            ),
                                            'dd.MM.yyyy',
                                            { locale: fi }
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
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={
                                    new Date(
                                        editedValues.plannedCookingDate ||
                                            meal.plannedCookingDate
                                    )
                                }
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false)
                                    if (selectedDate) {
                                        handleChange(
                                            'plannedCookingDate',
                                            selectedDate
                                        )
                                    }
                                }}
                            />
                        )}

                        {renderEditableField(
                            'defaultRoles',
                            'Aterian tyyppi',
                            getMealTypeText(meal.defaultRoles)
                        )}

                        <View style={styles.tabsContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    activeTab === 'ingredients' &&
                                        styles.activeTab,
                                ]}
                                onPress={() => setActiveTab('ingredients')}
                            >
                                <CustomText
                                    style={[
                                        styles.tabText,
                                        activeTab === 'ingredients' &&
                                            styles.activeTabText,
                                    ]}
                                >
                                    Raaka-aineet
                                </CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    activeTab === 'recipe' && styles.activeTab,
                                ]}
                                onPress={() => setActiveTab('recipe')}
                            >
                                <CustomText
                                    style={[
                                        styles.tabText,
                                        activeTab === 'recipe' &&
                                            styles.activeTabText,
                                    ]}
                                >
                                    Valmistusohje
                                </CustomText>
                            </TouchableOpacity>
                        </View>

                        {renderTabContent()}

                        <View style={styles.buttonContainer}>
                            <Button
                                title="Tallenna muutokset"
                                onPress={handleSave}
                                style={styles.saveButton}
                            />
                        </View>
                    </View>
                </ScrollView>
            </ResponsiveModal>

            {showFoodItemForm && (
                <ResponsiveModal
                    visible={showFoodItemForm}
                    onClose={() => setShowFoodItemForm(false)}
                    title="Lisää uusi raaka-aine"
                    maxWidth={650}
                >
                    <FormFoodItem
                        onSubmit={handleNewFoodItem}
                        onClose={() => setShowFoodItemForm(false)}
                        location="meal"
                    />
                </ResponsiveModal>
            )}

            {/* Difficulty Picker Modal */}
            <Modal
                visible={showDifficultyPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDifficultyPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <CustomText style={styles.modalTitle}>
                                Valitse vaikeus
                            </CustomText>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowDifficultyPicker(false)}
                            >
                                <CustomText style={styles.modalCloseText}>
                                    ✕
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {difficultyLevels.map((level) => (
                                <TouchableOpacity
                                    key={level.value}
                                    style={styles.modalOption}
                                    onPress={() => {
                                        handleChange(
                                            'difficultyLevel',
                                            level.value
                                        )
                                        setShowDifficultyPicker(false)
                                    }}
                                >
                                    <CustomText
                                        style={[
                                            styles.modalOptionText,
                                            (editedValues.difficultyLevel ||
                                                'medium') === level.value &&
                                                styles.selectedOptionText,
                                        ]}
                                    >
                                        {level.label}
                                    </CustomText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    detailScroll: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    mealDetails: {
        paddingTop: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    detailLabel: {
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
    detailSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    recipeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    recipeText: {
        lineHeight: 24,
        flex: 1,
        flexWrap: 'wrap',
        wordBreak: 'break-word',
    },
    recipeInput: {
        textAlign: 'left',
        minHeight: 100,
        flex: 1,
        flexWrap: 'wrap',
        wordBreak: 'break-word',
    },
    foodItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    foodItemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    foodItemInput: {
        flex: 1,
        textAlign: 'left',
    },
    foodItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
    },
    mealImageContainer: {
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    mealImage: {
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
    noImageContainer: {
        marginBottom: 20,
        alignItems: 'center',
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
    addButton: {
        padding: 5,
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
    },
    tabsContainer: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#9C86FC',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#9C86FC',
        fontWeight: 'bold',
    },
    recipeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    pickerContainer: {
        flex: 1,
        marginRight: 10,
    },
    picker: {
        width: '100%',
        height: 40,
    },
    pickerButton: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 0,
        minWidth: 300,
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCloseButton: {
        padding: 5,
    },
    modalCloseText: {
        fontSize: 20,
        color: '#666',
    },
    modalBody: {
        maxHeight: 300,
    },
    modalOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#9C86FC',
        fontWeight: 'bold',
    },
    // Meal Type Scroll Picker Styles
    mealTypeScrollPicker: {
        width: 120,
        height: 40,
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        position: 'relative',
    },
    mealTypeScrollIndicatorTop: {
        position: 'absolute',
        top: 2,
        right: 2,
        zIndex: 1,
        padding: 1,
    },
    mealTypeScrollIndicatorBottom: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        zIndex: 1,
        padding: 1,
    },
    mealTypeScrollView: {
        flex: 1,
    },
    mealTypeScrollContent: {
        paddingVertical: 4,
    },
    mealTypeScrollOption: {
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    mealTypeScrollOptionSelected: {
        backgroundColor: '#f0f0f0',
    },
    mealTypeScrollOptionText: {
        fontSize: 14,
        color: '#666',
    },
    mealTypeScrollOptionTextSelected: {
        color: '#000',
        fontWeight: 'bold',
    },
})

export default MealItemDetail
