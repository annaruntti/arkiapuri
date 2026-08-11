import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Fontisto from '@expo/vector-icons/Fontisto'
import { Feather } from '@expo/vector-icons'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import { formStyles } from '../styles/formStyles'
import CustomText from './CustomText'
import FinnishDateCalendar from './FinnishDateCalendar'

const formatDate = (date) => {
    try {
        return format(new Date(date), 'dd.MM.yyyy', { locale: fi })
    } catch {
        return new Date(date).toLocaleDateString('fi-FI')
    }
}

/**
 * Date field matching form inputs: bordered text field (+ optional remove
 * inside), calendar icon in the trailing slot outside the border.
 */
const FormDateField = ({
    label,
    value,
    onChange,
    onRemove,
    minimumDate,
    maximumDate,
    labelRight,
    style,
    testID = 'dateTimePicker',
}) => {
    const [show, setShow] = useState(false)
    const dateValue = value ? new Date(value) : new Date()

    const togglePicker = () => setShow((open) => !open)
    const closePicker = () => setShow(false)

    const handleSelect = (selectedDate) => {
        closePicker()
        if (selectedDate) {
            onChange?.(selectedDate)
        }
    }

    return (
        <View
            style={[
                formStyles.fieldGroup,
                show && styles.fieldElevated,
                style,
            ]}
            testID={testID}
        >
            {(label || labelRight) && (
                <View style={styles.labelRow}>
                    {label ? (
                        <CustomText style={formStyles.label}>{label}</CustomText>
                    ) : null}
                    {labelRight}
                </View>
            )}

            <View style={formStyles.inputRow}>
                <View style={[formStyles.inputInRow, styles.fieldBox]}>
                    <TouchableOpacity
                        style={styles.datePressable}
                        onPress={togglePicker}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.dateText}>
                            {formatDate(dateValue)}
                        </Text>
                    </TouchableOpacity>

                    {onRemove ? (
                        <TouchableOpacity
                            onPress={onRemove}
                            style={styles.removeButton}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            accessibilityLabel="Poista päivämäärä"
                        >
                            <Feather name="trash-2" size={18} color="#666" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <TouchableOpacity
                    onPress={togglePicker}
                    style={formStyles.inputTrailing}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Avaa kalenteri"
                >
                    <Fontisto name="date" size={22} color="#666" />
                </TouchableOpacity>
            </View>

            {show && (
                <View style={styles.calendarInline}>
                    <FinnishDateCalendar
                        value={dateValue}
                        onSelect={handleSelect}
                        onCancel={closePicker}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    fieldElevated: {
        zIndex: 20,
        elevation: 20,
    },
    fieldBox: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 40,
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        paddingLeft: 10,
        paddingRight: 4,
    },
    datePressable: {
        flex: 1,
        justifyContent: 'center',
        minHeight: 38,
        paddingVertical: 8,
    },
    dateText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'FiraSans-Regular',
    },
    removeButton: {
        width: 36,
        height: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarInline: {
        marginTop: 6,
        width: '100%',
    },
})

export default FormDateField
