import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import CustomText from './CustomText'
import ListItem from './ListItem'

const getGradeColor = (grade) => {
    const colors = {
        a: '#00AA00',
        b: '#85BB2F',
        c: '#FFAA00',
        d: '#FF6600',
        e: '#FF0000',
    }
    return colors[grade?.toLowerCase()] || '#ccc'
}

export const FoodSearchLocalRow = ({
    item,
    showNutrition,
    isAdded,
    allowDuplicates,
    onPress,
}) => {
    const categoryText = (() => {
        if (Array.isArray(item.category)) {
            const filtered = item.category.filter(Boolean)
            const joined = filtered.join(', ')
            return String(joined || 'Ei kategoriaa')
        }
        return String('Ei kategoriaa')
    })()

    const calorieText =
        showNutrition && item.calories && item.calories > 0
            ? String(`${item.calories} kcal`)
            : null

    return (
        <ListItem
            variant="row"
            title={String(item.name || 'Nimetön tuote').trim()}
            subtitle={
                calorieText
                    ? `${categoryText} · ${calorieText}`
                    : categoryText
            }
            onPress={!allowDuplicates && isAdded ? undefined : onPress}
            style={[styles.searchItem, isAdded && styles.addedItem]}
            trailing={
                <View style={styles.itemRight}>
                    <CustomText style={styles.sourceLabel}>Oma</CustomText>
                    {isAdded ? (
                        <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#00AA00"
                        />
                    ) : (
                        <Ionicons
                            name="add-circle-outline"
                            size={20}
                            color="#5844BB"
                        />
                    )}
                </View>
            }
        />
    )
}

export const FoodSearchOpenFoodFactsRow = ({
    item,
    showNutrition,
    onPress,
}) => {
    const imageUrl = item.image?.url || item.imageUrl
    const caloriesText =
        showNutrition && item.nutrition?.calories > 0
            ? `${Math.round(item.nutrition.calories || 0)} kcal`
            : null
    const grade = showNutrition ? item.nutritionGrade?.trim() : ''

    return (
        <ListItem
            variant="row"
            image={imageUrl ? { uri: imageUrl } : undefined}
            imageSize={40}
            title={String(item.name || 'Nimetön tuote').trim()}
            subtitle={
                item.brands && item.brands.trim().length > 0
                    ? String(item.brands).trim()
                    : undefined
            }
            details={
                grade || caloriesText ? (
                    <View style={styles.productMeta}>
                        {grade ? (
                            <View
                                style={[
                                    styles.gradeBox,
                                    {
                                        backgroundColor: getGradeColor(
                                            item.nutritionGrade
                                        ),
                                    },
                                ]}
                            >
                                <CustomText style={styles.gradeText}>
                                    {String(item.nutritionGrade)
                                        .trim()
                                        .toUpperCase()}
                                </CustomText>
                            </View>
                        ) : null}
                        {caloriesText ? (
                            <CustomText style={styles.itemCalories}>
                                {caloriesText}
                            </CustomText>
                        ) : null}
                    </View>
                ) : null
            }
            onPress={onPress}
            style={styles.searchItem}
            trailing={
                <View style={styles.itemRight}>
                    <CustomText style={styles.sourceLabelOFF}>OFF</CustomText>
                    <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color="#5844BB"
                    />
                </View>
            }
        />
    )
}

const styles = StyleSheet.create({
    searchItem: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingVertical: 10,
        borderBottomColor: '#f0f0f0',
    },
    addedItem: {
        backgroundColor: '#f0f8f0',
        opacity: 1,
    },
    itemCalories: {
        fontSize: 12,
        color: '#666',
        paddingRight: 10,
    },
    productMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    gradeBox: {
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
    },
    gradeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    itemRight: {
        alignItems: 'center',
        gap: 4,
    },
    sourceLabel: {
        fontSize: 10,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    sourceLabelOFF: {
        fontSize: 10,
        color: '#fff',
        backgroundColor: '#FF6600',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
})
