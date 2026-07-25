import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'
import { FOOD_PLACEHOLDER_IMAGE_URL } from '../constants/images'
import { getFoodItemImageUrl } from '../utils/openFoodFactsMapper'

const FoodListItemRow = ({
    item,
    onPress,
    onLongPress,
    trailingAction,
    placeholderImageUrl = FOOD_PLACEHOLDER_IMAGE_URL,
    style,
}) => (
    <View style={[styles.itemRow, style]}>
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Image
                source={{
                    uri: getFoodItemImageUrl(item) || placeholderImageUrl,
                }}
                style={styles.itemImage}
                resizeMode="cover"
            />
            <View style={styles.itemContent}>
                <CustomText style={styles.itemName}>{item.name}</CustomText>
                <CustomText style={styles.itemDetails}>
                    {item.quantity} {item.unit}
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
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
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
})

export default FoodListItemRow
