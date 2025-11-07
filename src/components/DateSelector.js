import { MaterialIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import React, { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'

const DateSelector = ({
    dates,
    selectedDates,
    onToggleDateSelection,
    onClearSelection,
}) => {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <View style={styles.dateSelectionContainer}>
            <TouchableOpacity
                style={[
                    styles.headerRow,
                    isExpanded && styles.headerRowExpanded,
                ]}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <CustomText style={styles.dateSelectionTitle}>
                    Valitse päivät ({selectedDates.length} valittu)
                </CustomText>
                <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={24}
                    color="#333"
                />
            </TouchableOpacity>

            {isExpanded && (
                <>
                    <View style={styles.dateGrid}>
                        {dates.map((date) => {
                            const isSelected = selectedDates.some(
                                (d) => d.getTime() === date.getTime()
                            )
                            return (
                                <TouchableOpacity
                                    key={date.toISOString()}
                                    style={[
                                        styles.dateButton,
                                        isSelected && styles.selectedDateButton,
                                    ]}
                                    onPress={() => onToggleDateSelection(date)}
                                >
                                    <CustomText
                                        style={[
                                            styles.dateButtonText,
                                            isSelected &&
                                                styles.selectedDateButtonText,
                                        ]}
                                    >
                                        {format(date, 'd.M')}
                                    </CustomText>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    {selectedDates.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearDatesButton}
                            onPress={onClearSelection}
                        >
                            <CustomText style={styles.clearDatesButtonText}>
                                Tyhjennä valinnat
                            </CustomText>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    dateSelectionContainer: {
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerRowExpanded: {
        marginBottom: 10,
    },
    dateSelectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    dateGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    dateButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    selectedDateButton: {
        backgroundColor: '#9C86FC',
        borderColor: '#9C86FC',
    },
    dateButtonText: {
        fontSize: 14,
        color: '#333',
    },
    selectedDateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    clearDatesButton: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    clearDatesButtonText: {
        fontSize: 12,
        color: '#9C86FC',
        textDecorationLine: 'underline',
    },
})

export default DateSelector
