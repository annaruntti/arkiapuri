import axios from 'axios'
import { Alert, Platform } from 'react-native'

import { getServerUrl } from './getServerUrl'
import {
    EATING_BEFORE_COOKING_MESSAGE,
    isAnyDateBeforeCooking,
} from './mealDates'
import {
    isSameCalendarDay,
    rebuildEatingDatesAfterMove,
} from './weekMealMove'

/**
 * Persist a meal move/drop to a new calendar day.
 * @returns {'noop'|'before_cooking'|'unauthorized'|'ok'|'error'}
 */
export const submitMealDayMove = async ({
    meal,
    fromDate,
    toDate,
    getToken,
}) => {
    if (!meal || !fromDate || !toDate) return 'noop'
    if (isSameCalendarDay(fromDate, toDate)) return 'noop'

    if (isAnyDateBeforeCooking([toDate], meal.plannedCookingDate)) {
        return 'before_cooking'
    }

    const token = await getToken()
    if (!token) return 'unauthorized'

    const updatedDates = rebuildEatingDatesAfterMove(
        meal.plannedEatingDates,
        fromDate,
        toDate
    )

    await axios.put(
        getServerUrl(`/meals/${meal._id}`),
        { plannedEatingDates: updatedDates },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }
    )

    return 'ok'
}

export const alertMealMoveBeforeCooking = () => {
    Alert.alert('Virhe', EATING_BEFORE_COOKING_MESSAGE)
}

export const alertMealMoveFailed = () => {
    if (Platform.OS === 'web') {
        alert('Virhe: Aterian siirtäminen epäonnistui')
    } else {
        Alert.alert('Virhe', 'Aterian siirtäminen epäonnistui')
    }
}

export const alertMealMoveSuccess = () => {
    if (Platform.OS !== 'web') {
        Alert.alert('Valmis!', 'Ateria siirretty')
    }
}
