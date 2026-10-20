import { format } from 'date-fns'

/**
 * Replace one planned eating date with another (calendar move / drop).
 */
export const rebuildEatingDatesAfterMove = (
    plannedEatingDates,
    fromDate,
    toDate
) => {
    const fromDateStr = format(fromDate, 'yyyy-MM-dd')
    const currentDates = plannedEatingDates || []
    return currentDates
        .filter((dateStr) => {
            const mealDate = format(new Date(dateStr), 'yyyy-MM-dd')
            return mealDate !== fromDateStr
        })
        .concat([format(toDate, 'yyyy-MM-dd') + 'T00:00:00.000Z'])
}

export const isSameCalendarDay = (a, b) =>
    format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd')
