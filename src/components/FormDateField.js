import { useState } from 'react'
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import Fontisto from '@expo/vector-icons/Fontisto'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import { formStyles } from '../styles/formStyles'
import { isDateInPast } from '../utils/mealDates'
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
    warnIfPast = false,
    overdueMessage,
}) => {
    const [show, setShow] = useState(false)
    const [showOverdue, setShowOverdue] = useState(false)
    const dateValue = value ? new Date(value) : new Date()
    const isOverdue = warnIfPast && Boolean(value) && isDateInPast(value)
    const calendarValue = isOverdue ? new Date() : dateValue

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

                <View style={styles.trailingGroup}>
                    {isOverdue ? (
                        <TouchableOpacity
                            onPress={() => setShowOverdue(true)}
                            style={styles.overdueButton}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                            accessibilityLabel="Päivämäärä on mennyt"
                            testID={`${testID}-overdue`}
                        >
                            <MaterialIcons
                                name="error"
                                size={22}
                                color="#e53e3e"
                            />
                        </TouchableOpacity>
                    ) : null}
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
            </View>

            {show && (
                <View style={styles.calendarInline}>
                    <FinnishDateCalendar
                        value={calendarValue}
                        onSelect={handleSelect}
                        onCancel={closePicker}
                        minimumDate={minimumDate}
                        maximumDate={maximumDate}
                    />
                </View>
            )}

            <Modal
                visible={showOverdue}
                transparent
                animationType="fade"
                onRequestClose={() => setShowOverdue(false)}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setShowOverdue(false)}
                >
                    <Pressable
                        style={styles.overdueModal}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <CustomText style={styles.modalTitle}>
                                Päivämäärä on mennyt
                            </CustomText>
                            <TouchableOpacity
                                onPress={() => setShowOverdue(false)}
                                accessibilityLabel="Sulje"
                            >
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                        <CustomText style={styles.modalContent}>
                            {overdueMessage ||
                                'Aterian suunniteltu valmistus/syöntipäivä on mennyt, valitse uusi päivä.'}
                        </CustomText>
                    </Pressable>
                </Pressable>
            </Modal>
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
    trailingGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    overdueButton: {
        width: 32,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    calendarInline: {
        marginTop: 6,
        width: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    overdueModal: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        maxWidth: 350,
        width: '100%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    modalContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
})

export default FormDateField
