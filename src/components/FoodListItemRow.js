import { StyleSheet, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import ListItem from './ListItem'
import { FOOD_PLACEHOLDER_IMAGE_URL } from '../constants/images'
import { getFoodItemImageUrl } from '../utils/openFoodFactsMapper'

const FoodListItemRow = ({
    item,
    onPress,
    onLongPress,
    onImagePress,
    trailingAction,
    onDelete,
    deleteAccessibilityLabel,
    bought = false,
    showImageInfoIcon = false,
    hideQuantityInDetails = false,
    placeholderImageUrl = FOOD_PLACEHOLDER_IMAGE_URL,
    variant = 'row',
    style,
}) => {
    const quantityText = hideQuantityInDetails
        ? item.isFood === false
            ? 'Muu tuote'
            : ''
        : `${item.quantity} ${item.unit || ''}`.trim()
    const subtitle = hideQuantityInDetails
        ? quantityText
        : `${quantityText}${item.isFood === false ? ' · Muu tuote' : ''}`

    return (
        <ListItem
            variant={variant}
            image={{
                uri: getFoodItemImageUrl(item) || placeholderImageUrl,
            }}
            title={item.name}
            subtitle={subtitle}
            onPress={onPress}
            onLongPress={onLongPress}
            onImagePress={onImagePress}
            trailing={trailingAction}
            onDelete={trailingAction ? undefined : onDelete}
            deleteAccessibilityLabel={deleteAccessibilityLabel}
            muted={bought}
            leadingBadge={
                showImageInfoIcon ? (
                    <View style={styles.imageInfoBadge}>
                        <MaterialIcons
                            name="info-outline"
                            size={14}
                            color="#000000"
                        />
                    </View>
                ) : null
            }
            style={style}
        />
    )
}

const styles = StyleSheet.create({
    imageInfoBadge: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#AE9CFC',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
})

export default FoodListItemRow
