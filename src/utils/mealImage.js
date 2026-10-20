import axios from 'axios'
import { Alert, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { getServerUrl } from './getServerUrl'
import storage from './storage'

const IMAGE_PICKER_OPTIONS = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
}

const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS)
    if (!result.canceled) return result.assets[0]
    return null
}

const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
        Alert.alert('Tämä toiminto vaatii kameran käyttöoikeuden.')
        return null
    }
    const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS)
    if (!result.canceled) return result.assets[0]
    return null
}

/**
 * Prompt the user for a meal image and resolve to an ImagePicker asset, or null.
 */
export const pickMealImage = () =>
    new Promise(async (resolve) => {
        try {
            if (Platform.OS === 'web') {
                resolve(await pickFromLibrary())
                return
            }

            Alert.alert('Valitse kuva', 'valitse, miten haluat lisätä kuvan', [
                {
                    text: 'Camera',
                    onPress: async () => {
                        try {
                            resolve(await pickFromCamera())
                        } catch (error) {
                            console.error('Camera error:', error)
                            Alert.alert(
                                'Virhe',
                                'Kameran avaaminen epäonnistui: ' + error.message
                            )
                            resolve(null)
                        }
                    },
                },
                {
                    text: 'Photo Library',
                    onPress: async () => {
                        const { status } =
                            await ImagePicker.requestMediaLibraryPermissionsAsync()
                        if (status !== 'granted') {
                            Alert.alert(
                                'Tämä toiminto vaatii kameran käyttöoikeuden.'
                            )
                            resolve(null)
                            return
                        }
                        resolve(await pickFromLibrary())
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => resolve(null),
                },
            ])
        } catch (error) {
            console.error('Error picking image:', error)
            Alert.alert('Virhe', 'kuvan valitseminen epäonnistui')
            resolve(null)
        }
    })

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
