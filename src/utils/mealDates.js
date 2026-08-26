export const OVERDUE_COOKING_MESSAGE =
    'Aterian suunniteltu valmistuspäivä on mennyt, valitse uusi päivä.'

export const OVERDUE_EATING_MESSAGE =
    'Aterian suunniteltu syöntipäivä on mennyt, valitse uusi päivä.'

export const EATING_BEFORE_COOKING_MESSAGE =
    'Syöntipäivä ei voi olla ennen valmistuspäivää.'

export const startOfDayDate = (value) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    date.setHours(0, 0, 0, 0)
    return date
}

export const isDateInPast = (value) => {
    const day = startOfDayDate(value)
    const today = startOfDayDate(new Date())
    if (!day || !today) return false
    return day.getTime() < today.getTime()
}

export const isDateBeforeDay = (value, minValue) => {
    const day = startOfDayDate(value)
    const min = startOfDayDate(minValue)
    if (!day || !min) return false
    return day.getTime() < min.getTime()
}

export const laterDate = (...values) => {
    const days = values.map(startOfDayDate).filter(Boolean)
    if (days.length === 0) return startOfDayDate(new Date())
    return days.reduce((latest, day) =>
        day.getTime() > latest.getTime() ? day : latest
    )
}

export const eatingDateMinimum = (cookingDate) =>
    laterDate(cookingDate, new Date())

export const clampDateToMin = (value, minValue) => {
    const day = startOfDayDate(value)
    const min = startOfDayDate(minValue)
    if (!day) return min || startOfDayDate(new Date())
    if (!min) return day
    return day.getTime() < min.getTime() ? min : day
}

export const clampDatesToMin = (dates, minValue) => {
    if (!Array.isArray(dates)) return []
    return dates.map((date) => clampDateToMin(date, minValue))
}

/** Local calendar day as YYYY-MM-DD, so UTC+ timezones do not shift the meal date. */
export const toMealDateKey = (value) => {
    const day = startOfDayDate(value)
    if (!day) return null
    const year = day.getFullYear()
    const month = String(day.getMonth() + 1).padStart(2, '0')
    const date = String(day.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
}

export const toStoredMealDate = (value) => {
    const key = toMealDateKey(value)
    return key ? `${key}T00:00:00.000Z` : null
}

export const toStoredMealDates = (dates) => {
    if (!Array.isArray(dates)) return []
    return [...new Set(dates.map(toStoredMealDate).filter(Boolean))]
}

export const isAnyDateBeforeCooking = (dates, cookingDate) => {
    if (!cookingDate || !Array.isArray(dates) || dates.length === 0) {
        return false
    }
    return dates.some((date) => isDateBeforeDay(date, cookingDate))
}
