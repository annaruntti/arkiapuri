import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import CustomText from '../components/CustomText'
import Button from '../components/Button'
import CategorySectionHeader from '../components/CategorySectionHeader'
import ContentContainer from '../components/ContentContainer'
import FoodListItemRow from '../components/FoodListItemRow'
import MealItem from '../components/MealItem'
import MealItemDetail from '../components/MealItemDetail'
import PantryItemDetails from '../components/PantryItemDetails'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ScreenTabBar from '../components/ScreenTabBar'
import SearchSection from '../components/SearchSection'
import StickyListLayout from '../components/StickyListLayout'
import { getServerUrl } from '../utils/getServerUrl'
import { submitMealUpdate } from '../utils/mealUpdateSubmit'
import {
    updateOpenCatalogFoodItem,
    updateOpenCatalogMeal,
} from '../utils/publishToOpenCatalog'
import { useResponsiveDimensions } from '../utils/responsive'
import { showAlert } from '../utils/showAlert'
import storage from '../utils/storage'

const parseCatalogRoles = (value) => {
    if (Array.isArray(value)) return value
    if (typeof value !== 'string' || !value.trim()) return ['dinner']
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) && parsed.length ? parsed : ['dinner']
    } catch {
        return [value]
    }
}

const normalizeCatalogMealForDetail = (meal) => ({
    ...meal,
    defaultRoles: parseCatalogRoles(meal.defaultRoles),
    foodItems: (meal.foodItems || []).map((row, index) => ({
        ...row,
        name: row.name || 'Raaka-aine',
        quantity: row.quantity ?? 1,
        unit: row.unit || 'kpl',
        _id: row.globalFoodId || row._id || `catalog-ing-${index}`,
        foodId: row.globalFoodId || row.foodId || row._id,
    })),
})

const TABS = [
    { id: 'foods', label: 'Elintarvikkeet' },
    { id: 'meals', label: 'Ateriat' },
    { id: 'published', label: 'Julkaistut' },
]

const WHITE_CARD = { backgroundColor: '#ffffff' }

