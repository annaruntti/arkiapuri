import React from 'react'
import {
    Image,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import CustomText from './CustomText'

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
        const roles = meal.defaultRoles || ['other']
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
    showAllRoles = false, // If true, shows all roles; if false, shows only first role
}) => {
    if (availableMeals.length === 0) {
        return (
            <View style={styles.noMealsContainer}>
                <CustomText style={styles.noMealsText}>
                    Ei vapaita aterioita
                </CustomText>
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
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[
                        styles.mealItem,
                        selectedDates.length === 0 && styles.disabledMealItem,
                    ]}
                    onPress={() =>
                        selectedDates.length > 0 ? onMealSelect(item) : null
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
                            {showAllRoles
                                ? item.defaultRoles
                                      ?.map(
                                          (role) =>
                                              mealTypeTranslations[role] || role
                                      )
                                      .join(', ')
                                : item.defaultRoles?.[0]
                                  ? mealTypeTranslations[
                                        item.defaultRoles[0]
                                    ] || item.defaultRoles[0]
                                  : 'Ateria'}
                        </CustomText>
                    </View>
                </TouchableOpacity>
            )}
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
        borderLeftColor: '#9C86FC',
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
