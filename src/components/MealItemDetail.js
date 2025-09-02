import { Feather } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'
import {
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { getDifficultyText, getMealTypeText } from '../utils/mealUtils'
import Button from './Button'
import CustomModal from './CustomModal'
import CustomText from './CustomText'
import DateTimePicker from './DatePicker.web'
import FoodItemRow from './FoodItemRow'
import FormFoodItem from './FormFoodItem'

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
        console.log('Changing field:', field, 'to value:', value)
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

            console.log(
                'Saving meal with difficulty level:',
                updatedMeal.difficultyLevel
            )
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
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={editedValues[field] || 'MEDIUM'}
                                onValueChange={(itemValue) => {
                                    console.log(
                                        'Selected difficulty level:',
                                        itemValue
                                    )
                                    handleChange(field, itemValue)
                                }}
                                style={styles.picker}
                            >
                                {difficultyLevels.map((level) => (
                                    <Picker.Item
                                        key={level.value}
                                        label={level.label}
                                        value={level.value}
                                    />
                                ))}
                            </Picker>
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
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={currentValue}
                                onValueChange={(itemValue) => {
                                    console.log(
                                        'Changing field:',
                                        field,
                                        'to value:',
                                        itemValue
                                    )
                                    // Store as array to maintain consistency
                                    handleChange(field, [itemValue])
                                }}
                                style={styles.picker}
                            >
                                {mealTypes.map((type) => (
                                    <Picker.Item
                                        key={type.value}
                                        label={type.label}
                                        value={type.value}
                                    />
                                ))}
                            </Picker>
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
            <CustomModal visible={visible} onClose={onClose} title={meal.name}>
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
            </CustomModal>

            {showFoodItemForm && (
                <CustomModal
                    visible={showFoodItemForm}
                    onClose={() => setShowFoodItemForm(false)}
                    title="Lisää uusi raaka-aine"
                >
                    <FormFoodItem
                        onSubmit={handleNewFoodItem}
                        onClose={() => setShowFoodItemForm(false)}
                        location="meal"
                    />
                </CustomModal>
            )}
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
})

export default MealItemDetail
