import { MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import axios from '../api/client'
import { useResponsiveDimensions } from '../utils/responsive'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import CustomText from './CustomText'

const PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/3b9imD6TDC4i68V4uHVgL1/1ac1194dccb086bb52ebd674c59983e3/undraw_breakfast_rgx5.png'

const RandomMealCard = ({ onMealPress, iconImage, filterByPantry = false }) => {
    const { isTablet, isDesktop } = useResponsiveDimensions()
    const [randomMeal, setRandomMeal] = useState(null)
    const [loading, setLoading] = useState(true)
    const [allMeals, setAllMeals] = useState([])
    const [pantryFoodIds, setPantryFoodIds] = useState([])

    // Fetch pantry items to get available food IDs
    const fetchPantry = async () => {
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success && response.data.pantry) {
                // Extract foodId values from pantry items
                const foodIds = response.data.pantry.items
                    .map((item) => item.foodId?._id || item.foodId)
                    .filter((id) => id != null)
                    .map((id) => String(id)) // Convert to strings for comparison
                setPantryFoodIds(foodIds)
                return foodIds
            }
            return []
        } catch (error) {
            console.error('Error fetching pantry:', error)
            return []
        }
    }

    // Check if meal has ingredients in pantry
    const hasIngredientsInPantry = (meal, pantryFoodIds) => {
        if (!meal.foodItems || meal.foodItems.length === 0) {
            return false
        }
        if (pantryFoodIds.length === 0) {
            return false
        }

        // Convert meal foodItems to string IDs for comparison
        const mealFoodIds = meal.foodItems.map((item) => {
            // Handle both populated and non-populated foodItems
            return String(item._id || item)
        })

        // Check if all ingredients are in pantry (or at least 80% for flexibility)
        const ingredientsInPantry = mealFoodIds.filter((id) =>
            pantryFoodIds.includes(id)
        )
        const matchPercentage =
            ingredientsInPantry.length / mealFoodIds.length

        // Return true if at least 80% of ingredients are in pantry
        return matchPercentage >= 0.8
    }

    // Fetch all meals on component mount
    const fetchMeals = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')

            // Fetch pantry first if filtering by pantry
            let availableFoodIds = []
            if (filterByPantry) {
                availableFoodIds = await fetchPantry()
            }

            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success) {
                let meals = response.data.meals || []

                // Filter meals that have 'lunch' or 'dinner' in their defaultRoles
                meals = meals.filter((meal) => {
                    const roles = meal.defaultRoles || []
                    return roles.includes('lunch') || roles.includes('dinner')
                })

                // Filter by pantry if enabled
                if (filterByPantry && availableFoodIds.length > 0) {
                    meals = meals.filter((meal) =>
                        hasIngredientsInPantry(meal, availableFoodIds)
                    )
                }

                setAllMeals(meals)

                // Set initial random meal
                if (meals.length > 0) {
                    const randomIndex = Math.floor(
                        Math.random() * meals.length
                    )
                    setRandomMeal(meals[randomIndex])
                }
            }
        } catch (error) {
            console.error('Error fetching meals:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeals()
    }, [filterByPantry])

    // Function to get a new random meal
    const raffleNewMeal = async () => {
        if (filterByPantry) {
            // Re-fetch pantry and meals to get latest data
            try {
                setLoading(true)
                const token = await storage.getItem('userToken')
                const availableFoodIds = await fetchPantry()

                const response = await axios.get(getServerUrl('/meals'), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (response.data.success) {
                    let meals = response.data.meals || []

                    // Filter meals that have 'lunch' or 'dinner' in their defaultRoles
                    meals = meals.filter((meal) => {
                        const roles = meal.defaultRoles || []
                        return roles.includes('lunch') || roles.includes('dinner')
                    })

                    // Filter by pantry if enabled
                    if (availableFoodIds.length > 0) {
                        meals = meals.filter((meal) =>
                            hasIngredientsInPantry(meal, availableFoodIds)
                        )
                    }

                    setAllMeals(meals)

                    // Pick a different random meal if available
                    if (meals.length > 0) {
                        // If there's more than one meal, avoid selecting the same one
                        let randomIndex = Math.floor(Math.random() * meals.length)
                        if (meals.length > 1 && randomMeal) {
                            const currentMealId = String(randomMeal._id || randomMeal.id)
                            // Try to pick a different meal
                            const otherMeals = meals.filter(
                                (meal) => String(meal._id || meal.id) !== currentMealId
                            )
                            if (otherMeals.length > 0) {
                                randomIndex = Math.floor(
                                    Math.random() * otherMeals.length
                                )
                                setRandomMeal(otherMeals[randomIndex])
                            } else {
                                setRandomMeal(meals[randomIndex])
                            }
                        } else {
                            setRandomMeal(meals[randomIndex])
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching meals for raffle:', error)
            } finally {
                setLoading(false)
            }
        } else {
            // Just pick a random meal from existing list
            if (allMeals.length > 0) {
                // If there's more than one meal, avoid selecting the same one
                let randomIndex = Math.floor(Math.random() * allMeals.length)
                if (allMeals.length > 1 && randomMeal) {
                    const currentMealId = String(randomMeal._id || randomMeal.id)
                    // Try to pick a different meal
                    const otherMeals = allMeals.filter(
                        (meal) => String(meal._id || meal.id) !== currentMealId
                    )
                    if (otherMeals.length > 0) {
                        randomIndex = Math.floor(Math.random() * otherMeals.length)
                        setRandomMeal(otherMeals[randomIndex])
                    } else {
                        setRandomMeal(allMeals[randomIndex])
                    }
                } else {
                    setRandomMeal(allMeals[randomIndex])
                }
            }
        }
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
                <ActivityIndicator size="large" color="#9C86FC" />
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
                <CustomText
                    style={[styles.title, isDesktop && styles.desktopTitle]}
                >
                    Mitä syötäisiin tänään?
                </CustomText>
                <CustomText
                    style={[
                        styles.subtitle,
                        isDesktop && styles.desktopSubtitle,
                    ]}
                >
                    {filterByPantry
                        ? 'Ei aterioita saatavilla ruokavarastosta'
                        : 'Ei lounas- tai päivällisaterioita'}
                </CustomText>
            </View>
        )
    }

    // Use meal's image if available, otherwise use iconImage or placeholder
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
                <View style={styles.labelContainer}>
                    <CustomText
                        style={[styles.label, isDesktop && styles.desktopLabel]}
                    >
                        {filterByPantry
                            ? 'Ateria ruokavarastosta'
                            : 'Mitä syötäisiin tänään?'}
                    </CustomText>
                    {filterByPantry && (
                        <View style={styles.badge}>
                            <MaterialIcons
                                name="check-circle"
                                size={14}
                                color="#10B981"
                            />
                            <CustomText style={styles.badgeText}>
                                Ainekset saatavilla
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
                    color="#9C86FC"
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
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        flexWrap: 'wrap',
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#065F46',
        marginLeft: 4,
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
