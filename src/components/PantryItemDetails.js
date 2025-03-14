import React, { useState, useEffect } from 'react'
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native'
import CustomText from './CustomText'
import Button from './Button'
import { AntDesign, Feather } from '@expo/vector-icons'
import { MaterialIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import DateTimePicker from '@react-native-community/datetimepicker'
import SectionedMultiSelect from 'react-native-sectioned-multi-select'
import categories from '../data/categories' // Import the categories data

const PantryItemDetails = ({ item, visible, onClose, onUpdate }) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showCategorySelect, setShowCategorySelect] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState([])

    useEffect(() => {
        if (item && item.category) {
            // Convert category names to IDs if needed
            const categoryIds = item.category
                .map((cat) => {
                    if (typeof cat === 'string') {
                        // Find the ID for this category name
                        const findCategoryId = (cats) => {
                            for (const category of cats) {
                                if (category.name === cat) return category.id
                                if (category.children) {
                                    const found = findCategoryId(
                                        category.children
                                    )
                                    if (found) return found
                                }
                            }
                            return null
                        }
                        return findCategoryId(categories)
                    }
                    return cat.id || cat
                })
                .filter(Boolean)

            setSelectedCategories(categoryIds)
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
        console.log('Selected items:', selectedItems)
        setSelectedCategories(selectedItems)

        // Convert IDs back to category names for storage
        const categoryNames = selectedItems
            .map((id) => {
                const findCategoryName = (cats) => {
                    for (const cat of cats) {
                        if (cat.id === id) return cat.name
                        if (cat.children) {
                            const found = findCategoryName(cat.children)
                            if (found) return found
                        }
                    }
                    return null
                }
                return findCategoryName(categories)
            })
            .filter(Boolean)

        console.log('Category names to save:', categoryNames)

        // Update editedValues with the new categories
        setEditedValues((prev) => {
            const newValues = {
                ...prev,
                category: categoryNames,
            }
            console.log('New editedValues:', newValues)
            return newValues
        })
    }

    const handleSave = async () => {
        // Include both edited values and selected categories in the update
        const updatedData = {
            ...item,
            ...editedValues,
        }

        // Check that categories are included and not empty
        if (selectedCategories.length > 0) {
            const categoryNames = selectedCategories
                .map((id) => {
                    const findCategoryName = (cats) => {
                        for (const cat of cats) {
                            if (cat.id === id) return cat.name
                            if (cat.children) {
                                const found = findCategoryName(cat.children)
                                if (found) return found
                            }
                        }
                        return null
                    }
                    return findCategoryName(categories)
                })
                .filter(Boolean)

            updatedData.category = categoryNames
        }

        console.log('Saving updated data:', updatedData)

        try {
            await onUpdate(item._id, updatedData)
            setEditableFields({})
            setEditedValues({})
            setShowCategorySelect(false)
            setSelectedCategories([])
        } catch (error) {
            console.error('Error saving updates:', error)
        }
    }

    const renderEditableField = (field, label, value, type = 'text') => {
        return (
            <View style={styles.detailRow}>
                <CustomText style={styles.label}>{label}:</CustomText>
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

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <AntDesign name="close" size={24} color="black" />
                    </TouchableOpacity>

                    <ScrollView style={styles.detailsContainer}>
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

                        <View>
                            <View style={styles.detailRow}>
                                <CustomText style={styles.label}>
                                    Kategoriat:
                                </CustomText>
                                <View style={styles.valueContainer}>
                                    <TouchableOpacity
                                        style={styles.categoryTouchable}
                                        onPress={() =>
                                            setShowCategorySelect(
                                                !showCategorySelect
                                            )
                                        }
                                    >
                                        <View style={styles.categoryContent}>
                                            <CustomText
                                                style={styles.categoryText}
                                            >
                                                {(
                                                    editedValues.category ||
                                                    item.category ||
                                                    []
                                                ).join(', ') ||
                                                    'Ei kategorioita'}
                                            </CustomText>
                                            <Feather
                                                name="edit-2"
                                                size={18}
                                                color="#666"
                                                style={styles.editIcon}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {showCategorySelect && (
                                <View style={styles.categorySelectContainer}>
                                    <SectionedMultiSelect
                                        styles={{
                                            backdrop:
                                                styles.multiSelectBackdrop,
                                            selectToggle: styles.multiSelectBox,
                                            button: {
                                                borderRadius: 25,
                                                paddingTop: 7,
                                                paddingBottom: 7,
                                                paddingLeft: 10,
                                                paddingRight: 10,
                                                elevation: 2,
                                                backgroundColor: '#9C86FC',
                                                marginTop: 10,
                                            },
                                            confirmText: {
                                                color: 'black',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                fontSize: 16,
                                            },
                                            cancelButton: styles.cancelButton,
                                            cancelButtonText:
                                                styles.cancelButtonText,
                                            modalWrapper: {
                                                padding: 20,
                                                paddingTop: 45,
                                            },
                                            container: {
                                                padding: 15,
                                            },
                                            itemText: {
                                                fontSize: 16,
                                                paddingVertical: 10,
                                                paddingHorizontal: 15,
                                            },
                                            subItemText: {
                                                fontSize: 15,
                                                paddingVertical: 8,
                                                paddingHorizontal: 30,
                                            },
                                            searchBar: {
                                                padding: 15,
                                                marginBottom: 10,
                                            },
                                        }}
                                        items={categories}
                                        IconRenderer={MaterialIcons}
                                        uniqueKey="id"
                                        displayKey="name"
                                        onSelectedItemsChange={
                                            handleCategoryChange
                                        }
                                        selectedItems={selectedCategories}
                                        removeAllText="Poista kaikki"
                                        showCancelButton={true}
                                        showRemoveAll={true}
                                        searchPlaceholderText="Etsi kategoriaa"
                                        confirmText="Tallenna kategoriat"
                                        selectText="Valitse yksi tai useampi kategoria"
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.detailRow}>
                            <CustomText style={styles.label}>
                                Viimeinen käyttöpäivä:
                            </CustomText>
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
                        </View>

                        {showDatePicker && (
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
                                        handleChange(
                                            'expirationDate',
                                            selectedDate
                                        )
                                    }
                                }}
                            />
                        )}

                        {Object.keys(editedValues).length > 0 && (
                            <Button
                                title="Tallenna muutokset"
                                onPress={handleSave}
                                style={styles.saveButton}
                            />
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        right: 20,
        top: 20,
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 10,
    },
    detailsContainer: {
        marginTop: 30,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    label: {
        fontWeight: 'bold',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
    saveButton: {
        marginTop: 20,
        backgroundColor: '#9C86FC',
        borderRadius: 25,
    },
    categorySelector: {
        flex: 1,
        alignItems: 'flex-end',
    },
    multiSelectBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    multiSelectBox: {
        borderWidth: 1,
        borderRadius: 4,
        borderColor: '#bbb',
        padding: 10,
        marginBottom: 8,
    },
    cancelButton: {
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#666',
    },
    categoryTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    categoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryText: {
        flex: 1,
        textAlign: 'right',
        marginRight: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    categoryModalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    chipContainer: {
        backgroundColor: '#9C86FC',
    },
    chipText: {
        color: 'white',
    },
    selectContainer: {
        marginTop: 0,
        paddingTop: 0,
    },
    categorySelectContainer: {
        marginTop: -10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
})

export default PantryItemDetails
