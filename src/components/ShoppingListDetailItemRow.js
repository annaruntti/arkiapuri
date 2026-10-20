import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { formatLinePrice } from '../utils/shoppingListPrice'
import FoodListItemRow from './FoodListItemRow'
import ShoppingListItemQuantityControl from './ShoppingListItemQuantityControl'

const ShoppingListDetailItemRow = ({
    item,
    checked,
    onPress,
    onImagePress,
    onLongPress,
    onToggleChecked,
    onQuantityChange,
    onDelete,
}) => (
    <FoodListItemRow
        variant="card"
        item={item}
        style={styles.listCard}
        bought={Boolean(item.bought)}
        showImageInfoIcon
        detail={formatLinePrice(item)}
        hideQuantityInDetails
        onPress={onPress}
        onImagePress={onImagePress}
        onLongPress={onLongPress}
        trailingAction={
            <View style={styles.itemTrailing}>
                <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={onToggleChecked}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons
                        name={
                            checked
                                ? 'check-box'
                                : 'check-box-outline-blank'
                        }
                        size={22}
                        color="#000000"
                    />
                </TouchableOpacity>
                <ShoppingListItemQuantityControl
                    quantity={item.quantity}
                    unit={item.unit}
                    onChange={onQuantityChange}
                    onDelete={onDelete}
                />
            </View>
        }
    />
)

const styles = StyleSheet.create({
    listCard: {
        backgroundColor: '#ffffff',
    },
    itemTrailing: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    checkboxContainer: {
        marginLeft: 10,
    },
})

export default ShoppingListDetailItemRow
