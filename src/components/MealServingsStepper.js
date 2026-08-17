import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import { formStyles } from '../styles/formStyles'
import { normalizeServings } from '../utils/mealServings'

const MealServingsStepper = ({
    value,
    onChange,
    style,
    compact = false,
}) => {
    const servings = normalizeServings(value)
    const buttonSize = compact ? 32 : 40
    const iconSize = compact ? 18 : 22

    const setServings = (next) => {
        onChange?.(normalizeServings(next))
    }

    return (
        <View style={[formStyles.fieldGroup, styles.field, style]}>
            <View style={styles.stepperRow}>
                <TouchableOpacity
                    onPress={() => setServings(servings - 1)}
                    disabled={servings <= 1}
                    style={[
                        styles.stepButton,
                        { width: buttonSize, height: buttonSize },
                        servings <= 1 && styles.stepButtonDisabled,
                    ]}
                    activeOpacity={0.7}
                    accessibilityLabel="Vähennä annosmäärää"
                >
                    <MaterialIcons
                        name="remove"
                        size={iconSize}
                        color={servings <= 1 ? '#bbb' : '#333'}
                    />
                </TouchableOpacity>
                <CustomText
                    style={[
                        styles.valueText,
                        compact && styles.valueTextCompact,
                    ]}
                >
                    {servings === 1 ? '1 annos' : `${servings} annosta`}
                </CustomText>
                <TouchableOpacity
                    onPress={() => setServings(servings + 1)}
                    style={[
                        styles.stepButton,
                        { width: buttonSize, height: buttonSize },
                    ]}
                    activeOpacity={0.7}
                    accessibilityLabel="Lisää annosmäärää"
                >
                    <MaterialIcons name="add" size={iconSize} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    field: {
        alignItems: 'center',
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    stepButton: {
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#bbb',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepButtonDisabled: {
        backgroundColor: '#f5f5f5',
    },
    valueText: {
        fontSize: 16,
        color: '#333',
        fontFamily: 'FiraSans-Regular',
        minWidth: 88,
        textAlign: 'center',
    },
    valueTextCompact: {
        fontSize: 14,
        minWidth: 80,
    },
})

export default MealServingsStepper
