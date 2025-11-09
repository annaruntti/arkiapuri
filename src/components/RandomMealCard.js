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

const RandomMealCard = ({ onMealPress, iconImage }) => {
    const { isTablet, isDesktop } = useResponsiveDimensions()
    const [randomMeal, setRandomMeal] = useState(null)
    const [loading, setLoading] = useState(true)
    const [allMeals, setAllMeals] = useState([])

    // Fetch all meals on component mount
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
                const meals = response.data.meals || []
                // Filter meals that have 'lunch' or 'dinner' in their defaultRoles
                const filteredMeals = meals.filter((meal) => {
                    const roles = meal.defaultRoles || []
                    return roles.includes('lunch') || roles.includes('dinner')
                })
                setAllMeals(filteredMeals)
                // Set initial random meal
                if (filteredMeals.length > 0) {
                    const randomIndex = Math.floor(
                        Math.random() * filteredMeals.length
                    )
                    setRandomMeal(filteredMeals[randomIndex])
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
    }, [])

    // Function to get a new random meal
    const raffleNewMeal = () => {
        if (allMeals.length > 0) {
            const randomIndex = Math.floor(Math.random() * allMeals.length)
            setRandomMeal(allMeals[randomIndex])
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
                    Ei lounas- tai päivällisaterioita
                </CustomText>
            </View>
        )
    }

    // Use iconImage prop if provided, otherwise use meal's image or placeholder
    const displayImage =
        iconImage ||
        (randomMeal.imageUrl
            ? { uri: randomMeal.imageUrl }
            : { uri: PLACEHOLDER_IMAGE_URL })

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
                <CustomText
                    style={[styles.label, isDesktop && styles.desktopLabel]}
                >
                    Mitä syötäisiin tänään?
                </CustomText>
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
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9C86FC',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    desktopLabel: {
        fontSize: 14,
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
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
