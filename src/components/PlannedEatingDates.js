import { MaterialIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import DateTimePicker from './DateTimePicker'

const PlannedEatingDates = ({ dates = [], onChange }) => {
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [editingIndex, setEditingIndex] = useState(null)

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false)
        if (selectedDate) {
            if (editingIndex !== null) {
                // Update existing date
                const updatedDates = [...dates]
                updatedDates[editingIndex] = selectedDate
                onChange(updatedDates)
                setEditingIndex(null)
            } else {
                // Add new date
                onChange([...dates, selectedDate])
            }
        }
    }

    const addEatingDate = () => {
        setEditingIndex(null)
        setShowDatePicker(true)
    }

    const editEatingDate = (index) => {
        setEditingIndex(index)
        setShowDatePicker(true)
    }

    const removeEatingDate = (index) => {
        onChange(dates.filter((_, i) => i !== index))
    }

    return (
        <View style={styles.eatingDatesContainer}>
            <CustomText style={styles.label}>
                Suunnitellut syöntipäivät
            </CustomText>
            <View style={styles.eatingDatesSection}>
                {dates.length > 0 ? (
                    <View style={styles.eatingDatesList}>
                        {dates.map((date, index) => (
                            <View key={index} style={styles.eatingDateItem}>
                                <TouchableOpacity
                                    onPress={() => editEatingDate(index)}
                                    style={styles.eatingDateButton}
                                >
                                    <MaterialIcons
                                        name="event"
                                        size={18}
                                        color="#333"
                                    />
                                    <CustomText style={styles.eatingDateText}>
                                        {format(
                                            new Date(date),
                                            'dd.MM.yyyy',
                                            { locale: fi }
                                        )}
                                    </CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => removeEatingDate(index)}
                                    style={styles.removeDateButton}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={18}
                                        color="#FF6B6B"
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyDatesRow}>
                        <CustomText style={styles.emptyDatesText}>
                            Ei lisättyjä syöntipäiviä (käytetään
                            valmistuspäivää)
                        </CustomText>
                        <Button
                            title="+ Lisää syöntipäivä"
                            onPress={addEatingDate}
                            type="TERTIARY"
                            size="small"
                        />
                    </View>
                )}

                {dates.length > 0 && (
                    <Button
                        title="+ Lisää syöntipäivä"
                        onPress={addEatingDate}
                        type="TERTIARY"
                        size="small"
                    />
                )}

                {showDatePicker && (
                    <View style={styles.datePickerContainer}>
                        <DateTimePicker
                            value={
                                editingIndex !== null && dates[editingIndex]
                                    ? new Date(dates[editingIndex])
                                    : new Date()
                            }
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    eatingDatesContainer: {
        paddingTop: 10,
        marginBottom: 15,
    },
    label: {
        fontWeight: 'bold',
        flex: 1,
    },
    eatingDatesSection: {
        flex: 1,
        marginTop: 8,
    },
    eatingDatesList: {
        marginBottom: 10,
    },
    eatingDateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f8f8',
        padding: 10,
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
        fontSize: 14,
        color: '#333',
    },
    removeDateButton: {
        padding: 4,
    },
    datePickerContainer: {
        marginTop: 5,
        marginLeft: -10,
    },
    emptyDatesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    emptyDatesText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        flex: 1,
        marginRight: 10,
    },
})

export default PlannedEatingDates

