import axios from 'axios'
import { useEffect, useState } from 'react'
import {
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native'
import ActiveFilterBanner from '../components/ActiveFilterBanner'
import CategorySectionHeader from '../components/CategorySectionHeader'
import CustomText from '../components/CustomText'
import AddMealForm from '../components/FormAddMeal'
import GenericFilter from '../components/GenericFilter'
import MealItem from '../components/MealItem'
import MealItemDetail from '../components/MealItemDetail'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import SearchSection from '../components/SearchSection'
import { getServerUrl } from '../utils/getServerUrl'
import {
    getDifficultyText,
    getMealRoleText,
} from '../utils/mealUtils'
import {
    filterMealsBySearch,
    filterMealsByDiet,
    filterMealsByDifficulty,
    filterMealsByCookingTime,
    filterMealsByType,
    getDietCategories,
    getCategoryMappings,
    getMealCountByDifficulty,
    getMealCountByCookingTime,
} from '../utils/mealFilters'
import {
    groupMealsByCategory,
    getMealCountsForCategories,
} from '../utils/mealGrouping'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

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

    // Get filter params from navigation, use only if they have actual values
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
    const dietCategories = getDietCategories()
    const { categoryNameToId } = getCategoryMappings()

    // Note: Filter functions are now imported from utils/mealFilters.js

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

    // Note: Grouping and count functions are now imported from utils

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

            // Update the meal with only the necessary fields
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

    const renderCategorySection = (category, mealsInCategory) => (
        <View key={category} style={styles.categorySection}>
            <CategorySectionHeader
                title={getMealRoleText(category)}
                count={mealsInCategory.length}
            />
            {mealsInCategory.map((meal) => (
                <MealItem
                    key={meal._id}
                    item={meal}
                    onPress={handleMealPress}
                    onDelete={handleDeleteMeal}
                />
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
                                filterMealsByDiet(
                                    filterMealsBySearch(meals, searchQuery),
                                    selectedDietFilters
                                ),
                                filterMealType
                            ),
                            selectedDifficultyFilter || filterDifficulty
                        ),
                        selectedCookingTimeFilter || filterMaxCookingTime
                    ).length
                }
                resultsText="Löytyi {count} ateriaa"
                noResultsText="Aterioita ei löytynyt"
                showButtonSection={true}
                buttonTitle="+ Lisää ateria"
                onButtonPress={() => setModalVisible(true)}
                buttonStyle={styles.primaryButton}
                buttonTextStyle={styles.buttonText}
                showFilters={showFilters}
                filterComponent={
                    <GenericFilter
                        selectedFilters={selectedDietFilters}
                        showFilters={showFilters}
                        onToggleShowFilters={() => setShowFilters(!showFilters)}
                        buttonText="Suodata"
                    />
                }
                filterSectionProps={{
                    selectedFilters: selectedDietFilters,
                    filterTitle: "Suodata ruokavalioin mukaan",
                    categories: dietCategories,
                    onToggleFilter: toggleDietFilter,
                    onClearFilters: () => setSelectedDietFilters([]),
                    getItemCounts: () =>
                        getMealCountsForCategories(
                            filterMealsBySearch(meals, searchQuery)
                        ),
                    additionalFilterGroups: [
                        {
                            title: 'Vaikeustaso',
                            selectedValue: selectedDifficultyFilter,
                            onSelect: setSelectedDifficultyFilter,
                            getItemCount: (difficulty) =>
                                getMealCountByDifficulty(
                                    filterMealsBySearch(meals, searchQuery),
                                    difficulty
                                ),
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
                            getItemCount: (maxTime) =>
                                getMealCountByCookingTime(
                                    filterMealsBySearch(meals, searchQuery),
                                    maxTime
                                ),
                            options: [
                                { value: 15, label: '≤ 15 min' },
                                { value: 30, label: '≤ 30 min' },
                                { value: 45, label: '≤ 45 min' },
                                { value: 60, label: '≤ 60 min' },
                            ],
                        },
                    ],
                }}
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
                    <ActiveFilterBanner
                        filterDifficulty={filterDifficulty}
                        selectedDifficultyFilter={selectedDifficultyFilter}
                        filterMaxCookingTime={filterMaxCookingTime}
                        selectedCookingTimeFilter={selectedCookingTimeFilter}
                        filterMealType={filterMealType}
                        onClear={clearNavigationFilters}
                    />

                    {(() => {
                        const searchedMeals = filterMealsBySearch(
                            meals,
                            searchQuery
                        )
                        const dietFiltered = filterMealsByDiet(
                            searchedMeals,
                            selectedDietFilters
                        )
                        const typeFiltered = filterMealsByType(
                            dietFiltered,
                            filterMealType
                        )
                        const difficultyFiltered = filterMealsByDifficulty(
                            typeFiltered,
                            selectedDifficultyFilter || filterDifficulty
                        )
                        const filteredMeals = filterMealsByCookingTime(
                            difficultyFiltered,
                            selectedCookingTimeFilter || filterMaxCookingTime
                        )
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
})

export default MealsScreen
