import { StyleSheet, View } from 'react-native'
import { NUTRITION_FIELDS } from '../utils/nutritionFields'
import { formStyles } from '../styles/formStyles'
import CollapsibleFormSection from './CollapsibleFormSection'
import CustomInput from './CustomInput'
import CustomText from './CustomText'

/**
 * Collapsible per-100g nutrition inputs for create/edit food item forms.
 */
const FoodItemNutritionFields = ({
    control,
    expanded,
    onExpandedChange,
    style,
}) => (
    <CollapsibleFormSection
        label="Ravintoarvot (per 100g/100ml)"
        placeholder="Valinnainen"
        expanded={expanded}
        onExpandedChange={onExpandedChange}
        style={[formStyles.fieldGroup, styles.nutritionFieldGroup, style]}
    >
        {NUTRITION_FIELDS.map((field) => (
            <View key={field.name} style={styles.nutritionField}>
                <CustomText style={formStyles.label}>{field.label}</CustomText>
                <View style={formStyles.inputRow}>
                    <CustomInput
                        control={control}
                        name={field.name}
                        placeholder="Valinnainen"
                        variant="form"
                        style={formStyles.inputInRow}
                    />
                    <View style={formStyles.inputTrailing}>
                        <CustomText style={formStyles.inputMetric}>
                            {field.unit}
                        </CustomText>
                    </View>
                </View>
            </View>
        ))}
    </CollapsibleFormSection>
)

const styles = StyleSheet.create({
    nutritionFieldGroup: {
        marginBottom: 8,
    },
    nutritionField: {
        marginBottom: 8,
    },
})

export default FoodItemNutritionFields