const AdminCatalogScreen = () => {
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const [tab, setTab] = useState('foods')
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [mealDetailVisible, setMealDetailVisible] = useState(false)
    const [selectedFood, setSelectedFood] = useState(null)
    const [foodDetailVisible, setFoodDetailVisible] = useState(false)
    const [detailFromCatalog, setDetailFromCatalog] = useState(false)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(query.trim())
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [query])

    const authHeaders = async () => {
        const token = await storage.getItem('userToken')
        return { Authorization: `Bearer ${token}` }
    }

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const headers = await authHeaders()
            const q = debouncedQuery
                ? `?q=${encodeURIComponent(debouncedQuery)}`
                : ''
            if (tab === 'foods') {
                const response = await axios.get(
                    getServerUrl(`/admin/food-items${q}`),
                    { headers }
                )
                setItems(response.data.foodItems || [])
            } else if (tab === 'meals') {
                const response = await axios.get(
                    getServerUrl(`/admin/meals${q}`),
                    { headers }
                )
                setItems(response.data.meals || [])
            } else {
                const [foods, meals] = await Promise.all([
                    axios.get(getServerUrl(`/catalog/food-items${q}`), {
                        headers,
                    }),
                    axios.get(getServerUrl(`/catalog/meals${q}`), { headers }),
                ])
                setItems([
                    ...(foods.data.foodItems || []).map((item) => ({
                        ...item,
                        _kind: 'food',
                    })),
                    ...(meals.data.meals || []).map((item) => ({
                        ...item,
                        _kind: 'meal',
                    })),
                ])
            }
        } catch (error) {
            console.error('Admin catalog load failed:', error)
            showAlert(
                'Virhe',
                error.response?.data?.message || 'Tietojen lataus epäonnistui'
            )
        } finally {
            setLoading(false)
        }
    }, [tab, debouncedQuery])

    useFocusEffect(
        useCallback(() => {
            load()
        }, [load])
    )

    const markItemPublished = (itemId) => {
        setItems((prev) =>
            prev.map((item) =>
                String(item._id) === String(itemId)
                    ? { ...item, inOpenCatalog: true }
                    : item
            )
        )
    }

    const closeMealDetail = () => {
        setMealDetailVisible(false)
        setSelectedMeal(null)
        setDetailFromCatalog(false)
    }

    const closeFoodDetail = () => {
        setFoodDetailVisible(false)
        setSelectedFood(null)
        setDetailFromCatalog(false)
    }

    const openMeal = (meal, fromCatalog = false) => {
        setDetailFromCatalog(fromCatalog)
        setSelectedMeal(
            fromCatalog ? normalizeCatalogMealForDetail(meal) : meal
        )
        setMealDetailVisible(true)
    }

    const openFood = (food, fromCatalog = false) => {
        setDetailFromCatalog(fromCatalog)
        setSelectedFood(food)
        setFoodDetailVisible(true)
    }

    const publishFood = async (foodItemId) => {
        try {
            const headers = await authHeaders()
            await axios.post(
                getServerUrl('/admin/catalog/food-items'),
                { foodItemId },
                { headers }
            )
            markItemPublished(foodItemId)
            showAlert(
                'Julkaistu',
                'Elintarvike lisättiin avoimeen katalogiin'
            )
        } catch (error) {
            showAlert(
                'Virhe',
                error.response?.data?.message || 'Julkaisu epäonnistui'
            )
        }
    }

    const publishMeal = async (mealId) => {
        try {
            const headers = await authHeaders()
            await axios.post(
                getServerUrl('/admin/catalog/meals'),
                { mealId },
                { headers }
            )
            markItemPublished(mealId)
            showAlert('Julkaistu', 'Ateria lisättiin avoimeen katalogiin')
        } catch (error) {
            showAlert(
                'Virhe',
                error.response?.data?.message || 'Julkaisu epäonnistui'
            )
        }
    }

    const unpublish = async (item) => {
        try {
            const headers = await authHeaders()
            const path =
                item._kind === 'meal'
                    ? `/admin/catalog/meals/${item._id}`
                    : `/admin/catalog/food-items/${item._id}`
            await axios.delete(getServerUrl(path), { headers })
            showAlert('Poistettu', 'Kohde poistettiin katalogista')
            load()
        } catch (error) {
            showAlert(
                'Virhe',
                error.response?.data?.message || 'Poisto epäonnistui'
            )
        }
    }

    const handleUpdateMeal = async (mealId, updatedMeal) => {
        try {
            if (detailFromCatalog) {
                const updated = await updateOpenCatalogMeal(mealId, {
                    name: updatedMeal.name,
                    recipe: updatedMeal.recipe,
                    recipeSteps: updatedMeal.recipeSteps,
                    difficultyLevel: updatedMeal.difficultyLevel,
                    cookingTime: updatedMeal.cookingTime,
                    servings: updatedMeal.servings,
                    mealCategory: updatedMeal.mealCategory,
                    defaultRoles: Array.isArray(updatedMeal.defaultRoles)
                        ? JSON.stringify(updatedMeal.defaultRoles)
                        : updatedMeal.defaultRoles,
                })
                const normalized = normalizeCatalogMealForDetail({
                    ...updatedMeal,
                    ...updated,
                    _kind: 'meal',
                })
                setItems((prev) =>
                    prev.map((meal) =>
                        String(meal._id) === String(mealId)
                            ? { ...meal, ...updated, _kind: 'meal' }
                            : meal
                    )
                )
                setSelectedMeal(normalized)
                return true
            }

            const result = await submitMealUpdate(mealId, updatedMeal)
            if (result.ok) {
                setItems((prev) =>
                    prev.map((meal) =>
                        meal._id === mealId ? result.meal : meal
                    )
                )
                setSelectedMeal(result.meal)
                return true
            }
            showAlert(
                'Virhe',
                result.message || 'Aterian tallennus epäonnistui'
            )
            return false
        } catch (error) {
            showAlert(
                'Virhe',
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Aterian tallennus epäonnistui'
            )
            return false
        }
    }

    const handleUpdateFood = async (itemId, updatedData) => {
        try {
            let updated
            if (detailFromCatalog) {
                updated = await updateOpenCatalogFoodItem(itemId, {
                    name: updatedData.name,
                    category: updatedData.category,
                    unit: updatedData.unit,
                    price: updatedData.price,
                    calories: updatedData.calories,
                    nutrition: updatedData.nutrition,
                })
            } else {
                const headers = await authHeaders()
                const response = await axios.put(
                    getServerUrl(`/food-items/${itemId}`),
                    {
                        name: updatedData.name,
                        category: updatedData.category,
                        unit: updatedData.unit,
                        price: updatedData.price,
                        calories: updatedData.calories,
                        nutrition: updatedData.nutrition,
                        volume: updatedData.volume,
                        weight: updatedData.weight,
                        pieces: updatedData.pieces,
                        packageSize: updatedData.packageSize,
                    },
                    { headers }
                )
                updated = response.data?.foodItem
            }

            updated = updated || {
                ...selectedFood,
                ...updatedData,
                _id: itemId,
            }
            setItems((prev) =>
                prev.map((item) =>
                    String(item._id) === String(itemId)
                        ? {
                              ...item,
                              ...updated,
                              ...(detailFromCatalog ? { _kind: 'food' } : {}),
                          }
                        : item
                )
            )
            setSelectedFood((prev) =>
                prev && String(prev._id) === String(itemId)
                    ? { ...prev, ...updated }
                    : prev
            )
            closeFoodDetail()
            return true
        } catch (error) {
            showAlert(
                'Virhe',
                error.response?.data?.message ||
                    error.message ||
                    'Tuotteen päivitys epäonnistui'
            )
            return false
        }
    }

    const actionButtons = (item) => {
        if (tab === 'published') {
            return (
                <View style={styles.actions}>
                    <Button
                        title="Poista"
                        type="TERTIARY"
                        onPress={() => unpublish(item)}
                        style={styles.primaryButton}
                        textStyle={styles.buttonText}
                    />
                </View>
            )
        }

        if (item.inOpenCatalog) {
            return (
                <View style={styles.actions}>
                    <Button
                        title="Julkaistu"
                        type="SECONDARY"
                        disabled
                        style={styles.primaryButton}
                        textStyle={styles.buttonText}
                    />
                </View>
            )
        }

        return (
            <View style={styles.actions}>
                <Button
                    title="Julkaise"
                    onPress={() =>
                        tab === 'meals'
                            ? publishMeal(item._id)
                            : publishFood(item._id)
                    }
                    style={styles.primaryButton}
                    textStyle={styles.buttonText}
                />
            </View>
        )
    }

    const renderFoodItem = (item) => (
        <FoodListItemRow
            key={`food-${item._id}`}
            variant="card"
            item={item}
            style={WHITE_CARD}
            hideQuantityInDetails
            detail={(item.category || []).join(', ') || item.unit || ''}
            onPress={() => openFood(item, tab === 'published')}
            trailingAction={actionButtons(item)}
        />
    )

    const renderMealItem = (item) => (
        <MealItem
            key={`meal-${item._id}`}
            item={item}
            onPress={() => openMeal(item, tab === 'published')}
            trailing={actionButtons(item)}
        />
    )

    const publishedFoods = items.filter((item) => item._kind === 'food')
    const publishedMeals = items.filter((item) => item._kind === 'meal')

    const renderListBody = () => {
        if (loading) {
            return (
                <CustomText style={styles.emptyText}>Ladataan…</CustomText>
            )
        }

        if (tab === 'published') {
            if (publishedFoods.length === 0 && publishedMeals.length === 0) {
                return (
                    <CustomText style={styles.emptyText}>Ei tuloksia</CustomText>
                )
            }
            return (
                <>
                    <View style={styles.section}>
                        <CategorySectionHeader
                            title="Elintarvikkeet"
                            count={publishedFoods.length}
                        />
                        {publishedFoods.length === 0 ? (
                            <CustomText style={styles.sectionEmpty}>
                                Ei julkaistuja elintarvikkeita
                            </CustomText>
                        ) : (
                            publishedFoods.map(renderFoodItem)
                        )}
                    </View>
                    <View style={styles.section}>
                        <CategorySectionHeader
                            title="Ateriat"
                            count={publishedMeals.length}
                        />
                        {publishedMeals.length === 0 ? (
                            <CustomText style={styles.sectionEmpty}>
                                Ei julkaistuja aterioita
                            </CustomText>
                        ) : (
                            publishedMeals.map(renderMealItem)
                        )}
                    </View>
                </>
            )
        }

        if (items.length === 0) {
            return (
                <CustomText style={styles.emptyText}>Ei tuloksia</CustomText>
            )
        }

        if (tab === 'meals') {
            return items.map(renderMealItem)
        }

        return items.map(renderFoodItem)
    }

    const searchHeading =
        tab === 'foods'
            ? 'Etsi elintarvikkeita'
            : tab === 'meals'
              ? 'Etsi aterioita'
              : 'Etsi julkaistuja'

    return (
        <ResponsiveLayout
            activeRoute="ProfileStack"
            contentBackgroundColor="#f9fafb"
        >
            <ScreenTabBar tabs={TABS} activeId={tab} onChange={setTab}>
                <ContentContainer>
                    <View
                        style={[
                            styles.page,
                            isTablet && styles.widePage,
                            isDesktop && styles.desktopPage,
                        ]}
                    >
                        <StickyListLayout
                            chromeBackgroundColor="#f9fafb"
                            style={styles.listLayout}
                            contentContainerStyle={styles.listContent}
                            header={
                                <CustomText
                                    style={[
                                        styles.intro,
                                        isDesktop && styles.desktopIntro,
                                    ]}
                                >
                                    Julkaise tuotteita ja aterioita kaikkien
                                    käyttäjien katalogiin.
                                </CustomText>
                            }
                            sticky={
                                <View style={styles.findSection}>
                                    <SearchSection
                                        heading={searchHeading}
                                        searchQuery={query}
                                        onSearchChange={setQuery}
                                        onClearSearch={() => setQuery('')}
                                        placeholder="Etsi…"
                                        showResultsInfo={query.length > 0}
                                        resultsCount={items.length}
                                        resultsText="Löytyi {count} kohdetta"
                                        noResultsText="Kohteita ei löytynyt"
                                    />
                                </View>
                            }
                        >
                            {renderListBody()}
                        </StickyListLayout>
                    </View>
                </ContentContainer>
            </ScreenTabBar>

            <MealItemDetail
                meal={selectedMeal}
                visible={mealDetailVisible}
                onClose={closeMealDetail}
                onUpdate={handleUpdateMeal}
                showPublishToCatalog={!detailFromCatalog}
            />
            <PantryItemDetails
                item={selectedFood}
                visible={foodDetailVisible}
                showInventoryFields={false}
                showPublishToCatalog={!detailFromCatalog}
                onClose={closeFoodDetail}
                onUpdate={handleUpdateFood}
            />
        </ResponsiveLayout>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#f9fafb',
        paddingHorizontal: 15,
        paddingTop: 24,
        minHeight: 0,
    },
    widePage: {
        paddingTop: 32,
    },
    desktopPage: {
        paddingHorizontal: 0,
    },
    listLayout: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    findSection: {
        backgroundColor: '#f9fafb',
        paddingBottom: 8,
    },
    intro: {
        fontSize: 17,
        textAlign: 'left',
        marginBottom: 8,
        maxWidth: '100%',
        color: '#333',
    },
    desktopIntro: {
        fontSize: 21,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    section: {
        marginBottom: 8,
    },
    sectionEmpty: {
        color: '#666',
        marginBottom: 8,
        marginLeft: 2,
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
})

export default AdminCatalogScreen
