import { Alert, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

const IMAGE_PICKER_OPTIONS = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
}

const DEFAULT_COPY = {
    title: 'Valitse kuva',
    message: 'valitse, miten haluat lisätä kuvan',
    cameraDenied: 'Tämä toiminto vaatii kameran käyttöoikeuden.',
    libraryDenied: 'Tämä toiminto vaatii kameran käyttöoikeuden.',
    cameraError: 'Kameran avaaminen epäonnistui',
    pickError: 'kuvan valitseminen epäonnistui',
}

const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS)
    if (!result.canceled) return result.assets[0]
    return null
}

const pickFromCamera = async (copy) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
        Alert.alert(copy.cameraDenied)
        return null
    }
    const result = await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS)
    if (!result.canceled) return result.assets[0]
    return null
}

/**
 * Prompt for a camera/library image and resolve to an ImagePicker asset, or null.
 */
export const pickImageAsset = (copyOverrides = {}) => {
    const copy = { ...DEFAULT_COPY, ...copyOverrides }

    return new Promise(async (resolve) => {
        try {
            if (Platform.OS === 'web') {
                resolve(await pickFromLibrary())
                return
            }

            Alert.alert(copy.title, copy.message, [
                {
                    text: 'Camera',
                    onPress: async () => {
                        try {
                            resolve(await pickFromCamera(copy))
                        } catch (error) {
                            console.error('Camera error:', error)
                            Alert.alert(
                                'Virhe',
                                `${copy.cameraError}: ${error.message}`
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
                            Alert.alert(copy.libraryDenied)
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
            Alert.alert('Virhe', copy.pickError)
            resolve(null)
        }
    })
}
