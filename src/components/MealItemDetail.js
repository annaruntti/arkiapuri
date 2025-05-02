import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native'
import CustomText from './CustomText'
import {
    getDifficultyText,
    getMealTypeText,
    formatDate,
} from '../utils/mealUtils'
import CustomModal from './CustomModal'
import Button from './Button'
import { Feather } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import FormFoodItem from './FormFoodItem'

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
        setEditableFields((prev) => ({
            ...prev,
            [field]: !prev[field],
        }))
        if (!editedValues[field]) {
            setEditedValues((prev) => ({
                ...prev,
                [field]: meal[field],
            }))
        }
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
                difficultyLevel: parseInt(editedValues.difficultyLevel) || 0,
                defaultRoles: parseInt(editedValues.defaultRoles) || 0,
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
        return (
            <View style={styles.detailRow}>
                <CustomText style={styles.detailLabel}>{label}:</CustomText>
                <View style={styles.valueContainer}>
                    {editableFields[field] ? (
                        <TextInput
                            style={styles.input}
                            value={String(editedValues[field] || value)}
                            onChangeText={(text) => handleChange(field, text)}
                            keyboardType={
                                type === 'number' ? 'numeric' : 'default'
                            }
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

    const renderFoodItem = (item, index) => (
        <View key={index} style={styles.foodItemRow}>
            <View style={styles.foodItemContent}>
                {editingFoodItem === index ? (
                    <>
                        <TextInput
                            style={[styles.input, styles.foodItemInput]}
                            value={item.name}
                            onChangeText={(text) =>
                                handleFoodItemChange(index, 'name', text)
                            }
                            placeholder="Raaka-aineen nimi"
                        />
                        <TextInput
                            style={[styles.input, styles.foodItemInput]}
                            value={item.quantity}
                            onChangeText={(text) =>
                                handleFoodItemChange(index, 'quantity', text)
                            }
                            placeholder="Määrä"
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={[styles.input, styles.foodItemInput]}
                            value={item.unit}
                            onChangeText={(text) =>
                                handleFoodItemChange(index, 'unit', text)
                            }
                            placeholder="Yksikkö"
                        />
                    </>
                ) : (
                    <CustomText>
                        {item.name} - {item.quantities?.meal || 0} {item.unit}
                    </CustomText>
                )}
            </View>
            <View style={styles.foodItemActions}>
                <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() =>
                        setEditingFoodItem(
                            editingFoodItem === index ? null : index
                        )
                    }
                >
                    <Feather
                        name={editingFoodItem === index ? 'check' : 'edit-2'}
                        size={18}
                        color="#666"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() => handleRemoveFoodItem(index)}
                >
                    <Feather name="trash-2" size={18} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    )

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
                    {editedValues.foodItems?.map((item, index) =>
                        renderFoodItem(item, index)
                    )}
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
                        <CustomText
                            style={styles.recipeText}
                            numberOfLines={10}
                            ellipsizeMode="tail"
                        >
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
})

export default MealItemDetail
