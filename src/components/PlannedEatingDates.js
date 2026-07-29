import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Button from './Button'
import CustomText from './CustomText'
import FormDateField from './FormDateField'

const PlannedEatingDates = ({ dates = [], onChange }) => {
    const addEatingDate = () => {
        onChange([...dates, new Date()])
    }

    const updateEatingDate = (index, selectedDate) => {
        const updated = [...dates]
        updated[index] = selectedDate
        onChange(updated)
    }

    const removeEatingDate = (index) => {
        onChange(dates.filter((_, i) => i !== index))
    }

    return (
        <View style={styles.eatingDatesContainer}>
            <CustomText style={styles.label}>
                Suunnitellut syöntipäivät
            </CustomText>
            {dates.length === 0 && (
                <CustomText style={styles.emptyDatesText}>
                    Ei lisättyjä syöntipäiviä (käytetään valmistuspäivää)
                </CustomText>
            )}

            {dates.map((date, index) => (
                <View
                    key={`eating-date-${index}`}
                    style={styles.eatingDateFieldRow}
                >
                    <FormDateField
                        value={date}
                        onChange={(selected) =>
                            updateEatingDate(index, selected)
                        }
                        minimumDate={new Date()}
                        style={styles.eatingDateField}
                        testID={`plannedEatingDate-${index}`}
                    />
                    <TouchableOpacity
                        onPress={() => removeEatingDate(index)}
                        style={styles.removeDateButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <MaterialIcons name="close" size={22} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            ))}

            <Button
                title="+ Lisää syöntipäivä"
                onPress={addEatingDate}
                type="TERTIARY"
                size="small"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    eatingDatesContainer: {
        paddingTop: 10,
        paddingBottom: 15,
        marginBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    eatingDateFieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    eatingDateField: {
        flex: 1,
        marginBottom: 10,
    },
    removeDateButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    emptyDatesText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        marginBottom: 10,
    },
})

export default PlannedEatingDates
