import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import { FOOD_PLACEHOLDER_IMAGE_URL } from '../constants/images'
import { getFoodItemImageUrl } from '../utils/openFoodFactsMapper'

const FoodListItemRow = ({
    item,
    onPress,
    onLongPress,
    onImagePress,
    trailingAction,
    bought = false,
    showImageInfoIcon = false,
    hideQuantityInDetails = false,
    placeholderImageUrl = FOOD_PLACEHOLDER_IMAGE_URL,
    style,
}) => (
    <View style={[styles.itemRow, bought && styles.itemRowBought, style]}>
        <TouchableOpacity
            style={styles.imageWrap}
            onPress={() => {
                if (onImagePress) onImagePress()
                else if (onPress) onPress()
            }}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
            <Image
                source={{
                    uri: getFoodItemImageUrl(item) || placeholderImageUrl,
                }}
                style={[styles.itemImage, bought && styles.itemImageBought]}
                resizeMode="cover"
            />
                {showImageInfoIcon && (
                    <View style={styles.imageInfoBadge}>
                        <MaterialIcons name="info-outline" size={14} color="#000000" />
                    </View>
                )}
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.itemContainer}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
        >
            <View style={styles.itemContent}>
                <CustomText
                    style={[styles.itemName, bought && styles.itemTextBought]}
                >
                    {item.name}
                </CustomText>
                <CustomText
                    style={[
                        styles.itemDetails,
                        bought && styles.itemTextBought,
                    ]}
                >
                    {hideQuantityInDetails
                        ? item.isFood === false
                            ? 'Muu tuote'
                            : ''
                        : `${item.quantity} ${item.unit || ''}`.trim()}
                    {!hideQuantityInDetails && item.isFood === false
                        ? ' · Muu tuote'
                        : ''}
                </CustomText>
            </View>
            {trailingAction}
        </TouchableOpacity>
    </View>
)

const styles = StyleSheet.create({
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        paddingLeft: 16,
    },
    itemRowBought: {
        backgroundColor: '#f7f7f7',
        opacity: 0.75,
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingRight: 16,
        paddingLeft: 0,
    },
    imageWrap: {
        position: 'relative',
        marginRight: 12,
        paddingVertical: 12,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    itemImageBought: {
        opacity: 0.6,
    },
    imageInfoBadge: {
        position: 'absolute',
        right: -2,
        bottom: 10,
        backgroundColor: '#AE9CFC',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
    },
    itemTextBought: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
})

export default FoodListItemRow
