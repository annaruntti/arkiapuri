import { Feather } from '@expo/vector-icons'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'
import {
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { getDifficultyText, getMealTypeText } from '../utils/mealUtils'
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
    { value: 'dessert', label: 'Jälkiruoka' },
]

const MealItemDetail = ({ meal, visible, onClose, onUpdate }) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [editingFoodItem, setEditingFoodItem] = useState(null)
    const [activeTab, setActiveTab] = useState('ingredients')
    const [showFoodItemForm, setShowFoodItemForm] = useState(false)
    const [showDifficultyPicker, setShowDifficultyPicker] = useState(false)
    const [showMealTypePicker, setShowMealTypePicker] = useState(false)

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
                        <TouchableOpacity
                            style={styles.pickerButton}
                            onPress={() => setShowMealTypePicker(true)}
                        >
                            <CustomText style={styles.pickerButtonText}>
                                {mealTypes.find(
                                    (type) => type.value === currentValue
                                )?.label || 'Valitse ateriatyyppi'}
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

            {/* Meal Type Picker Modal */}
            <Modal
                visible={showMealTypePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMealTypePicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <CustomText style={styles.modalTitle}>
                                Valitse ateriatyyppi
                            </CustomText>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowMealTypePicker(false)}
                            >
                                <CustomText style={styles.modalCloseText}>
                                    ✕
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {mealTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={styles.modalOption}
                                    onPress={() => {
                                        handleChange('mealType', [type.value])
                                        setShowMealTypePicker(false)
                                    }}
                                >
                                    <CustomText
                                        style={[
                                            styles.modalOptionText,
                                            (Array.isArray(
                                                editedValues.mealType
                                            )
                                                ? editedValues.mealType[0]
                                                : editedValues.mealType) ===
                                                type.value &&
                                                styles.selectedOptionText,
                                        ]}
                                    >
                                        {type.label}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
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
})

export default MealItemDetail
