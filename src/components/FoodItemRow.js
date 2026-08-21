import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import ListItem from './ListItem'
import { FOOD_PLACEHOLDER_IMAGE_URL } from '../constants/images'
import { getIngredientQuantity } from '../utils/mealFoodItem'
import { getFoodItemImageUrl } from '../utils/openFoodFactsMapper'
import { formatScaledQuantity } from '../utils/mealServings'

const FoodItemRow = ({
    item,
    index,
    onOpenDetails,
    onRemove,
    details,
    footer,
}) => {
    const amount = `${formatScaledQuantity(getIngredientQuantity(item))}${
        item.unit ? ` ${item.unit}` : ''
    }`

    return (
        <ListItem
            image={{
                uri: getFoodItemImageUrl(item) || FOOD_PLACEHOLDER_IMAGE_URL,
            }}
            onImagePress={onOpenDetails ? () => onOpenDetails(item) : undefined}
            title={
                <View style={styles.titleRow}>
                    <TouchableOpacity
                        style={styles.namePress}
                        onPress={
                            onOpenDetails
                                ? () => onOpenDetails(item)
                                : undefined
                        }
                        disabled={!onOpenDetails}
                        accessibilityRole="button"
                        accessibilityLabel={`Näytä ${item.name || 'raaka-aineen'} tiedot`}
                    >
                        <CustomText style={styles.name} numberOfLines={2}>
                            {item.name}
                        </CustomText>
                        {onOpenDetails ? (
                            <MaterialIcons
                                name="chevron-right"
                                size={18}
                                color="#5844BB"
                            />
                        ) : null}
                    </TouchableOpacity>
                    <CustomText style={styles.amount}>{amount}</CustomText>
                </View>
            }
            details={details}
            onDelete={onRemove ? () => onRemove(index) : undefined}
            deleteAccessibilityLabel={`Poista ${item.name || 'raaka-aine'}`}
            footer={footer}
        />
    )
}

const styles = StyleSheet.create({
    titleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        gap: 8,
        paddingRight: 4,
    },
    namePress: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        maxWidth: '100%',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5844BB',
        textDecorationLine: 'underline',
    },
    amount: {
        fontSize: 16,
        fontWeight: '400',
        color: '#6b7280',
    },
})

export default FoodItemRow
