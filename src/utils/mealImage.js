import axios from 'axios'
import { Platform } from 'react-native'
import { getServerUrl } from './getServerUrl'
import { pickImageAsset } from './pickImageAsset'
import storage from './storage'

/**
 * Prompt the user for a meal image and resolve to an ImagePicker asset, or null.
 */
export const pickMealImage = () => pickImageAsset()

/**
 * Upload a local ImagePicker asset to an existing meal and return the updated meal.
 */
export const uploadMealImage = async (mealId, imageFile) => {
    const token = await storage.getItem('userToken')
    if (!token) {
        throw new Error('No token found')
    }

    const formData = new FormData()

    if (Platform.OS === 'web' && imageFile.uri.startsWith('blob:')) {
        const response = await fetch(imageFile.uri)
        const blob = await response.blob()
        const file = new File([blob], 'meal.jpg', { type: 'image/jpeg' })
        formData.append('mealImage', file)
    } else {
        formData.append('mealImage', {
            uri: imageFile.uri,
            type: 'image/jpeg',
            name: 'meal.jpg',
        })
    }

    const response = await axios.post(
        getServerUrl(`/meals/${mealId}/image`),
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        }
    )

    if (response.data.success) {
        return response.data.meal
    }
    return null
}
