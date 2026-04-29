import { Alert } from 'react-native'
import { format } from 'date-fns'

/**
 * Shared utility functions for meal calendar operations
 */

/**
 * Remove a meal from a specific date
 */
export const removeMealFromDate = async (meal, date, updateMealDates) => {
    try {
        const currentDates = meal.plannedEatingDates || []

        // If meal has no plannedEatingDates, it's using plannedCookingDate
        if (currentDates.length === 0 && meal.plannedCookingDate) {
            const cookingDate = format(
                new Date(meal.plannedCookingDate),
                'yyyy-MM-dd'
            )
            const targetDate = format(date, 'yyyy-MM-dd')

            if (cookingDate === targetDate) {
                await updateMealDates(meal._id, [])
                return
            } else {
                Alert.alert(
                    'Info',
                    'Tämä ateria käyttää valmistuspäivää. Poista ateria kokonaan tai muuta sen päivämäärää.'
                )
                return
            }
        }

        // Format the target date for comparison
        const targetDateStr = format(date, 'yyyy-MM-dd')

        // Filter out the selected date
        const newDates = currentDates.filter((dateStr) => {
            const mealDate = format(new Date(dateStr), 'yyyy-MM-dd')
            return mealDate !== targetDateStr
        })

        await updateMealDates(meal._id, newDates)
    } catch (error) {
        console.error('Error removing meal from date:', error)
        Alert.alert('Virhe', 'Aterian poistaminen epäonnistui')
    }
}

/**
 * Toggle date selection in multi-select mode
 */
export const toggleDateSelection = (date, selectedDates, setSelectedDates) => {
    setSelectedDates((prev) => {
        const isSelected = prev.some((d) => d.getTime() === date.getTime())
        if (isSelected) {
            return prev.filter((d) => d.getTime() !== date.getTime())
        } else {
            return [...prev, date]
        }
    })
}

/**
 * Clear all selected dates
 */
export const clearDateSelection = (setSelectedDates) => {
    setSelectedDates([])
}

/**
 * Check if a date is selected
 */
export const isDateSelected = (date, selectedDates) => {
    return selectedDates.some((d) => d.getTime() === date.getTime())
}

/**
 * Get meals for a specific date
 */
export const getMealsForDate = (date, mealsByDate) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return mealsByDate[dateStr] || []
}
