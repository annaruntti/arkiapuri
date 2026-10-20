import { Alert } from 'react-native'
import axios from 'axios'

import { getServerUrl } from '../utils/getServerUrl'
import {
    EATING_BEFORE_COOKING_MESSAGE,
    isAnyDateBeforeCooking,
} from '../utils/mealDates'
import {
    formatMealAddedSuccessMessage,
    formatSelectedDatesForMeal,
} from '../utils/weekMealMove'

/**
 * Assign an existing meal onto selected week calendar dates.
 */
const useWeekMealAssign = ({
    selectedDates,
    dates,
    fetchMealData,
    setIsModalVisible,
    getAuthTokenOrPrompt,
}) => {
    const handleSelectMeal = async (meal) => {
        if (isAnyDateBeforeCooking(selectedDates, meal.plannedCookingDate)) {
            Alert.alert('Virhe', EATING_BEFORE_COOKING_MESSAGE)
            return
        }

        try {
            const token = await getAuthTokenOrPrompt('sync')
            if (!token) return
            const formattedDates = formatSelectedDatesForMeal(selectedDates)

            await axios.put(
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

            fetchMealData(dates)
            setIsModalVisible(false)
            Alert.alert(
                'Onnistui',
                formatMealAddedSuccessMessage(selectedDates)
            )
        } catch (error) {
            console.error('Error updating meal:', error.response?.data || error)
            if (error.response?.status === 404) {
                Alert.alert(
                    'Virhe',
                    'Ateriaa ei löytynyt tai sinulla ei ole oikeuksia muokata sitä.'
                )
            } else {
                Alert.alert(
                    'Virhe',
                    'Aterian päivämäärän päivitys epäonnistui: ' +
                        (error.response?.data?.message || error.message)
                )
            }
        }
    }

    return { handleSelectMeal }
}

export default useWeekMealAssign
