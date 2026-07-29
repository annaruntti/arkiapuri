import { useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import Fontisto from '@expo/vector-icons/Fontisto'
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
 * Date field matching form inputs: bordered text field + calendar icon
 * trailing slot. Calendar expands inline in the form (no nested modal).
 */
const FormDateField = ({
    label,
    value,
    onChange,
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
                <TouchableOpacity
                    style={formStyles.inputInRow}
                    onPress={togglePicker}
                    activeOpacity={0.7}
                >
                    <TextInput
                        style={formStyles.dateInput}
                        value={formatDate(dateValue)}
                        editable={false}
                        placeholder="Valitse päivämäärä"
                        placeholderTextColor="#999"
                        pointerEvents="none"
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={togglePicker}
                    style={formStyles.inputTrailing}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
    calendarInline: {
        marginTop: 6,
        width: '100%',
    },
})

export default FormDateField
