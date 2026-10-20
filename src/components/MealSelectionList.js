import { StyleSheet, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Button from './Button'
import CustomText from './CustomText'
import GuestWarningBanner from './GuestWarningBanner'
import ListItem from './ListItem'
import CategorySectionHeader from './CategorySectionHeader'
import StickyListLayout from './StickyListLayout'
import {
    MEAL_PLACEHOLDER_IMAGE_URL,
    PLACEHOLDER_IMAGE_URL,
} from '../constants/images'
import { getMealRoles } from '../utils/mealFilters'

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
    onMealDetails,
    onCreateMeal,
    showAllRoles = false,
    header = null,
}) => {
    const groupedMeals = groupMealsByCategory(availableMeals)
    const sections = Object.entries(groupedMeals).map(([category, meals]) => ({
        title: mealTypeTranslations[category] || category,
        data: meals,
    }))

    return (
        <StickyListLayout
            chromeBackgroundColor="#f9fafb"
            style={styles.layout}
            contentContainerStyle={styles.content}
        >
            {header ? <View style={styles.headerBlock}>{header}</View> : null}
            <GuestWarningBanner style={styles.banner} />
            {availableMeals.length === 0 ? (
                <View style={styles.noMealsContainer}>
                    <CustomText style={styles.noMealsText}>
                        Ei tallennettuja aterioita
                    </CustomText>
                    {onCreateMeal ? (
                        <Button
                            title="+ Luo ateria"
                            type="PRIMARY"
                            onPress={onCreateMeal}
                            style={styles.createButton}
                        />
                    ) : null}
                </View>
            ) : (
                sections.map((section) => (
                    <View key={section.title} style={styles.categorySection}>
                        <CategorySectionHeader
                            title={section.title}
                            showCount={false}
                        />
                        {section.data.map((item) => {
                            const roles = getMealRoles(item, [])
                            const roleLabel =
                                roles.length === 0
                                    ? 'Ateria'
                                    : showAllRoles
                                      ? roles
                                            .map(
                                                (role) =>
                                                    mealTypeTranslations[
                                                        role
                                                    ] || role
                                            )
                                            .join(', ')
                                      : mealTypeTranslations[roles[0]] ||
                                        roles[0]

                            return (
                                <ListItem
                                    key={item._id}
                                    image={{
                                        uri:
                                            item.image?.url ||
                                            MEAL_PLACEHOLDER_IMAGE_URL,
                                    }}
                                    imageSize={50}
                                    title={item.name}
                                    subtitle={roleLabel}
                                    onPress={() => onMealSelect(item)}
                                    onImagePress={
                                        onMealDetails
                                            ? () => onMealDetails(item)
                                            : undefined
                                    }
                                    disabled={selectedDates.length === 0}
                                    leadingBadge={
                                        onMealDetails ? (
                                            <View style={styles.imageInfoBadge}>
                                                <MaterialIcons
                                                    name="info-outline"
                                                    size={14}
                                                    color="#000000"
                                                />
                                            </View>
                                        ) : null
                                    }
                                    style={styles.mealItem}
                                />
                            )
                        })}
                    </View>
                ))
            )}
        </StickyListLayout>
    )
}

const styles = StyleSheet.create({
    layout: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 15,
        paddingTop: 4,
        paddingBottom: 24,
    },
    headerBlock: {
        width: '100%',
        marginBottom: 12,
    },
    banner: {
        width: '100%',
        alignSelf: 'stretch',
    },
    categorySection: {
        marginBottom: 8,
    },
    mealItem: {
        backgroundColor: '#ffffff',
    },
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
    noMealsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
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
        minWidth: 160,
    },
})

export default MealSelectionList
export { PLACEHOLDER_IMAGE_URL, groupMealsByCategory, mealTypeTranslations }
