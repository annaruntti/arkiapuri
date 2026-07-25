/**
 * Shared list sorting helpers for meals, pantry, shopping list, etc.
 */

export const SORT_OPTION_IDS = {
    NAME_ASC: 'name-asc',
    NAME_DESC: 'name-desc',
    ADDED_DESC: 'added-desc',
    ADDED_ASC: 'added-asc',
    EXPIRATION_ASC: 'expiration-asc',
    EXPIRATION_DESC: 'expiration-desc',
    PLANNED_ASC: 'planned-asc',
    PLANNED_DESC: 'planned-desc',
}

/** Discrete sort choices — one button per direction. */
export const MEAL_SORT_OPTIONS = [
    {
        id: SORT_OPTION_IDS.NAME_ASC,
        label: 'Aakkosjärjestys A–Ö',
        shortLabel: 'A–Ö',
    },
    {
        id: SORT_OPTION_IDS.NAME_DESC,
        label: 'Aakkosjärjestys Ö–A',
        shortLabel: 'Ö–A',
    },
    {
        id: SORT_OPTION_IDS.PLANNED_ASC,
        label: 'Valmistuspäivämäärä · aikaisimmat ensin',
        shortLabel: 'Valmistus · aikaisimmat',
    },
    {
        id: SORT_OPTION_IDS.PLANNED_DESC,
        label: 'Valmistuspäivämäärä · myöhemmät ensin',
        shortLabel: 'Valmistus · myöhemmät',
    },
]

export const PANTRY_SORT_OPTIONS = [
    {
        id: SORT_OPTION_IDS.NAME_ASC,
        label: 'Aakkosjärjestys A–Ö',
        shortLabel: 'A–Ö',
    },
    {
        id: SORT_OPTION_IDS.NAME_DESC,
        label: 'Aakkosjärjestys Ö–A',
        shortLabel: 'Ö–A',
    },
    {
        id: SORT_OPTION_IDS.EXPIRATION_ASC,
        label: 'Parasta ennen · vanhimmat ensin',
        shortLabel: 'Parasta ennen · vanhimmat',
    },
    {
        id: SORT_OPTION_IDS.EXPIRATION_DESC,
        label: 'Parasta ennen · uusimmat ensin',
        shortLabel: 'Parasta ennen · uusimmat',
    },
    {
        id: SORT_OPTION_IDS.ADDED_DESC,
        label: 'Lisäyspäivämäärä · uusimmat ensin',
        shortLabel: 'Lisätty · uusimmat',
    },
    {
        id: SORT_OPTION_IDS.ADDED_ASC,
        label: 'Lisäyspäivämäärä · vanhimmat ensin',
        shortLabel: 'Lisätty · vanhimmat',
    },
]

export const SHOPPING_SORT_OPTIONS = [
    {
        id: SORT_OPTION_IDS.NAME_ASC,
        label: 'Aakkosjärjestys A–Ö',
        shortLabel: 'A–Ö',
    },
    {
        id: SORT_OPTION_IDS.NAME_DESC,
        label: 'Aakkosjärjestys Ö–A',
        shortLabel: 'Ö–A',
    },
    {
        id: SORT_OPTION_IDS.ADDED_DESC,
        label: 'Lisäyspäivämäärä · uusimmat ensin',
        shortLabel: 'Lisätty · uusimmat',
    },
    {
        id: SORT_OPTION_IDS.ADDED_ASC,
        label: 'Lisäyspäivämäärä · vanhimmat ensin',
        shortLabel: 'Lisätty · vanhimmat',
    },
]

export const FOOD_ITEM_SORT_OPTIONS = [
    {
        id: SORT_OPTION_IDS.NAME_ASC,
        label: 'Aakkosjärjestys A–Ö',
        shortLabel: 'A–Ö',
    },
    {
        id: SORT_OPTION_IDS.NAME_DESC,
        label: 'Aakkosjärjestys Ö–A',
        shortLabel: 'Ö–A',
    },
    {
        id: SORT_OPTION_IDS.EXPIRATION_ASC,
        label: 'Parasta ennen · vanhimmat ensin',
        shortLabel: 'Parasta ennen · vanhimmat',
    },
    {
        id: SORT_OPTION_IDS.EXPIRATION_DESC,
        label: 'Parasta ennen · uusimmat ensin',
        shortLabel: 'Parasta ennen · uusimmat',
    },
    {
        id: SORT_OPTION_IDS.ADDED_DESC,
        label: 'Lisäyspäivämäärä · uusimmat ensin',
        shortLabel: 'Lisätty · uusimmat',
    },
    {
        id: SORT_OPTION_IDS.ADDED_ASC,
        label: 'Lisäyspäivämäärä · vanhimmat ensin',
        shortLabel: 'Lisätty · vanhimmat',
    },
]

export const getSortOptionById = (options, sortId) =>
    options.find((option) => option.id === sortId) || null

