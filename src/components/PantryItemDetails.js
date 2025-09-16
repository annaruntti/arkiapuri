import { Feather } from '@expo/vector-icons'
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
import categories from '../data/categories'
import Button from './Button'
import CategorySelect from './CategorySelect'
import CustomModal from './CustomModal'
import CustomText from './CustomText'
import DateTimePicker from './DateTimePicker'

const PantryItemDetails = ({ item, visible, onClose, onUpdate }) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showCategorySelect, setShowCategorySelect] = useState(false)

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
        <CustomModal
            visible={visible}
            onClose={onClose}
            title="Elintarvikkeen tiedot"
        >
            <View style={styles.modalBody}>
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
                                    handleChange('expirationDate', selectedDate)
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
        </CustomModal>
    )
}

const styles = StyleSheet.create({
    modalBody: {
        flex: 1,
        padding: 15,
    },
    detailsContainer: {
        marginTop: 10,
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
        marginRight: 10,
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
