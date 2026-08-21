import {
    SectionList,
    StyleSheet,
    View,
} from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import GuestWarningBanner from './GuestWarningBanner'
import ListItem from './ListItem'
import CategorySectionHeader from './CategorySectionHeader'
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
                    <ListItem
                        image={{
                            uri: item.image?.url || PLACEHOLDER_IMAGE_URL,
                        }}
                        imageSize={50}
                        title={item.name}
                        subtitle={roleLabel}
                        onPress={() => onMealSelect(item)}
                        disabled={selectedDates.length === 0}
                    />
                )
            }}
            renderSectionHeader={({ section: { title } }) => (
                <CategorySectionHeader title={title} showCount={false} />
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
    listContent: {
        padding: 15,
        flexGrow: 1,
    },
})

export default MealSelectionList
export { PLACEHOLDER_IMAGE_URL, groupMealsByCategory, mealTypeTranslations }
