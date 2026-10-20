import { StyleSheet, TouchableOpacity, View } from 'react-native'

import CustomRadioButton from './CustomRadioButton'
import CustomText from './CustomText'
import { formStyles } from '../styles/formStyles'

/**
 * Food vs non-food toggle for the food-item form.
 */
const FormFoodItemIsFoodToggle = ({ showFoodFields, onSelectFood }) => (
    <View style={formStyles.fieldGroup}>
        <CustomText style={styles.isFoodQuestion}>
            Onko kyseessä elintarvike?
        </CustomText>
        <View style={styles.isFoodRow}>
            <TouchableOpacity
                style={styles.isFoodOption}
                onPress={() => onSelectFood(true)}
                activeOpacity={0.7}
            >
                <CustomRadioButton
                    status={showFoodFields ? 'checked' : 'unchecked'}
                    onPress={() => onSelectFood(true)}
                    color="#5844BB"
                />
                <CustomText style={styles.isFoodOptionText}>
                    Elintarvike
                </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.isFoodOption}
                onPress={() => onSelectFood(false)}
                activeOpacity={0.7}
            >
                <CustomRadioButton
                    status={!showFoodFields ? 'checked' : 'unchecked'}
                    onPress={() => onSelectFood(false)}
                    color="#5844BB"
                />
                <CustomText style={styles.isFoodOptionText}>
                    Muu tuote
                </CustomText>
            </TouchableOpacity>
        </View>
    </View>
)

const styles = StyleSheet.create({
    isFoodQuestion: {
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
        fontWeight: '500',
    },
    isFoodRow: {
        flexDirection: 'row',
        gap: 16,
        flexWrap: 'wrap',
    },
    isFoodOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
        paddingRight: 8,
    },
    isFoodOptionText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
})

export default FormFoodItemIsFoodToggle
