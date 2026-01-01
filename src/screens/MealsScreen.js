import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import CategorySectionHeader from '../components/CategorySectionHeader'
import CustomText from '../components/CustomText'
import AddMealForm from '../components/FormAddMeal'
import GenericFilter from '../components/GenericFilter'
import GenericFilterSection from '../components/GenericFilterSection'
import MealItemDetail from '../components/MealItemDetail'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import SearchSection from '../components/SearchSection'
import categoriesData from '../data/categories.json'
import { getServerUrl } from '../utils/getServerUrl'
import {
    getDifficultyText,
    getMealCategoryText,
    getMealRoleText,
} from '../utils/mealUtils'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

const PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/3b9imD6TDC4i68V4uHVgL1/1ac1194dccb086bb52ebd674c59983e3/undraw_breakfast_rgx5.png'

const MealsScreen = ({ route, navigation }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [selectedDietFilters, setSelectedDietFilters] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficultyFilter, setSelectedDifficultyFilter] =
        useState(null)
    const [selectedCookingTimeFilter, setSelectedCookingTimeFilter] =
        useState(null)
    const { isDesktop } = useResponsiveDimensions()

    // Get filter params from navigation - only use if they have actual values
    const filterDifficulty =
        route?.params?.filterDifficulty &&
        route.params.filterDifficulty !== null &&
        route.params.filterDifficulty !== undefined
            ? route.params.filterDifficulty
            : undefined
    const filterMaxCookingTime =
        route?.params?.filterMaxCookingTime &&
        route.params.filterMaxCookingTime !== null &&
        route.params.filterMaxCookingTime !== undefined
            ? route.params.filterMaxCookingTime
            : undefined
    const filterMealType =
        route?.params?.filterMealType &&
        route.params.filterMealType !== null &&
        route.params.filterMealType !== undefined
            ? route.params.filterMealType
            : undefined

    // Clear navigation filters
    const clearNavigationFilters = () => {
        navigation.setParams({
            filterDifficulty: undefined,
            filterMaxCookingTime: undefined,
            filterMealType: undefined,
        })
        setSelectedDifficultyFilter(null)
        setSelectedCookingTimeFilter(null)
    }

    // Get diet categories from categories.json
    const dietCategories =
        categoriesData.find((cat) => cat.id === 'diets')?.children || []

    // Create a mapping of category names to IDs and vice versa
    const categoryNameToId = {}
    const categoryIdToName = {}
    dietCategories.forEach((cat) => {
        categoryNameToId[cat.name] = String(cat.id)
        categoryIdToName[String(cat.id)] = cat.name
    })

    // Determine which dietary categories a meal qualifies for
    // A meal qualifies if ALL its food items have that category
    const getMealDietaryCategories = (meal) => {
        if (!meal.foodItems || meal.foodItems.length === 0) {
            return []
        }

        const qualifiedCategories = []

        dietCategories.forEach((dietCategory) => {
            const categoryId = String(dietCategory.id)
            const categoryName = dietCategory.name

            // Check if ALL food items have this dietary category
            const allItemsHaveCategory = meal.foodItems.every((foodItem) => {
                // Check if foodItem is just an ID (not populated)
                if (typeof foodItem === 'string' || !foodItem.category) {
                    return false
                }

                const itemCategories = foodItem.category || []
                // Check if the category exists as either ID or name
                const hasCategory = itemCategories.some((cat) => {
                    const catStr = String(cat).trim()
                    // Compare both as ID and as name
                    return catStr === categoryId || catStr === categoryName
                })
                return hasCategory
            })

            if (allItemsHaveCategory) {
                qualifiedCategories.push(categoryId)
            }
        })

        return qualifiedCategories
    }

    // Filter meals by search query
    const filterMealsBySearch = (meals) => {
        if (!searchQuery.trim()) {
            return meals
        }

        return meals.filter((meal) =>
            meal.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
    }

    // Filter meals based on selected dietary filters
    const filterMealsByDiet = (meals) => {
        if (selectedDietFilters.length === 0) {
            return meals
        }

        return meals.filter((meal) => {
            const mealCategories = getMealDietaryCategories(meal)

            // Meal must have ALL selected diet filters
            return selectedDietFilters.every((filterId) =>
                mealCategories.includes(filterId)
            )
        })
    }

    // Filter meals by difficulty level
    const filterMealsByDifficulty = (meals) => {
        const difficulty = selectedDifficultyFilter || filterDifficulty
        if (!difficulty) {
            return meals
        }

        return meals.filter((meal) => {
            const mealDifficulty = meal.difficultyLevel
                ? String(meal.difficultyLevel).toLowerCase()
                : 'medium'
            return mealDifficulty === difficulty.toLowerCase()
        })
    }

    // Filter meals by cooking time
    const filterMealsByCookingTime = (meals) => {
        const maxTime = selectedCookingTimeFilter || filterMaxCookingTime
        if (!maxTime) {
            return meals
        }

        return meals.filter((meal) => {
            const cookingTime = parseInt(meal.cookingTime) || 0
            return cookingTime > 0 && cookingTime <= maxTime
        })
    }

    // Filter meals by meal type (defaultRoles)
    const filterMealsByType = (meals) => {
        if (!filterMealType) {
            return meals
        }

        return meals.filter((meal) => {
            const roles = meal.defaultRoles || []
            return roles.includes(filterMealType)
        })
    }

    const toggleDietFilter = (categoryId) => {
        setSelectedDietFilters((prev) => {
            // Normalize to string for consistent comparison
            const normalizedId = String(categoryId)

            // Check if already selected (normalize for comparison)
            const isSelected = prev.some((id) => String(id) === normalizedId)

            if (isSelected) {
                return prev.filter((id) => String(id) !== normalizedId)
            } else {
                return [...prev, normalizedId]
            }
        })
    }

    const getMealCountsForCategories = () => {
        const counts = {}
        const searchedMeals = filterMealsBySearch(meals)

        dietCategories.forEach((category) => {
            counts[category.id] = searchedMeals.filter((meal) => {
                const mealCategories = getMealDietaryCategories(meal)
                return mealCategories.includes(String(category.id))
            }).length
        })

        return counts
    }

    // Get meal counts by difficulty level
    const getMealCountByDifficulty = (difficulty) => {
        const searchedMeals = filterMealsBySearch(meals)
        return searchedMeals.filter((meal) => {
            const mealDifficulty = meal.difficultyLevel
                ? String(meal.difficultyLevel).toLowerCase()
                : 'medium'
            return mealDifficulty === difficulty.toLowerCase()
        }).length
    }

    // Get meal counts by cooking time
    const getMealCountByCookingTime = (maxTime) => {
        const searchedMeals = filterMealsBySearch(meals)
        return searchedMeals.filter((meal) => {
            const cookingTime = parseInt(meal.cookingTime) || 0
            return cookingTime > 0 && cookingTime <= maxTime
        }).length
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

    const fetchMeals = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success) {
                setMeals(response.data.meals)
            }
        } catch (error) {
            console.error('Error fetching meals:', error)
            Alert.alert('Virhe', 'Aterioiden haku epäonnistui')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeals()
    }, [])

    const handleAddMeal = async (newMeal) => {
        try {
            // Add the new meal to the existing meals array
            setMeals((prevMeals) => [...prevMeals, newMeal])
            setModalVisible(false)
        } catch (error) {
            console.error('Error updating meals list:', error)
            Alert.alert('Virhe', 'Aterian lisääminen listaan epäonnistui')
        }
    }

    const handleDeleteMeal = async (mealId) => {
        const token = await storage.getItem('userToken')

        if (Platform.OS === 'web') {
            // For web, skipping the Alert and directly make the API call
            try {
                setLoading(true)
                const response = await axios.delete(
                    getServerUrl(`/meals/${mealId}`),
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                if (response.data.success) {
                    setMeals((prevMeals) =>
                        prevMeals.filter((meal) => meal._id !== mealId)
                    )
                    alert('Ateria poistettu') // window.alert for web
                } else {
                    alert('Aterian poistaminen epäonnistui')
                }
            } catch (error) {
                console.error('Error in delete API call:', error)
                alert(
                    'Aterian poistaminen epäonnistui: ' +
                        (error.response?.data?.message || error.message)
                )
            } finally {
                setLoading(false)
            }
        } else {
            // For mobile, Alert.alert
            Alert.alert(
                'Poista ateria',
                'Haluatko varmasti poistaa tämän aterian?',
                [
                    {
                        text: 'Peruuta',
                        style: 'cancel',
                    },
                    {
                        text: 'Poista',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                setLoading(true)
                                const response = await axios.delete(
                                    getServerUrl(`/meals/${mealId}`),
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                )
                                if (response.data.success) {
                                    setMeals((prevMeals) =>
                                        prevMeals.filter(
                                            (meal) => meal._id !== mealId
                                        )
                                    )
                                    Alert.alert('Onnistui', 'Ateria poistettu')
                                } else {
                                    Alert.alert(
                                        'Virhe',
                                        'Aterian poistaminen epäonnistui'
                                    )
                                }
                            } catch (error) {
                                console.error(
                                    'Error in delete API call:',
                                    error
                                )
                                Alert.alert(
                                    'Virhe',
                                    'Aterian poistaminen epäonnistui: ' +
                                        (error.response?.data?.message ||
                                            error.message)
                                )
                            } finally {
                                setLoading(false)
                            }
                        },
                    },
                ]
            )
        }
    }

    const handleCloseDetail = () => {
        setDetailModalVisible(false)
        setSelectedMeal(null)
    }

    const handleUpdateMeal = async (mealId, updatedMeal) => {
        try {
            const token = await storage.getItem('userToken')

            // First, handle each food item
            const processedFoodItems = await Promise.all(
                updatedMeal.foodItems.map(async (item) => {
                    // Process category data properly
                    let categoryArray = item.category
                    if (typeof item.category === 'string') {
                        try {
                            categoryArray = JSON.parse(item.category)
                        } catch (e) {
                            categoryArray = []
                        }
                    }

                    // Ensure we have an array and extract category names
                    const categoryIds = Array.isArray(categoryArray)
                        ? categoryArray
                              .map((cat) => {
                                  if (typeof cat === 'object' && cat !== null) {
                                      return cat.name || cat.id || String(cat)
                                  }
                                  return String(cat)
                              })
                              .filter((cat) => cat && cat.trim() !== '')
                        : []

                    // Clean the food item data
                    const cleanedItem = {
                        name: item.name,
                        quantity: parseFloat(item.quantity) || 0,
                        unit: item.unit || 'kpl',
                        calories: parseInt(item.calories) || 0,
                        price: parseFloat(item.price) || 0,
                        expirationDate: item.expirationDate,
                        category: categoryIds,
                        locations: Array.isArray(item.locations)
                            ? item.locations
                            : ['meal'],
                        quantities: {
                            meal: parseFloat(item.quantities?.meal) || 0,
                            'shopping-list':
                                parseFloat(
                                    item.quantities?.['shopping-list']
                                ) || 0,
                            pantry: parseFloat(item.quantities?.pantry) || 0,
                        },
                    }

                    // If the item has an _id, it's an existing food item
                    if (item._id) {
                        // Update existing food item
                        const response = await axios.put(
                            getServerUrl(`/food-items/${item._id}`),
                            cleanedItem,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        )
                        return response.data.foodItem
                    } else {
                        // Create new food item
                        const response = await axios.post(
                            getServerUrl('/food-items'),
                            cleanedItem,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        )
                        return response.data.foodItem
                    }
                })
            )

            // Now update the meal with only the necessary fields
            const cleanedMeal = {
                name: updatedMeal.name,
                cookingTime: parseInt(updatedMeal.cookingTime) || 0,
                difficultyLevel:
                    updatedMeal.difficultyLevel?.toString() || 'easy',
                defaultRoles: Array.isArray(updatedMeal.defaultRoles)
                    ? updatedMeal.defaultRoles
                    : [updatedMeal.defaultRoles?.toString() || 'dinner'],
                mealCategory: updatedMeal.mealCategory || 'other',
                plannedCookingDate: updatedMeal.plannedCookingDate,
                plannedEatingDates: updatedMeal.plannedEatingDates || [],
                recipe: updatedMeal.recipe || '',
                foodItems: processedFoodItems.map((item) => item._id), // Only send the IDs
            }

            const response = await axios.put(
                getServerUrl(`/meals/${mealId}`),
                cleanedMeal,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (response.data.success) {
                setMeals((prevMeals) =>
                    prevMeals.map((meal) =>
                        meal._id === mealId ? response.data.meal : meal
                    )
                )
                setDetailModalVisible(false)
            } else {
                console.error('Failed to update meal:', response.data.message)
            }
        } catch (error) {
            console.error('Error updating meal:', error)
            if (error.response?.status === 404) {
                console.error(
                    'Meal not found or unauthorized. Meal ID:',
                    mealId
                )
            }
        }
    }

    const DeleteButton = ({ onPress }) => (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={onPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <MaterialIcons name="delete" size={20} color="#666" />
        </TouchableOpacity>
    )

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                style={styles.itemInfo}
                onPress={() => handleMealPress(item)}
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
                <DeleteButton
                    onPress={() => {
                        handleDeleteMeal(item._id)
                    }}
                />
            </View>
        </View>
    )

    const renderCategorySection = (category, mealsInCategory) => (
        <View key={category} style={styles.categorySection}>
            <CategorySectionHeader
                title={getMealRoleText(category)}
                count={mealsInCategory.length}
            />
            {mealsInCategory.map((meal, index) => (
                <View key={meal._id}>{renderItem({ item: meal })}</View>
            ))}
        </View>
    )

    const handleMealPress = (meal) => {
        setSelectedMeal(meal)
        setDetailModalVisible(true)
    }

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <CustomText
                style={[styles.introText, isDesktop && styles.desktopIntroText]}
            >
                Selaa ja hallinnoi aterioitasi. Voit lisätä uusia aterioita ja
                muokata olemassa olevia.
            </CustomText>
        </View>
    )

    const content = (
        <View style={styles.container}>
            <ResponsiveModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Lisää uusi ateria"
                maxWidth={700}
            >
                <AddMealForm
                    onSubmit={handleAddMeal}
                    onClose={() => setModalVisible(false)}
                />
            </ResponsiveModal>

            {renderHeader()}

            <SearchSection
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearSearch={() => setSearchQuery('')}
                placeholder="Hae aterioita nimellä..."
                resultsCount={
                    filterMealsByCookingTime(
                        filterMealsByDifficulty(
                            filterMealsByType(
                                filterMealsByDiet(filterMealsBySearch(meals))
                            )
                        )
                    ).length
                }
                resultsText="Löytyi {count} ateriaa"
                noResultsText="Aterioita ei löytynyt"
                showButtonSection={true}
                buttonTitle="+ Lisää ateria"
                onButtonPress={() => setModalVisible(true)}
                buttonStyle={styles.primaryButton}
                buttonTextStyle={styles.buttonText}
                filterComponent={
                    <GenericFilter
                        selectedFilters={selectedDietFilters}
                        showFilters={showFilters}
                        onToggleShowFilters={() => setShowFilters(!showFilters)}
                        buttonText="Suodata"
                    />
                }
            />

            {/* Diet filters section */}
            <GenericFilterSection
                selectedFilters={selectedDietFilters}
                showFilters={showFilters}
                filterTitle="Suodata ruokavalioin mukaan"
                categories={dietCategories}
                onToggleFilter={toggleDietFilter}
                onClearFilters={() => setSelectedDietFilters([])}
                getItemCounts={getMealCountsForCategories}
                additionalFilterGroups={[
                    {
                        title: 'Vaikeustaso',
                        selectedValue: selectedDifficultyFilter,
                        onSelect: setSelectedDifficultyFilter,
                        getItemCount: getMealCountByDifficulty,
                        options: [
                            { value: 'easy', label: getDifficultyText('easy') },
                            {
                                value: 'medium',
                                label: getDifficultyText('medium'),
                            },
                            { value: 'hard', label: getDifficultyText('hard') },
                        ],
                    },
                    {
                        title: 'Valmistusaika',
                        selectedValue: selectedCookingTimeFilter,
                        onSelect: setSelectedCookingTimeFilter,
                        getItemCount: getMealCountByCookingTime,
                        options: [
                            { value: 15, label: '≤ 15 min' },
                            { value: 30, label: '≤ 30 min' },
                            { value: 45, label: '≤ 45 min' },
                            { value: 60, label: '≤ 60 min' },
                        ],
                    },
                ]}
            />

            {meals.length > 0 ? (
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={fetchMeals}
                        />
                    }
                >
                    {/* Active filter indicator */}
                    {(!!filterDifficulty ||
                        !!filterMaxCookingTime ||
                        !!filterMealType ||
                        !!selectedDifficultyFilter ||
                        !!selectedCookingTimeFilter) && (
                        <View style={styles.activeFilterBanner}>
                            <MaterialIcons
                                name="filter-list"
                                size={20}
                                color="#9C86FC"
                            />
                            <CustomText style={styles.activeFilterText}>
                                Näytetään:{' '}
                                {(filterDifficulty ||
                                    selectedDifficultyFilter) &&
                                    `${getDifficultyText(
                                        filterDifficulty ||
                                            selectedDifficultyFilter
                                    )}`}
                                {(filterDifficulty ||
                                    selectedDifficultyFilter) &&
                                    (filterMaxCookingTime ||
                                        selectedCookingTimeFilter ||
                                        filterMealType) &&
                                    ', '}
                                {(filterMaxCookingTime ||
                                    selectedCookingTimeFilter) &&
                                    `Valmistusaika ≤ ${
                                        filterMaxCookingTime ||
                                        selectedCookingTimeFilter
                                    } min`}
                                {(filterMaxCookingTime ||
                                    selectedCookingTimeFilter) &&
                                    filterMealType &&
                                    ', '}
                                {filterMealType &&
                                    `${getMealRoleText(filterMealType)}`}
                            </CustomText>
                            <TouchableOpacity
                                onPress={clearNavigationFilters}
                                style={styles.activeFilterCloseButton}
                            >
                                <MaterialIcons
                                    name="close"
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    )}

                    {(() => {
                        const searchedMeals = filterMealsBySearch(meals)
                        const dietFiltered = filterMealsByDiet(searchedMeals)
                        const typeFiltered = filterMealsByType(dietFiltered)
                        const difficultyFiltered =
                            filterMealsByDifficulty(typeFiltered)
                        const filteredMeals =
                            filterMealsByCookingTime(difficultyFiltered)
                        const groupedMeals = groupMealsByCategory(filteredMeals)

                        if (Object.keys(groupedMeals).length === 0) {
                            if (
                                searchQuery.trim() &&
                                selectedDietFilters.length > 0
                            ) {
                                return (
                                    <CustomText style={styles.emptyText}>
                                        Ei aterioita hakusanalla "{searchQuery}"
                                        ja valituilla suodattimilla. Kokeile eri
                                        hakusanaa tai suodatinyhdistelmää.
                                    </CustomText>
                                )
                            } else if (searchQuery.trim()) {
                                return (
                                    <CustomText style={styles.emptyText}>
                                        Ei aterioita hakusanalla "{searchQuery}
                                        ". Kokeile eri hakusanaa.
                                    </CustomText>
                                )
                            } else if (selectedDietFilters.length > 0) {
                                return (
                                    <CustomText style={styles.emptyText}>
                                        Ei aterioita valituilla suodattimilla.
                                        Kokeile eri suodatinyhdistelmää.
                                    </CustomText>
                                )
                            }
                        }

                        return Object.entries(groupedMeals).map(
                            ([category, mealsInCategory]) =>
                                renderCategorySection(category, mealsInCategory)
                        )
                    })()}
                </ScrollView>
            ) : (
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={fetchMeals}
                        />
                    }
                >
                    {renderHeader()}
                    {!loading && (
                        <CustomText style={styles.emptyText}>
                            Ei vielä aterioita. Lisää ensimmäinen ateria
                            painamalla "Lisää ateria" -nappia.
                        </CustomText>
                    )}
                </ScrollView>
            )}

            <MealItemDetail
                meal={selectedMeal}
                visible={detailModalVisible}
                onClose={handleCloseDetail}
                onUpdate={handleUpdateMeal}
            />
        </View>
    )

    if (isDesktop) {
        return (
            <ResponsiveLayout activeRoute="MealsStack">
                <View style={styles.desktopContentWrapper}>{content}</View>
            </ResponsiveLayout>
        )
    }

    return content
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
    },
    headerContainer: {
        alignItems: 'flex-start',
        paddingTop: 15,
        paddingBottom: 10,
        paddingHorizontal: 5,
    },
    introText: {
        fontSize: 17,
        textAlign: 'left',
        marginBottom: 20,
        maxWidth: '100%',
    },
    desktopIntroText: {
        fontSize: 21,
        paddingVertical: 16,
    },
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
    list: {
        width: '100%',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: '100%',
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        minWidth: 150,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    categorySection: {
        marginBottom: 20,
    },
    desktopContentWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: 960,
        alignSelf: 'center',
        paddingHorizontal: 40,
    },
    activeFilterBanner: {
        backgroundColor: '#F3F0FF',
        borderLeftWidth: 4,
        borderLeftColor: '#9C86FC',
        padding: 12,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    activeFilterText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    activeFilterCloseButton: {
        padding: 4,
        marginLeft: 8,
    },
})

export default MealsScreen
