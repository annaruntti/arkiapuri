import {
    Image,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import GuestWarningBanner from './GuestWarningBanner'
import { getMealRoles } from '../utils/mealFilters'

const PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/3b9imD6TDC4i68V4uHVgL1/1ac1194dccb086bb52ebd674c59983e3/undraw_breakfast_rgx5.png'

const mealTypeTranslations = {
    breakfast: 'Aamiainen',
    lunch: 'Lounas',
    snack: 'Välipala',
    dinner: 'Päivällinen',
    supper: 'Iltapala',
    dessert: 'Jälkiruoka',
    other: 'Muu',
}

// Group meals by their default roles
const groupMealsByCategory = (meals) => {
    const grouped = {}

    meals.forEach((meal) => {
        const roles = getMealRoles(meal)
        roles.forEach((role) => {
            if (!grouped[role]) {
                grouped[role] = []
            }
            grouped[role].push(meal)
        })
    })

    // Sort categories by predefined order
    const categoryOrder = [
        'breakfast',
        'lunch',
        'snack',
        'dinner',
        'supper',
        'dessert',
        'other',
    ]
    const sortedGrouped = {}

    categoryOrder.forEach((category) => {
        if (grouped[category] && grouped[category].length > 0) {
            sortedGrouped[category] = grouped[category]
        }
    })

    return sortedGrouped
}

const MealSelectionList = ({
    availableMeals,
    selectedDates,
    onMealSelect,
    onCreateMeal,
    showAllRoles = false,
}) => {
    if (availableMeals.length === 0) {
        return (
            <View style={styles.noMealsContainer}>
                <GuestWarningBanner />
                <CustomText style={styles.noMealsText}>
                    Ei tallennettuja aterioita
                </CustomText>
                {onCreateMeal ? (
                    <Button
                        title="+ Luo ateria"
                        onPress={onCreateMeal}
                        style={styles.createButton}
                        textStyle={styles.createButtonText}
                    />
                ) : null}
            </View>
        )
    }

    const groupedMeals = groupMealsByCategory(availableMeals)
    const sections = Object.entries(groupedMeals).map(([category, meals]) => ({
        title: mealTypeTranslations[category] || category,
        data: meals,
    }))

    return (
        <SectionList
            sections={sections}
            stickySectionHeadersEnabled={false}
            renderItem={({ item }) => {
                const roles = getMealRoles(item, [])
                const roleLabel =
                    roles.length === 0
                        ? 'Ateria'
                        : showAllRoles
                          ? roles
                                .map(
                                    (role) =>
                                        mealTypeTranslations[role] || role
                                )
                                .join(', ')
                          : mealTypeTranslations[roles[0]] || roles[0]

                return (
                    <TouchableOpacity
                        style={[
                            styles.mealItem,
                            selectedDates.length === 0 &&
                                styles.disabledMealItem,
                        ]}
                        onPress={() =>
                            selectedDates.length > 0
                                ? onMealSelect(item)
                                : null
                        }
                        disabled={selectedDates.length === 0}
                    >
                        <Image
                            source={{
                                uri: item.image?.url || PLACEHOLDER_IMAGE_URL,
                            }}
                            style={styles.mealImage}
                            resizeMode="cover"
                        />
                        <View style={styles.mealTextContainer}>
                            <CustomText style={styles.mealName}>
                                {item.name}
                            </CustomText>
                            <CustomText style={styles.mealType}>
                                {roleLabel}
                            </CustomText>
                        </View>
                    </TouchableOpacity>
                )
            }}
            renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                    <CustomText style={styles.sectionTitle}>{title}</CustomText>
                </View>
            )}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
        />
    )
}

const styles = StyleSheet.create({
    noMealsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 60,
    },
    noMealsText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    createButton: {
        borderRadius: 25,
        paddingVertical: 9,
        paddingHorizontal: 20,
        backgroundColor: '#AE9CFC',
        marginTop: 4,
    },
    createButtonText: {
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    mealItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
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
    disabledMealItem: {
        opacity: 0.5,
    },
    mealImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12,
    },
    mealTextContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    mealName: {
        fontSize: 16,
        fontWeight: '500',
    },
    mealType: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    sectionHeader: {
        backgroundColor: '#F0EBFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#5844BB',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 0.5,
    },
    listContent: {
        padding: 15,
        flexGrow: 1,
    },
})

export default MealSelectionList
export { PLACEHOLDER_IMAGE_URL, groupMealsByCategory, mealTypeTranslations }
