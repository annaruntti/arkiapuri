import React, { useState } from 'react'
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
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import DateTimePicker from '@react-native-community/datetimepicker'

const PantryItemDetails = ({ item, visible, onClose, onUpdate }) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [showDatePicker, setShowDatePicker] = useState(false)

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

    const handleSave = async () => {
        const updatedData = {
            ...item,
            ...editedValues,
        }
        await onUpdate(item._id, updatedData)
        setEditableFields({})
        setEditedValues({})
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

                        <View style={styles.detailRow}>
                            <CustomText style={styles.label}>
                                Kategoriat:
                            </CustomText>
                            <View style={styles.valueContainer}>
                                <CustomText>
                                    {item.category?.length > 0
                                        ? item.category.join(', ')
                                        : 'Ei kategorioita'}
                                </CustomText>
                                <TouchableOpacity
                                    style={styles.editIcon}
                                    onPress={() => toggleEdit('category')}
                                >
                                    <Feather
                                        name="edit-2"
                                        size={18}
                                        color="#666"
                                    />
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
})

export default PantryItemDetails
