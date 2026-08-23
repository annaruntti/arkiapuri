import { StyleSheet, View } from 'react-native'
import {
    eatingDateMinimum,
    OVERDUE_EATING_MESSAGE,
} from '../utils/mealDates'
import { formStyles } from '../styles/formStyles'
import CustomText from './CustomText'
import FormDateField from './FormDateField'

const PlannedEatingDates = ({
    dates = [],
    onChange,
    cookingDate,
    label = 'Suunnitellut syöntipäivät',
    labelRight,
    style,
}) => {
    const minimumDate = eatingDateMinimum(cookingDate)

    const addEatingDate = (selectedDate) => {
        onChange([...dates, selectedDate || cookingDate || new Date()])
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
        <View style={[styles.eatingDatesContainer, style]}>
            {label ? (
                <CustomText style={formStyles.label}>{label}</CustomText>
            ) : null}

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

            <FormDateField
                value={null}
                placeholder="Lisää syöntipäivä"
                onChange={addEatingDate}
                minimumDate={minimumDate}
                labelRight={labelRight}
                testID="addEatingDate"
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
    eatingDateField: {
        marginBottom: 10,
    },
})

export default PlannedEatingDates
