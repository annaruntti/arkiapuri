import axios from 'axios'
import { Alert, Platform } from 'react-native'
import { getServerUrl } from './getServerUrl'
import { pickImageAsset } from './pickImageAsset'
import storage from './storage'

const authHeaders = async () => {
    const token = await storage.getItem('userToken')
    if (!token) throw new Error('No token found')
    return { Authorization: `Bearer ${token}` }
}

/**
 * Prompt for a food-item image (same picker UX as meals).
 */
export const pickFoodItemImage = (copyOverrides = {}) =>
    pickImageAsset({
        title: 'Select Image',
        message: 'Choose how you want to add an image',
        cameraDenied: 'Sorry, we need camera permissions to make this work!',
        libraryDenied:
            'Sorry, we need camera roll permissions to make this work!',
        cameraError: 'Failed to open camera',
        pickError: 'Failed to pick image',
        ...copyOverrides,
    })

/**
 * Ensure a pantry/shopping row has a catalog food item id (find-or-create).
 */
export const ensureCatalogFoodItemId = async (item) => {
    if (!item) throw new Error('Food item not found')

    const existingId = item.foodId?._id || item.foodId
    if (existingId) return String(existingId)

    const headers = await authHeaders()
    const createResponse = await axios.post(
        getServerUrl('/food-items/find-or-create'),
        {
            name: item.name,
            category: item.category || [],
            unit: item.unit,
            calories: item.calories || 0,
            price: item.price || 0,
        },
        { headers }
    )

    if (!createResponse.data.success) {
        throw new Error('Could not create food item for image upload')
    }
    return String(createResponse.data.foodItem._id)
}

/**
 * Upload a local ImagePicker asset to an existing food item.
 * API field name is historically `mealImage`.
 */
export const uploadFoodItemImage = async (foodItemId, imageFile) => {
    const headers = await authHeaders()
    const formData = new FormData()

    if (Platform.OS === 'web' && imageFile.uri.startsWith('blob:')) {
        const response = await fetch(imageFile.uri)
        const blob = await response.blob()
        const file = new File([blob], 'food-item.jpg', {
            type: 'image/jpeg',
        })
        formData.append('mealImage', file)
    } else {
        formData.append('mealImage', {
            uri: imageFile.uri,
            type: 'image/jpeg',
            name: 'food-item.jpg',
        })
    }

    const response = await axios.post(
        getServerUrl(`/food-items/${foodItemId}/image`),
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...headers,
            },
        }
    )

    if (response.data.success) {
        return response.data.foodItem
    }
    throw new Error('Upload failed: ' + (response.data.message || 'unknown'))
}

/** Delete the image on a catalog food item. */
export const deleteFoodItemImage = async (foodItemId) => {
    const headers = await authHeaders()
    const response = await axios.delete(
        getServerUrl(`/food-items/${foodItemId}/image`),
        { headers }
    )
    if (response.data.success) {
        return response.data.foodItem
    }
    throw new Error('Delete failed: ' + (response.data.message || 'unknown'))
}

/** Confirm + delete food-item image; resolves true when removed. */
export const confirmDeleteFoodItemImage = (foodItemId) =>
    new Promise((resolve) => {
        Alert.alert('Poista kuva', 'Haluatko varmasti poistaa kuvan?', [
            {
                text: 'Peruuta',
                style: 'cancel',
                onPress: () => resolve(false),
            },
            {
                text: 'Poista',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteFoodItemImage(foodItemId)
                        resolve(true)
                    } catch (error) {
                        console.error('Error removing food item image:', error)
                        Alert.alert('Virhe', 'kuvan poistaminen epäonnistui')
                        resolve(false)
                    }
                },
            },
        ])
    })
