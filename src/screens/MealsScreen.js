import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Alert,
    Platform,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native'
import CategorySectionHeader from '../components/CategorySectionHeader'
import CustomText from '../components/CustomText'
import MealsFilterChrome from '../components/MealsFilterChrome'
import MealItem from '../components/MealItem'
import MealsScreenModals from '../components/MealsScreenModals'
import ContentContainer from '../components/ContentContainer'
import ResponsiveLayout from '../components/ResponsiveLayout'
import useLoginPrompt from '../hooks/useLoginPrompt'
import useDishScan from '../hooks/useDishScan'
import AddActionSection from '../components/AddActionSection'
import SearchSection from '../components/SearchSection'
import StickyListLayout from '../components/StickyListLayout'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import { DEFAULT_SERVINGS } from '../utils/mealServings'
import { processFormCategories } from '../utils/foodCategories'
import {
    isPersistedFoodItemId,
    resolveCatalogFoodId,
} from '../utils/foodItemId'
import { getIngredientQuantity } from '../utils/mealFoodItem'
import { mapDishScanToFormDraft } from '../utils/dishFromPhotoDraft'
import {
    clampDatesToMin,
    toStoredMealDate,
    toStoredMealDates,
} from '../utils/mealDates'
import { SORT_OPTION_IDS, sortListItems } from '../utils/listSort'
import {
    getDifficultyEnum,
    getMealRoleText,
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
} from '../utils/mealFilters'
import { groupMealsByCategory } from '../utils/mealGrouping'
import storage from '../utils/storage'

