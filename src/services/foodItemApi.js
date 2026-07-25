import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

export const getAuthHeaders = async () => {
    const token = await storage.getItem('userToken')
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    }
}

export const createFoodItem = async (foodItemData) => {
    const headers = await getAuthHeaders()
    const response = await axios.post(
        getServerUrl('/food-items'),
        foodItemData,
        { headers }
    )
    return response.data
}

export const findOrCreateFoodItem = async (foodItemData) => {
    const headers = await getAuthHeaders()
    const response = await axios.post(
        getServerUrl('/food-items/find-or-create'),
        foodItemData,
        { headers }
    )
    return response.data
}
