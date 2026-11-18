import axios from 'axios'
import { getServerUrl } from './getServerUrl'
import { showAlert } from './showAlert'
import storage from './storage'

const authHeaders = async () => {
    const token = await storage.getItem('userToken')
    if (!token) throw new Error('Kirjautuminen vaaditaan')
    return { Authorization: `Bearer ${token}` }
}

export const publishFoodItemToOpenCatalog = async (foodItemId) => {
    if (!foodItemId) throw new Error('Elintarvikkeen tunniste puuttuu')
    const headers = await authHeaders()
    const response = await axios.post(
        getServerUrl('/admin/catalog/food-items'),
        { foodItemId },
        { headers }
    )
    if (!response.data?.success) {
        throw new Error(response.data?.message || 'Julkaisu epäonnistui')
    }
    return response.data.foodItem
}

export const publishMealToOpenCatalog = async (mealId) => {
    if (!mealId) throw new Error('Aterian tunniste puuttuu')
    const headers = await authHeaders()
    const response = await axios.post(
        getServerUrl('/admin/catalog/meals'),
        { mealId },
        { headers }
    )
    if (!response.data?.success) {
        throw new Error(response.data?.message || 'Julkaisu epäonnistui')
    }
    return response.data.meal
}

export const updateOpenCatalogFoodItem = async (id, body) => {
    const headers = await authHeaders()
    const response = await axios.put(
        getServerUrl(`/admin/catalog/food-items/${id}`),
        body,
        { headers }
    )
    if (!response.data?.success) {
        throw new Error(response.data?.message || 'Tallennus epäonnistui')
    }
    return response.data.foodItem
}

export const updateOpenCatalogMeal = async (id, body) => {
    const headers = await authHeaders()
    const response = await axios.put(
        getServerUrl(`/admin/catalog/meals/${id}`),
        body,
        { headers }
    )
    if (!response.data?.success) {
        throw new Error(response.data?.message || 'Tallennus epäonnistui')
    }
    return response.data.meal
}

export const alertPublishSuccess = (kind = 'food') => {
    showAlert(
        'Lisätty avoimeen katalogiin',
        kind === 'meal'
            ? 'Ateria on nyt kaikkien käyttäjien katalogissa.'
            : 'Elintarvike on nyt kaikkien käyttäjien katalogissa.'
    )
}

export const alertPublishError = (error) => {
    showAlert(
        'Virhe',
        error?.response?.data?.message ||
            error?.message ||
            'Lisäys avoimeen katalogiin epäonnistui'
    )
}
