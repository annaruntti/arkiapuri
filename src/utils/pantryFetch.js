import { DEFAULT_PANTRY_LOCATIONS } from './pantryLocations'
import {
    decoratePantryItems,
    mergeDuplicatePantryItems,
} from './pantryItemMerge'

/**
 * Normalize a successful GET /pantry payload into UI state pieces.
 */
export const parsePantryFetchResponse = (data) => {
    const pantry = data?.pantry || {}
    const locations = pantry.locations?.length
        ? pantry.locations
        : DEFAULT_PANTRY_LOCATIONS
    const items = pantry.items || data?.items || []
    return {
        locations,
        removalSuggestions: pantry.removalSuggestions || [],
        items: decoratePantryItems(mergeDuplicatePantryItems(items), locations),
    }
}

export const pantryFetchErrorMessage = (error) =>
    'Pentterin tietojen haku epäonnistui: ' +
    (error?.message === 'timeout exceeded'
        ? 'Yhteys aikakatkaistiin'
        : error?.message || 'Tuntematon virhe')
