import { format } from 'date-fns'
import { useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import ClearFiltersButton from './ClearFiltersButton'
import CustomText from './CustomText'
import PrimaryActionFade from './PrimaryActionFade'
import ToggleButton from './ToggleButton'

const DateSelector = ({
    dates,
    selectedDates,
    onToggleDateSelection,
    onClearSelection,
}) => {
    const [isExpanded, setIsExpanded] = useState(true)

    return (
        <PrimaryActionFade style={styles.dateSelectionContainer}>
            <View style={isExpanded ? styles.headerRowExpanded : undefined}>
                <ToggleButton
                    label={
                        selectedDates.length > 0
                            ? `${selectedDates.length} päivää valittu`
                            : 'Valitse päivät'
                    }
                    expanded={isExpanded}
                    onPress={() => setIsExpanded(!isExpanded)}
                    muted={selectedDates.length === 0}
                />
            </View>

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
                        <ClearFiltersButton
                            onPress={onClearSelection}
                            text="Tyhjennä valinnat"
                        />
                    )}
                </>
            )}
        </PrimaryActionFade>
    )
}

const styles = StyleSheet.create({
    dateSelectionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#F4F0FF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D8CEF8',
        width: '100%',
    },
    headerRowExpanded: {
        marginBottom: 10,
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
        backgroundColor: '#AE9CFC',
        borderColor: '#5844BB',
    },
    dateButtonText: {
        fontSize: 14,
        color: '#333',
    },
    selectedDateButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
})

export default DateSelector
