import axios from '../api/client'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useResponsiveDimensions } from '../utils/responsive'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import CustomText from './CustomText'
import { getMealRoles } from '../utils/mealFilters'

const PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/3b9imD6TDC4i68V4uHVgL1/1ac1194dccb086bb52ebd674c59983e3/undraw_breakfast_rgx5.png'

const emptyPantryIndex = { ids: new Set(), names: new Set() }

const mergeKey = (name) =>
    String(name || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/[^a-zåäö0-9]+/gi, '')
        .trim()

const catalogIdOf = (item) => {
    const raw = item?.foodId
    if (raw && typeof raw === 'object') {
        return String(raw._id || raw.id || '')
    }
    if (raw) return String(raw)
    return item?._id ? String(item._id) : ''
}

const itemNameOf = (item) =>
    item?.name || item?.foodId?.name || ''

const indexPantryItems = (items = []) => {
    const ids = new Set()
    const names = new Set()
    for (const item of items) {
        const id = catalogIdOf(item)
        if (id) ids.add(id)
        const name = mergeKey(itemNameOf(item))
        if (name) names.add(name)
    }
    return { ids, names }
}

const ingredientIsInPantry = (item, pantry) => {
    const id = catalogIdOf(item)
    if (id && pantry.ids.has(id)) return true
    const name = mergeKey(itemNameOf(item))
    return Boolean(name && pantry.names.has(name))
}

const hasIngredientsInPantry = (meal, pantry) => {
    const ingredients = (meal.foodItems || []).filter(
        (item) => catalogIdOf(item) || mergeKey(itemNameOf(item))
    )
    if (!ingredients.length) return false
    if (!pantry.ids.size && !pantry.names.size) return false
    const matched = ingredients.filter((item) =>
        ingredientIsInPantry(item, pantry)
    ).length
    return matched / ingredients.length >= 0.8
}

const isLunchOrDinner = (meal) => {
    const roles = getMealRoles(meal, [])
    return roles.includes('lunch') || roles.includes('dinner')
}

const pickOtherMeal = (meals, currentMeal) => {
    if (!meals.length) return null
    if (meals.length === 1 || !currentMeal) {
        return meals[Math.floor(Math.random() * meals.length)]
    }
    const currentId = String(currentMeal._id || currentMeal.id || '')
    const others = meals.filter(
        (meal) => String(meal._id || meal.id || '') !== currentId
    )
    const pool = others.length ? others : meals
    return pool[Math.floor(Math.random() * pool.length)]
}

