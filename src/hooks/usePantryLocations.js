import { Alert } from 'react-native'
import {
    addPantryLocation,
    deletePantryLocation,
    updatePantryLocation,
} from '../services/collectionApi'
import storage from '../utils/storage'

const ALL_LOCATIONS_ID = 'all'

/**
 * Pantry location CRUD wired to collection API + refresh.
 */
const usePantryLocations = ({
    fetchPantryItems,
    selectedLocationId,
    setSelectedLocationId,
    showLoginPrompt,
}) => {
    const handleAddLocation = async ({ type, name }) => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) {
                showLoginPrompt?.('save')
                return
            }
            await addPantryLocation({ type, name })
            await fetchPantryItems()
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.message ||
                    'Säilytyspaikan lisääminen epäonnistui'
            )
        }
    }

    const handleRenameLocation = async (locationId, updates) => {
        try {
            await updatePantryLocation(locationId, updates)
            await fetchPantryItems()
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.message ||
                    'Säilytyspaikan päivitys epäonnistui'
            )
        }
    }

    const handleDeleteLocation = async (locationId) => {
        try {
            await deletePantryLocation(locationId)
            await fetchPantryItems()
            if (selectedLocationId === String(locationId)) {
                setSelectedLocationId(ALL_LOCATIONS_ID)
            }
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.message ||
                    'Säilytyspaikan poisto epäonnistui'
            )
        }
    }

    return {
        handleAddLocation,
        handleRenameLocation,
        handleDeleteLocation,
    }
}

export default usePantryLocations
export { ALL_LOCATIONS_ID }