export const getSortOptionLabel = (options, sortId, { short = false } = {}) => {
    const option = getSortOptionById(options, sortId)
    if (!option) return 'Järjestä'
    return short
        ? option.shortLabel || option.label
        : option.label
}

const toTime = (value) => {
    if (!value) return null
    const time = new Date(value).getTime()
    return Number.isFinite(time) ? time : null
}

/** Best-effort added/created timestamp for list rows (incl. Mongo ObjectId). */
export const getItemAddedAt = (item) => {
    if (!item) return null

    const direct =
        toTime(item.createdAt) ||
        toTime(item.addedAt) ||
        toTime(item.updatedAt)
    if (direct != null) return direct

    const food =
        item.foodId && typeof item.foodId === 'object' ? item.foodId : null
    const fromFood = toTime(food?.createdAt) || toTime(food?.updatedAt)
    if (fromFood != null) return fromFood

    const id = item._id
    if (id && typeof id === 'object' && typeof id.getTimestamp === 'function') {
        return id.getTimestamp().getTime()
    }
    if (typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)) {
        return parseInt(id.substring(0, 8), 16) * 1000
    }

    return null
}

export const getItemExpirationAt = (item) => {
    if (!item) return null
    const food =
        item.foodId && typeof item.foodId === 'object' ? item.foodId : null
    return (
        toTime(item.expirationDate) ||
        toTime(item.expireDay) ||
        toTime(food?.expirationDate) ||
        toTime(food?.expireDay)
    )
}

export const getItemPlannedAt = (item) => {
    if (!item) return null
    const plannedEating = Array.isArray(item.plannedEatingDates)
        ? item.plannedEatingDates[0]
        : null
    return toTime(item.plannedCookingDate) || toTime(plannedEating)
}

const compareText = (a, b) =>
    String(a || '')
        .localeCompare(String(b || ''), 'fi', { sensitivity: 'base' })

/**
 * Sort a list by a shared sort option id.
 * Missing dates sort last for ascending date sorts, first for descending.
 */
export const sortListItems = (items = [], sortId = SORT_OPTION_IDS.NAME_ASC) => {
    if (!Array.isArray(items) || items.length < 2) {
        return Array.isArray(items) ? [...items] : []
    }

    const sorted = [...items]

    switch (sortId) {
        case SORT_OPTION_IDS.NAME_DESC:
            return sorted.sort((a, b) => compareText(b?.name, a?.name))

        case SORT_OPTION_IDS.ADDED_ASC:
            return sorted.sort((a, b) => {
                const aTime = getItemAddedAt(a)
                const bTime = getItemAddedAt(b)
                if (aTime == null && bTime == null) return compareText(a?.name, b?.name)
                if (aTime == null) return 1
                if (bTime == null) return -1
                return aTime - bTime || compareText(a?.name, b?.name)
            })

        case SORT_OPTION_IDS.ADDED_DESC:
            return sorted.sort((a, b) => {
                const aTime = getItemAddedAt(a)
                const bTime = getItemAddedAt(b)
                if (aTime == null && bTime == null) return compareText(a?.name, b?.name)
                if (aTime == null) return 1
                if (bTime == null) return -1
                return bTime - aTime || compareText(a?.name, b?.name)
            })

        case SORT_OPTION_IDS.EXPIRATION_ASC:
            return sorted.sort((a, b) => {
                const aTime = getItemExpirationAt(a)
                const bTime = getItemExpirationAt(b)
                if (aTime == null && bTime == null) return compareText(a?.name, b?.name)
                if (aTime == null) return 1
                if (bTime == null) return -1
                return aTime - bTime || compareText(a?.name, b?.name)
            })

        case SORT_OPTION_IDS.EXPIRATION_DESC:
            return sorted.sort((a, b) => {
                const aTime = getItemExpirationAt(a)
                const bTime = getItemExpirationAt(b)
                if (aTime == null && bTime == null) return compareText(a?.name, b?.name)
                if (aTime == null) return 1
                if (bTime == null) return -1
                return bTime - aTime || compareText(a?.name, b?.name)
            })

        case SORT_OPTION_IDS.PLANNED_ASC:
            return sorted.sort((a, b) => {
                const aTime = getItemPlannedAt(a)
                const bTime = getItemPlannedAt(b)
                if (aTime == null && bTime == null) return compareText(a?.name, b?.name)
                if (aTime == null) return 1
                if (bTime == null) return -1
                return aTime - bTime || compareText(a?.name, b?.name)
            })

        case SORT_OPTION_IDS.PLANNED_DESC:
            return sorted.sort((a, b) => {
                const aTime = getItemPlannedAt(a)
                const bTime = getItemPlannedAt(b)
                if (aTime == null && bTime == null) return compareText(a?.name, b?.name)
                if (aTime == null) return 1
                if (bTime == null) return -1
                return bTime - aTime || compareText(a?.name, b?.name)
            })

        case SORT_OPTION_IDS.NAME_ASC:
        default:
            return sorted.sort((a, b) => compareText(a?.name, b?.name))
    }
}
