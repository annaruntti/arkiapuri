import { MaterialIcons } from '@expo/vector-icons'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'
import { getDifficultyText, getMealCategoryText } from '../utils/mealUtils'

const PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/3b9imD6TDC4i68V4uHVgL1/1ac1194dccb086bb52ebd674c59983e3/undraw_breakfast_rgx5.png'

const MealItem = ({ item, onPress, onDelete }) => {
    return (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                style={styles.itemInfo}
                onPress={() => onPress(item)}
            >
                <Image
                    source={{
                        uri: item.image?.url || PLACEHOLDER_IMAGE_URL,
                    }}
                    style={styles.mealImage}
                    resizeMode="cover"
                />
                <View style={styles.mealTextContainer}>
                    <CustomText style={styles.itemName}>{item.name}</CustomText>
                    <CustomText style={styles.itemDetails}>
                        {getMealCategoryText(item.mealCategory)} •{' '}
                        {getDifficultyText(item.difficultyLevel)} •{' '}
                        {item.cookingTime} min
                    </CustomText>
                </View>
            </TouchableOpacity>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(item._id)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="delete" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemInfo: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 10,
        alignItems: 'center',
    },
    mealImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    mealTextContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemDetails: {
        color: '#666',
        fontSize: 14,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#e0e0e0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
})

export default MealItem
