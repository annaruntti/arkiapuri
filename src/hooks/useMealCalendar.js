import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import axios from 'axios'
import { format } from 'date-fns'
import { getServerUrl } from '../utils/getServerUrl'
import { useLogin } from '../context/LoginProvider'
import storage from '../utils/storage'
import {
    EATING_BEFORE_COOKING_MESSAGE,
    isAnyDateBeforeCooking,
    toStoredMealDate,
    toStoredMealDates,
} from '../utils/mealDates'
import { parseMealCategories } from '../utils/mealUtils'

/**
 * Custom hook for managing meal calendar operations
 * Shared between TableWeek and TableMonth components
 */
export const useMealCalendar = ({ onRequireLogin }) => {
    const { continueWithoutLogin } = useLogin()
    const [mealsByDate, setMealsByDate] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedDates, setSelectedDates] = useState([])
    const [availableMeals, setAvailableMeals] = useState([])
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)

    const getAuthTokenOrPrompt = async (trigger = 'sync', action = null) => {
        const token = await storage.getItem('userToken')
        if (!token) {
            if (continueWithoutLogin) return 'guest'
            if (onRequireLogin) {
                onRequireLogin(trigger, action)
            }
            return null
        }
        return token
    }

    const fetchMealData = useCallback(async (datesToFetch) => {
        try {
            setIsLoading(true)
            const token = await storage.getItem('userToken')

            if (!token) {
                setMealsByDate({})
                return
            }

            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                const allMeals = response.data.meals || []
                const mealsByDateObj = {}

                // Initialize all dates with empty arrays
                datesToFetch.forEach((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    mealsByDateObj[dateStr] = []
                })

                // Group meals by their planned eating dates
                allMeals.forEach((meal) => {
                    if (meal.plannedEatingDates && meal.plannedEatingDates.length > 0) {
                        meal.plannedEatingDates.forEach((dateStr) => {
                            const mealDate = format(new Date(dateStr), 'yyyy-MM-dd')
                            if (mealsByDateObj[mealDate]) {
                                mealsByDateObj[mealDate].push(meal)
                            }
                        })
                    } else if (meal.plannedCookingDate) {
                        const mealDate = format(new Date(meal.plannedCookingDate), 'yyyy-MM-dd')
                        if (mealsByDateObj[mealDate]) {
                            mealsByDateObj[mealDate].push(meal)
                        }
                    }
                })

                setMealsByDate(mealsByDateObj)
            }
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error('Error fetching meal data:', error)
                Alert.alert('Virhe', 'Aterioiden haku epäonnistui')
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Opens the meal selection modal for a given date.
    // This function does not check auth so safe to use as a retry action.
    const openMealSelectModal = async (date, token = null) => {
        try {
            setSelectedDates([date])
            if (token && token !== 'guest') {
                const response = await axios.get(getServerUrl('/meals'), {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (response.data.success) {
                    setAvailableMeals(response.data.meals || [])
                }
            } else {
                setAvailableMeals([])
            }
            setIsModalVisible(true)
        } catch (error) {
            console.error('Error fetching available meals:', error)
            Alert.alert('Virhe', 'Aterioiden haku epäonnistui')
        }
    }

    const handleDatePress = async (date) => {
        const token = await storage.getItem('userToken')
        if (!token) {
            if (continueWithoutLogin) {
                openMealSelectModal(date)
            } else if (onRequireLogin) {
                onRequireLogin('sync', () => openMealSelectModal(date))
            }
            return
        }
        openMealSelectModal(date, token)
    }

    const handleMealSelection = async (meal, refreshCallback) => {
        if (selectedDates.length === 0) return

        if (isAnyDateBeforeCooking(selectedDates, meal.plannedCookingDate)) {
            Alert.alert('Virhe', EATING_BEFORE_COOKING_MESSAGE)
            return
        }

        try {
            const token = await getAuthTokenOrPrompt('sync')
            if (!token) return
            
            const formattedDates = toStoredMealDates(selectedDates)

            const response = await axios.put(
                getServerUrl(`/meals/${meal._id}`),
                {
                    plannedEatingDates: formattedDates,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (response.data.success) {
                refreshCallback()
                setIsModalVisible(false)
                const dateText =
                    selectedDates.length === 1
                        ? format(selectedDates[0], 'd.M.yyyy')
                        : `${selectedDates.length} päivälle`
                Alert.alert(`Ateria lisätty ${dateText}`)
            }
        } catch (error) {
            console.error('Error adding meal to date:', error)
            Alert.alert('Virhe', 'Aterian lisääminen epäonnistui')
        }
    }

    const updateMealDates = async (mealId, newDates, refreshCallback) => {
        try {
            const token = await getAuthTokenOrPrompt('sync')
            if (!token) return

            await axios.put(
                getServerUrl(`/meals/${mealId}`),
                {
                    plannedEatingDates: toStoredMealDates(newDates),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            refreshCallback()
        } catch (error) {
            console.error('Error updating meal dates:', error)
            Alert.alert('Virhe', 'Aterian päivittäminen epäonnistui')
        }
    }

    const deleteMealCompletely = async (mealId, refreshCallback) => {
        try {
            const token = await getAuthTokenOrPrompt('sync')
            if (!token) return

            await axios.delete(getServerUrl(`/meals/${mealId}`), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            refreshCallback()
            Alert.alert('Onnistui', 'Ateria poistettu kokonaan')
        } catch (error) {
            console.error('Error deleting meal:', error)
            Alert.alert('Virhe', 'Aterian poistaminen epäonnistui')
        }
    }

    const handleMealPress = (meal) => {
        setSelectedMeal(meal)
        setDetailModalVisible(true)
    }

    const handleMealUpdate = async (mealId, updatedMeal, refreshCallback) => {
        try {
            if (!mealId || !updatedMeal) {
                console.error('Missing mealId or updatedMeal')
                return false
            }

            const token = await getAuthTokenOrPrompt('sync')
            if (!token) return false

            const cleanedMeal = {
                name: updatedMeal.name,
                recipe: updatedMeal.recipe,
                recipeSteps: Array.isArray(updatedMeal.recipeSteps)
                    ? updatedMeal.recipeSteps
                    : [],
                difficultyLevel: updatedMeal.difficultyLevel,
                cookingTime: updatedMeal.cookingTime,
                defaultRoles: updatedMeal.defaultRoles,
                mealCategory: parseMealCategories(updatedMeal.mealCategory, []),
                plannedCookingDate: toStoredMealDate(
                    updatedMeal.plannedCookingDate
                ),
                plannedEatingDates: toStoredMealDates(
                    updatedMeal.plannedEatingDates
                ),
                servings: updatedMeal.servings,
                foodItems: Array.isArray(updatedMeal.foodItems)
                    ? updatedMeal.foodItems.map((item) =>
                          typeof item === 'object'
                              ? {
                                    foodId: item.foodId || item._id,
                                    quantity: item.quantity,
                                    unit: item.unit,
                                }
                              : item
                      )
                    : [],
            }

            if (updatedMeal.image?.url) {
                cleanedMeal.image = updatedMeal.image
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
                refreshCallback()
                return true
            }
            return false
        } catch (error) {
            console.error('Error updating meal:', error)
            Alert.alert('Virhe', 'Aterian päivittäminen epäonnistui')
            return false
        }
    }

    return {
        // State
        mealsByDate,
        isLoading,
        isModalVisible,
        selectedDates,
        availableMeals,
        selectedMeal,
        detailModalVisible,
        
        // Setters
        setIsModalVisible,
        setSelectedDates,
        setDetailModalVisible,
        setMealsByDate,
        setAvailableMeals,
        
        // Methods
        fetchMealData,
        handleDatePress,
        handleMealSelection,
        updateMealDates,
        deleteMealCompletely,
        handleMealPress,
        handleMealUpdate,
        getAuthTokenOrPrompt,
    }
}
