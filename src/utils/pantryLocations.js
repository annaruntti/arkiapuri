export const UNLOCATED_LOCATION_ID = 'none'
export const ALL_LOCATIONS_ID = 'all'

export const LOCATION_TYPE_LABELS = {
    fridge: 'Jääkaappi',
    freezer: 'Pakastin',
    cupboard: 'Kuivakaappi',
}

export const PANTRY_LOCATION_TYPES = ['fridge', 'freezer', 'cupboard']

export const DEFAULT_PANTRY_LOCATIONS = [
    { _id: 'guest-fridge', type: 'fridge', name: 'Jääkaappi' },
    { _id: 'guest-freezer', type: 'freezer', name: 'Pakastin' },
    { _id: 'guest-cupboard', type: 'cupboard', name: 'Kuivakaappi' },
]

export const locationIdOf = (item) => {
    const value = item?.locationId
    if (value == null || value === '') return null
    if (typeof value === 'object') {
        return String(value._id || value.id || '') || null
    }
    return String(value)
}

export const locationNameOf = (item, locations = []) => {
    const id = locationIdOf(item)
    if (!id) return null
    const match = locations.find((location) => String(location._id) === id)
    return match?.name || null
}

export const nextLocationName = (type, locations = []) => {
    const base = LOCATION_TYPE_LABELS[type] || 'Säilytyspaikka'
    const taken = new Set(
        locations.map((location) => String(location.name || '').trim().toLowerCase())
    )
    if (!taken.has(base.toLowerCase())) return base
    let n = 2
    while (taken.has(`${base} ${n}`.toLowerCase())) n += 1
    return `${base} ${n}`
}

export const filterItemsByLocation = (items, selectedLocationId) => {
    if (!selectedLocationId || selectedLocationId === ALL_LOCATIONS_ID) {
        return items
    }
    if (selectedLocationId === UNLOCATED_LOCATION_ID) {
        return items.filter((item) => !locationIdOf(item))
    }
    return items.filter((item) => locationIdOf(item) === selectedLocationId)
}

export const groupItemsByPantryLocation = (items, locations = []) => {
    const buckets = new Map(
        locations.map((location) => [String(location._id), []])
    )
    const unlocated = []

    items.forEach((item) => {
        const id = locationIdOf(item)
        if (id && buckets.has(id)) {
            buckets.get(id).push(item)
            return
        }
        unlocated.push(item)
    })

    const sections = locations
        .filter((location) => buckets.get(String(location._id))?.length)
        .map((location) => ({
            title: location.name,
            data: buckets.get(String(location._id)),
        }))

    if (unlocated.length > 0) {
        sections.push({ title: 'Ei sijaintia', data: unlocated })
    }

    return sections
}

export const removalReasonLabel = (suggestion) => {
    if (suggestion?.reason === 'expired') return 'Vanhentunut'
    if (suggestion?.reason === 'missing_from_photo') {
        return suggestion.locationName
            ? `Ei näkynyt paikan ${suggestion.locationName} kuvassa`
            : 'Ei näkynyt kuvassa'
    }
    return 'Poistoehdotus'
}

export const STORAGE_CATEGORY_BY_TYPE = {
    fridge: { id: '24', name: 'Jääkaappituotteet' },
    freezer: { id: '8', name: 'Pakasteet' },
    cupboard: { id: '22', name: 'Kuivatuotteet' },
}

const storageMatchers = Object.entries(STORAGE_CATEGORY_BY_TYPE).map(
    ([type, category]) => ({
        type,
        values: new Set([
            String(category.id),
            category.name.toLowerCase(),
        ]),
    })
)

const categoryToken = (value) => {
    if (value == null) return ''
    if (typeof value === 'object') return String(value.name || '').trim().toLowerCase()
    return String(value).trim().toLowerCase()
}

export const inferLocationTypeFromCategories = (categories = []) => {
    const tokens = (Array.isArray(categories) ? categories : [])
        .map(categoryToken)
        .filter(Boolean)
    if (!tokens.length) return null
    for (const type of ['freezer', 'fridge', 'cupboard']) {
        const matcher = storageMatchers.find((entry) => entry.type === type)
        if (matcher && tokens.some((token) => matcher.values.has(token))) {
            return type
        }
    }
    return null
}

export const findFirstLocationOfType = (locations = [], type) =>
    locations.find((location) => location.type === type)

export const inferLocationIdFromCategories = (categories, locations = []) => {
    const type = inferLocationTypeFromCategories(categories)
    if (!type) return null
    const location = findFirstLocationOfType(locations, type)
    return location ? String(location._id) : null
}

export const syncStorageCategoryForLocation = (categories = [], type) => {
    const storageTokens = new Set(
        storageMatchers.flatMap((matcher) => [...matcher.values])
    )
    const kept = (Array.isArray(categories) ? categories : [])
        .map((value) =>
            typeof value === 'object' ? String(value?.name || '').trim() : String(value || '').trim()
        )
        .filter(
            (value) =>
                value && !storageTokens.has(value.toLowerCase())
        )
    if (!type || !STORAGE_CATEGORY_BY_TYPE[type]) return kept
    const storageName = STORAGE_CATEGORY_BY_TYPE[type].name
    if (!kept.some((value) => value.toLowerCase() === storageName.toLowerCase())) {
        kept.push(storageName)
    }
    return kept
}
