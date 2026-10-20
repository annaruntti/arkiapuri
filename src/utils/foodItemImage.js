import axios from 'axios'
import { Platform } from 'react-native'
import { getServerUrl } from './getServerUrl'
import { pickImageAsset } from './pickImageAsset'
import storage from './storage'

/**
 * Prompt for a food-item image (same picker UX as meals).
 */
export const pickFoodItemImage = () =>
    pickImageAsset({
        title: 'Select Image',
        message: 'Choose how you want to add an image',
        cameraDenied: 'Sorry, we need camera permissions to make this work!',
        libraryDenied:
            'Sorry, we need camera roll permissions to make this work!',
        cameraError: 'Failed to open camera',
        pickError: 'Failed to pick image',
    })

/**
 * Upload a local ImagePicker asset to an existing food item.
 * API field name is historically `mealImage`.
 */
export const uploadFoodItemImage = async (foodItemId, imageFile) => {
    const token = await storage.getItem('userToken')
    if (!token) {
        throw new Error('No token found')
    }

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
                Authorization: `Bearer ${token}`,
            },
        }
    )

    if (response.data.success) {
        return response.data.foodItem
    }
    throw new Error('Upload failed: ' + (response.data.message || 'unknown'))
}
