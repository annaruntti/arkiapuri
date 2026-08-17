import { StyleSheet, View } from 'react-native'
import {
    eatingDateMinimum,
    OVERDUE_EATING_MESSAGE,
} from '../utils/mealDates'
import Button from './Button'
import CustomText from './CustomText'
import FormDateField from './FormDateField'

const PlannedEatingDates = ({ dates = [], onChange, cookingDate }) => {
    const minimumDate = eatingDateMinimum(cookingDate)

    const addEatingDate = () => {
        onChange([...dates, cookingDate || new Date()])
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
                <FormDateField
                    key={`eating-date-${index}`}
                    value={date}
                    onChange={(selected) => updateEatingDate(index, selected)}
                    onRemove={() => removeEatingDate(index)}
                    minimumDate={minimumDate}
                    warnIfPast
                    overdueMessage={OVERDUE_EATING_MESSAGE}
                    style={styles.eatingDateField}
                    testID={`plannedEatingDate-${index}`}
                />
            ))}

            <View style={styles.addButtonWrap}>
                <Button
                    title="+ Lisää syöntipäivä"
                    onPress={addEatingDate}
                    type="TERTIARY"
                    size="small"
                    style={styles.addButton}
                />
            </View>
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
    eatingDateField: {
        marginBottom: 10,
    },
    emptyDatesText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
        marginBottom: 10,
    },
    addButtonWrap: {
        alignItems: 'flex-start',
    },
    addButton: {
        alignSelf: 'flex-start',
        width: 'auto',
    },
})

export default PlannedEatingDates