const RandomMealCard = ({ onMealPress, iconImage, filterByPantry = false }) => {
    const { isTablet, isDesktop } = useResponsiveDimensions()
    const [randomMeal, setRandomMeal] = useState(null)
    const [loading, setLoading] = useState(true)
    const [allMeals, setAllMeals] = useState([])
    const heading = filterByPantry
        ? 'Mitä varastosta valmistaisi?'
        : 'Mitä syötäisiin tänään?'

    const fetchPantryIndex = async () => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) return emptyPantryIndex

            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success && response.data.pantry) {
                return indexPantryItems(response.data.pantry.items)
            }
            return emptyPantryIndex
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error('Error fetching pantry:', error)
            }
            return emptyPantryIndex
        }
    }

    // Fetch all meals on component mount
    const fetchMeals = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')
            if (!token) {
                setAllMeals([])
                setRandomMeal(null)
                return
            }

            const pantry = filterByPantry
                ? await fetchPantryIndex()
                : emptyPantryIndex

            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success) {
                let meals = (response.data.meals || []).filter(isLunchOrDinner)

                if (filterByPantry) {
                    meals = meals.filter((meal) =>
                        hasIngredientsInPantry(meal, pantry)
                    )
                }

                setAllMeals(meals)
                setRandomMeal(pickOtherMeal(meals, null))
            }
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error('Error fetching meals:', error)
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeals()
    }, [filterByPantry])

    const raffleNewMeal = async () => {
        if (filterByPantry) {
            try {
                setLoading(true)
                const token = await storage.getItem('userToken')
                if (!token) {
                    return
                }

                const pantry = await fetchPantryIndex()
                const response = await axios.get(getServerUrl('/meals'), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (response.data.success) {
                    const meals = (response.data.meals || [])
                        .filter(isLunchOrDinner)
                        .filter((meal) => hasIngredientsInPantry(meal, pantry))
                    setAllMeals(meals)
                    setRandomMeal(pickOtherMeal(meals, randomMeal))
                }
            } catch (error) {
                if (error?.response?.status !== 401) {
                    console.error('Error fetching meals for raffle:', error)
                }
            } finally {
                setLoading(false)
            }
            return
        }

        setRandomMeal(pickOtherMeal(allMeals, randomMeal))
    }

    if (loading) {
        return (
            <View
                style={[
                    styles.card,
                    isTablet && styles.tabletCard,
                    isDesktop && styles.desktopCard,
                    styles.loadingCard,
                ]}
            >
                <ActivityIndicator size="large" color="#5844BB" />
            </View>
        )
    }

    if (!randomMeal || allMeals.length === 0) {
        return (
            <View
                style={[
                    styles.card,
                    isTablet && styles.tabletCard,
                    isDesktop && styles.desktopCard,
                ]}
            >
                <Image
                    source={iconImage || { uri: PLACEHOLDER_IMAGE_URL }}
                    style={[styles.image, isDesktop && styles.desktopImage]}
                    resizeMode="contain"
                />
                <View style={styles.content}>
                    <CustomText
                        style={[styles.label, isDesktop && styles.desktopLabel]}
                    >
                        {heading}
                    </CustomText>
                    <CustomText
                        style={[styles.title, isDesktop && styles.desktopTitle]}
                    >
                        {filterByPantry
                            ? 'Ei aterioita saatavilla ruokavarastosta'
                            : 'Ei lounas- tai päivällisaterioita'}
                    </CustomText>
                </View>
            </View>
        )
    }

    const displayImage =
        randomMeal.imageUrl
            ? { uri: randomMeal.imageUrl }
            : randomMeal.image?.url
            ? { uri: randomMeal.image.url }
            : iconImage || { uri: PLACEHOLDER_IMAGE_URL }

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isTablet && styles.tabletCard,
                isDesktop && styles.desktopCard,
            ]}
            onPress={() => onMealPress && onMealPress(randomMeal)}
        >
            <Image
                source={displayImage}
                style={[styles.image, isDesktop && styles.desktopImage]}
                resizeMode="contain"
            />
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <CustomText
                        style={[styles.label, isDesktop && styles.desktopLabel]}
                    >
                        {heading}
                    </CustomText>
                    {filterByPantry && (
                        <View style={styles.badge}>
                            <MaterialIcons
                                name="check-circle"
                                size={12}
                                color="#10B981"
                            />
                            <CustomText style={styles.badgeText}>
                                Saatavilla
                            </CustomText>
                        </View>
                    )}
                </View>
                <CustomText
                    style={[styles.title, isDesktop && styles.desktopTitle]}
                >
                    {randomMeal.name}
                </CustomText>
                {randomMeal.description && (
                    <CustomText
                        style={[
                            styles.subtitle,
                            isDesktop && styles.desktopSubtitle,
                        ]}
                        numberOfLines={2}
                    >
                        {randomMeal.description}
                    </CustomText>
                )}
            </View>
            <TouchableOpacity
                style={[
                    styles.raffleButton,
                    isDesktop && styles.desktopRaffleButton,
                ]}
                onPress={(e) => {
                    e.stopPropagation()
                    raffleNewMeal()
                }}
            >
                <MaterialIcons
                    name="casino"
                    size={isDesktop ? 28 : 24}
                    color="#5844BB"
                />
            </TouchableOpacity>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '96%',
        marginHorizontal: 8,
    },
    tabletCard: {
        padding: 20,
        marginBottom: 20,
        marginHorizontal: 15,
        alignSelf: 'center',
        width: '97%',
    },
    desktopCard: {
        padding: 24,
        marginBottom: 24,
        marginHorizontal: 40,
        maxWidth: 730,
        alignSelf: 'flex-start',
        width: '90%',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    loadingCard: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 120,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    desktopImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
        marginRight: 20,
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
        gap: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        flex: 1,
    },
    desktopLabel: {
        fontSize: 14,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        flexShrink: 0,
    },
    badgeText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#065F46',
        marginLeft: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    desktopTitle: {
        fontSize: 20,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    desktopSubtitle: {
        fontSize: 16,
        marginLeft: 10,
    },
    raffleButton: {
        marginLeft: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F3F0FF',
    },
    desktopRaffleButton: {
        padding: 10,
        borderRadius: 10,
    },
})

export default RandomMealCard