const MealsScreen = ({ route, navigation }) => {
    const { isDesktop } = useResponsiveDimensions()
    const [modalVisible, setModalVisible] = useState(false)
    const [addMealNested, setAddMealNested] = useState(false)
    const addMealBackRef = useRef(null)
    const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [aiDraft, setAiDraft] = useState(null)
    const [aiEntitlement, setAiEntitlement] = useState(null)
    const [selectedDietFilters, setSelectedDietFilters] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [sortId, setSortId] = useState(SORT_OPTION_IDS.NAME_ASC)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDifficultyFilter, setSelectedDifficultyFilter] =
        useState(null)
    const [selectedCookingTimeFilter, setSelectedCookingTimeFilter] =
        useState(null)
    const [selectedMealTypeFilter, setSelectedMealTypeFilter] = useState(null)

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
        setSelectedMealTypeFilter(null)
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

    const handleAddMealHeaderChange = useCallback(({ isNested }) => {
        setAddMealNested(Boolean(isNested))
    }, [])

    const closeAddMealModal = () => {
        if (addMealBackRef.current?.()) return
        setModalVisible(false)
        setAiDraft(null)
        setAddMealNested(false)
    }

    const handleAddMeal = async (newMeal) => {
        try {
            // Add the new meal to the existing meals array
            setMeals((prevMeals) => [...prevMeals, newMeal])
            setModalVisible(false)
            setAiDraft(null)
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
            // First, handle each food item
            const processedFoodItems = await Promise.all(
                updatedMeal.foodItems.map(async (item) => {
                    const categoryIds = processFormCategories(item.category)

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
                    const catalogId = resolveCatalogFoodId(item)

                    if (isPersistedFoodItemId(catalogId)) {
                        return { foodId: catalogId, quantity, unit }
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
                plannedCookingDate: toStoredMealDate(
                    updatedMeal.plannedCookingDate
                ),
                plannedEatingDates: toStoredMealDates(
                    clampDatesToMin(
                        updatedMeal.plannedEatingDates || [],
                        updatedMeal.plannedCookingDate
                    )
                ),
                servings: parseInt(updatedMeal.servings, 10) || DEFAULT_SERVINGS,
                recipe: updatedMeal.recipe || '',
                recipeSteps: Array.isArray(updatedMeal.recipeSteps)
                    ? updatedMeal.recipeSteps
                    : [],
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
        setAiDraft(null)
        if (!token) {
            // Retry action opens the modal directly — no re-auth check needed
            showLoginPrompt('meal_create', () => setModalVisible(true))
            return
        }
        setModalVisible(true)
    }

    const {
        scanLockVisible,
        setScanLockVisible,
        scanLockReason,
        scanLoading,
        handleOpenDishScan,
    } = useDishScan({
        aiEntitlement,
        setAiEntitlement,
        setAiDraft,
        setModalVisible,
        showLoginPrompt,
        mapDishScanToFormDraft,
    })

    const activeMealTypeFilter = selectedMealTypeFilter || filterMealType
    const searchedMeals = filterMealsBySearch(meals, searchQuery)
    const dietFiltered = filterMealsByDiet(searchedMeals, selectedDietFilters)
    const typeFiltered = filterMealsByType(dietFiltered, activeMealTypeFilter)
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
    const hasActiveFilters =
        selectedDietFilters.length > 0 ||
        selectedDifficultyFilter ||
        selectedCookingTimeFilter ||
        selectedMealTypeFilter ||
        filterMealType ||
        filterDifficulty ||
        filterMaxCookingTime

    const emptyListMessage = (() => {
        if (Object.keys(groupedMeals).length > 0) return null
        if (searchQuery.trim() && hasActiveFilters) {
            return `Ei aterioita hakusanalla "${searchQuery}" ja valituilla suodattimilla. Kokeile eri hakusanaa tai suodatinyhdistelmää.`
        }
        if (searchQuery.trim()) {
            return `Ei aterioita hakusanalla "${searchQuery}". Kokeile eri hakusanaa.`
        }
        if (hasActiveFilters) {
            return 'Ei aterioita valituilla suodattimilla. Kokeile eri suodatinyhdistelmää.'
        }
        return null
    })()

    const content = (
        <View style={[styles.container, isDesktop && styles.desktopContainer]}>
            <MealsScreenModals
                modalVisible={modalVisible}
                onCloseAddMeal={closeAddMealModal}
                addMealNested={addMealNested}
                aiDraft={aiDraft}
                onSubmitAddMeal={handleAddMeal}
                addMealBackRef={addMealBackRef}
                onAddMealHeaderChange={handleAddMealHeaderChange}
                loginPromptProps={loginPromptProps}
                selectedMeal={selectedMeal}
                detailModalVisible={detailModalVisible}
                onCloseDetail={handleCloseDetail}
                onUpdateMeal={handleUpdateMeal}
                scanLockVisible={scanLockVisible}
                onCloseScanLock={() => setScanLockVisible(false)}
                onScanLockAddManually={() => {
                    setScanLockVisible(false)
                    handleOpenAddMeal()
                }}
                scanLockReason={scanLockReason}
                scanLoading={scanLoading}
            />

            <StickyListLayout
                chromeBackgroundColor="#f9fafb"
                style={styles.listLayout}
                header={
                    <View style={styles.addSticky}>
                        <AddActionSection
                            title="Lisää ateria"
                            hint="Skannaa valmis ruoka-annos, tai lisää ateria manuaalisesti."
                            primaryTitle="Skannaa ateria"
                            onPrimaryPress={handleOpenDishScan}
                            secondaryTitle="Lisää manuaalisesti"
                            onSecondaryPress={handleOpenAddMeal}
                        />
                    </View>
                }
                sticky={
                    <View style={styles.findSection}>
                        <SearchSection
                            heading="Etsi aterioita"
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onClearSearch={() => setSearchQuery('')}
                            placeholder="Hae aterioita nimellä..."
                            showResultsInfo={false}
                        />
                    </View>
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchMeals}
                    />
                }
            >
                <>
                    <View style={styles.findSection}>
                        <MealsFilterChrome
                            filterDifficulty={filterDifficulty}
                            selectedDifficultyFilter={
                                selectedDifficultyFilter
                            }
                            setSelectedDifficultyFilter={
                                setSelectedDifficultyFilter
                            }
                            filterMaxCookingTime={filterMaxCookingTime}
                            selectedCookingTimeFilter={
                                selectedCookingTimeFilter
                            }
                            setSelectedCookingTimeFilter={
                                setSelectedCookingTimeFilter
                            }
                            activeMealTypeFilter={activeMealTypeFilter}
                            selectedMealTypeFilter={selectedMealTypeFilter}
                            setSelectedMealTypeFilter={
                                setSelectedMealTypeFilter
                            }
                            onClearNavigationFilters={clearNavigationFilters}
                            sortId={sortId}
                            setSortId={setSortId}
                            selectedDietFilters={selectedDietFilters}
                            setSelectedDietFilters={setSelectedDietFilters}
                            showFilters={showFilters}
                            setShowFilters={setShowFilters}
                            dietCategories={dietCategories}
                            onToggleDietFilter={toggleDietFilter}
                            searchedMeals={searchedMeals}
                            filteredMealsCount={filteredMeals.length}
                            mealsCount={meals.length}
                            searchQuery={searchQuery}
                            hasActiveFilters={hasActiveFilters}
                        />
                    </View>
                    {meals.length === 0 ? (
                        !loading && (
                            <CustomText style={styles.emptyText}>
                                Ei vielä aterioita. Skannaa ruoka-annos tai lisää
                                ateria manuaalisesti.
                            </CustomText>
                        )
                    ) : emptyListMessage ? (
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
            </StickyListLayout>
        </View>
    )

    return (
        <ResponsiveLayout
            activeRoute="MealsStack"
            contentBackgroundColor="#f9fafb"
        >
            <ContentContainer>{content}</ContentContainer>
        </ResponsiveLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 15,
        // todo: add these styles only to tablet
        // marginVertical: 15,
        // borderRadius: 10,
    },
    desktopContainer: {
        paddingHorizontal: 0,
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
    listLayout: {
        backgroundColor: '#f9fafb',
    },
    addSticky: {
        backgroundColor: '#f9fafb',
        paddingBottom: 4,
    },
    findSection: {
        backgroundColor: '#f9fafb',
        paddingTop: 4,
    },
    findHeading: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
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
})

export default MealsScreen
