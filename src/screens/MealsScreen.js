import axios from 'axios'
import { useEffect, useState } from 'react'
import {
    Alert,
    Platform,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native'
import ActiveFilterBanner from '../components/ActiveFilterBanner'
import CategorySectionHeader from '../components/CategorySectionHeader'
import CustomText from '../components/CustomText'
import AddMealForm from '../components/FormAddMeal'
import GenericFilter from '../components/GenericFilter'
import ListSortControl from '../components/ListSortControl'
import MealItem from '../components/MealItem'
import MealItemDetail from '../components/MealItemDetail'
import LoginPromptModal from '../components/LoginPromptModal'
import ResponsiveLayout from '../components/ResponsiveLayout'
import useLoginPrompt from '../hooks/useLoginPrompt'
import ResponsiveModal from '../components/ResponsiveModal'
import SearchSection from '../components/SearchSection'
import StickyListLayout from '../components/StickyListLayout'
import { getServerUrl } from '../utils/getServerUrl'
import { DEFAULT_SERVINGS } from '../utils/mealServings'
import { getIngredientQuantity } from '../utils/mealFoodItem'
import {
    MEAL_SORT_OPTIONS,
    SORT_OPTION_IDS,
    sortListItems,
} from '../utils/listSort'
import {
    getDifficultyText,
    getMealRoleText,
    getDifficultyEnum,
    parseMealCategories,
    parseMealRoles,
} from '../utils/mealUtils'
import {
    filterMealsBySearch,
    filterMealsByDiet,
    filterMealsByDifficulty,
    filterMealsByCookingTime,
    filterMealsByType,
    getDietCategories,
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
    const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [selectedDietFilters, setSelectedDietFilters] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [sortId, setSortId] = useState(SORT_OPTION_IDS.NAME_ASC)
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

            if (!token) {
                // Keep guest session meals in memory
                return
            }

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
            if (error?.response?.status !== 401) {
                Alert.alert('Virhe', 'Aterioiden haku epäonnistui')
            }
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

        if (!token || String(mealId).startsWith('guest-')) {
            Alert.alert(
                'Poista ateria',
                'Haluatko varmasti poistaa tämän aterian?',
                [
                    { text: 'Peruuta', style: 'cancel' },
                    {
                        text: 'Poista',
                        style: 'destructive',
                        onPress: () => {
                            setMeals((prevMeals) =>
                                prevMeals.filter(
                                    (meal) => meal._id !== mealId
                                )
                            )
                        },
                    },
                ]
            )
            return
        }

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
            const isPersistedFoodItemId = (id) =>
                typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)

            // First, handle each food item
            const processedFoodItems = await Promise.all(
                updatedMeal.foodItems.map(async (item) => {
                    let categoryArray = item.category
                    if (typeof item.category === 'string') {
                        try {
                            categoryArray = JSON.parse(item.category)
                        } catch (e) {
                            categoryArray = []
                        }
                    }

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

                    const quantity = getIngredientQuantity(item)
                    const unit = item.unit || 'kpl'
                    const catalogPayload = {
                        name: item.name,
                        isFood: item.isFood !== false,
                        unit,
                        category: categoryIds,
                        calories: parseInt(item.calories) || 0,
                        price: parseFloat(item.price) || 0,
                    }
                    const resolveId = (value) => {
                        if (!value) return ''
                        if (typeof value === 'object') {
                            return String(value._id || value.id || '')
                        }
                        return String(value)
                    }
                    const catalogId =
                        resolveId(item.foodId) || resolveId(item._id)

                    if (isPersistedFoodItemId(catalogId)) {
                        try {
                            await axios.put(
                                getServerUrl(`/food-items/${catalogId}`),
                                catalogPayload,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            )
                            return { foodId: catalogId, quantity, unit }
                        } catch (error) {
                            if (error.response?.status !== 404) {
                                throw error
                            }
                        }
                    }

                    const response = await axios.post(
                        getServerUrl('/food-items/find-or-create'),
                        catalogPayload,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                    return {
                        foodId: response.data.foodItem._id,
                        quantity,
                        unit,
                    }
                })
            )

            const validDifficulties = ['easy', 'medium', 'hard']
            const difficultyLevel = validDifficulties.includes(
                updatedMeal.difficultyLevel
            )
                ? updatedMeal.difficultyLevel
                : getDifficultyEnum(updatedMeal.difficultyLevel)

            const cleanedMeal = {
                name: updatedMeal.name,
                cookingTime: parseInt(updatedMeal.cookingTime) || 0,
                difficultyLevel,
                defaultRoles: parseMealRoles(
                    updatedMeal.defaultRoles,
                    ['dinner']
                ),
                mealCategory: parseMealCategories(updatedMeal.mealCategory, []),
                plannedCookingDate: updatedMeal.plannedCookingDate,
                plannedEatingDates: updatedMeal.plannedEatingDates || [],
                servings: parseInt(updatedMeal.servings, 10) || DEFAULT_SERVINGS,
                recipe: updatedMeal.recipe || '',
                foodItems: processedFoodItems,
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
                return true
            }

            console.error('Failed to update meal:', response.data.message)
            Alert.alert(
                'Virhe',
                response.data.message || 'Aterian tallennus epäonnistui'
            )
            return false
        } catch (error) {
            console.error('Error updating meal:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    'Aterian tallennus epäonnistui'
            )
            return false
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

    const handleOpenAddMeal = async () => {
        const token = await storage.getItem('userToken')
        if (!token) {
            // Retry action opens the modal directly — no re-auth check needed
            showLoginPrompt('meal_create', () => setModalVisible(true))
            return
        }
        setModalVisible(true)
    }

    const searchedMeals = filterMealsBySearch(meals, searchQuery)
    const dietFiltered = filterMealsByDiet(searchedMeals, selectedDietFilters)
    const typeFiltered = filterMealsByType(dietFiltered, filterMealType)
    const difficultyFiltered = filterMealsByDifficulty(
        typeFiltered,
        selectedDifficultyFilter || filterDifficulty
    )
    const filteredMeals = filterMealsByCookingTime(
        difficultyFiltered,
        selectedCookingTimeFilter || filterMaxCookingTime
    )
    const sortedMeals = sortListItems(filteredMeals, sortId)
    const groupedMeals = groupMealsByCategory(sortedMeals)

    const emptyListMessage = (() => {
        if (Object.keys(groupedMeals).length > 0) return null
        if (searchQuery.trim() && selectedDietFilters.length > 0) {
            return `Ei aterioita hakusanalla "${searchQuery}" ja valituilla suodattimilla. Kokeile eri hakusanaa tai suodatinyhdistelmää.`
        }
        if (searchQuery.trim()) {
            return `Ei aterioita hakusanalla "${searchQuery}". Kokeile eri hakusanaa.`
        }
        if (selectedDietFilters.length > 0) {
            return 'Ei aterioita valituilla suodattimilla. Kokeile eri suodatinyhdistelmää.'
        }
        return null
    })()

    const content = (
        <View style={styles.container}>
            <ResponsiveModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Lisää uusi ateria"
                maxWidth={640}
            >
                <AddMealForm
                    onSubmit={handleAddMeal}
                    onClose={() => setModalVisible(false)}
                />
            </ResponsiveModal>

            <LoginPromptModal {...loginPromptProps} />

            <StickyListLayout
                header={
                    <CustomText
                        style={[
                            styles.introText,
                            isDesktop && styles.desktopIntroText,
                        ]}
                    >
                        Selaa ja hallinnoi aterioitasi. Voit lisätä uusia
                        aterioita ja muokata olemassa olevia.
                    </CustomText>
                }
                sticky={
                    <SearchSection
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onClearSearch={() => setSearchQuery('')}
                        placeholder="Hae aterioita nimellä..."
                        resultsCount={filteredMeals.length}
                        resultsText="Löytyi {count} ateriaa"
                        noResultsText="Aterioita ei löytynyt"
                        showButtonSection={true}
                        buttonTitle="+ Lisää ateria"
                        onButtonPress={handleOpenAddMeal}
                        buttonStyle={styles.primaryButton}
                        buttonTextStyle={styles.buttonText}
                        showFilters={showFilters}
                        filterComponent={
                            <GenericFilter
                                selectedFilters={selectedDietFilters}
                                showFilters={showFilters}
                                onToggleShowFilters={() =>
                                    setShowFilters(!showFilters)
                                }
                                buttonText="Suodata"
                            />
                        }
                        filterSectionProps={{
                            selectedFilters: selectedDietFilters,
                            filterTitle: 'Suodata ruokavalioin mukaan',
                            categories: dietCategories,
                            onToggleFilter: toggleDietFilter,
                            onClearFilters: () => setSelectedDietFilters([]),
                            getItemCounts: () =>
                                getMealCountsForCategories(searchedMeals),
                            additionalFilterGroups: [
                                {
                                    title: 'Vaikeustaso',
                                    selectedValue: selectedDifficultyFilter,
                                    onSelect: setSelectedDifficultyFilter,
                                    getItemCount: (difficulty) =>
                                        getMealCountByDifficulty(
                                            searchedMeals,
                                            difficulty
                                        ),
                                    options: [
                                        {
                                            value: 'easy',
                                            label: getDifficultyText('easy'),
                                        },
                                        {
                                            value: 'medium',
                                            label: getDifficultyText('medium'),
                                        },
                                        {
                                            value: 'hard',
                                            label: getDifficultyText('hard'),
                                        },
                                    ],
                                },
                                {
                                    title: 'Valmistusaika',
                                    selectedValue: selectedCookingTimeFilter,
                                    onSelect: setSelectedCookingTimeFilter,
                                    getItemCount: (maxTime) =>
                                        getMealCountByCookingTime(
                                            searchedMeals,
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
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchMeals}
                    />
                }
            >
                {meals.length === 0 ? (
                    !loading && (
                        <CustomText style={styles.emptyText}>
                            Ei vielä aterioita. Lisää ensimmäinen ateria
                            painamalla "Lisää ateria" -nappia.
                        </CustomText>
                    )
                ) : (
                    <>
                        <ActiveFilterBanner
                            filterDifficulty={filterDifficulty}
                            selectedDifficultyFilter={selectedDifficultyFilter}
                            filterMaxCookingTime={filterMaxCookingTime}
                            selectedCookingTimeFilter={
                                selectedCookingTimeFilter
                            }
                            filterMealType={filterMealType}
                            onClear={clearNavigationFilters}
                        />
                        <View style={styles.listSortRow}>
                            <CustomText style={styles.listSortCount}>
                                Aterioita: {filteredMeals.length} kpl
                            </CustomText>
                            <ListSortControl
                                options={MEAL_SORT_OPTIONS}
                                value={sortId}
                                onChange={setSortId}
                            />
                        </View>
                        {emptyListMessage ? (
                            <CustomText style={styles.emptyText}>
                                {emptyListMessage}
                            </CustomText>
                        ) : (
                            Object.entries(groupedMeals).map(
                                ([category, mealsInCategory]) =>
                                    renderCategorySection(
                                        category,
                                        mealsInCategory
                                    )
                            )
                        )}
                    </>
                )}
            </StickyListLayout>

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
    listContent: {
        paddingBottom: 20,
    },
    listSortRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        zIndex: 5,
        position: 'relative',
        overflow: 'visible',
    },
    listSortCount: {
        flex: 1,
        paddingRight: 8,
        color: '#333',
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
        backgroundColor: '#AE9CFC',
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
        alignSelf: 'left',
        paddingHorizontal: 40,
    },
})

export default MealsScreen
