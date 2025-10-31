import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import { Alert, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import CustomText from './CustomText'

const MealImageUploader = ({ meal, onImageUpdate }) => {
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    const pickImage = async () => {
        try {
            if (Platform.OS === 'web') {
                // For web, only show library option
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 1,
                })

                if (!result.canceled) {
                    await uploadMealImage(result.assets[0])
                }
                return
            }

            // For mobile, show action sheet with options
            Alert.alert('Select Image', 'Choose how you want to add an image', [
                {
                    text: 'Camera',
                    onPress: async () => {
                        try {
                            console.log('Requesting camera permissions...')
                            const { status } =
                                await ImagePicker.requestCameraPermissionsAsync()
                            console.log('Camera permission status:', status)

                            if (status !== 'granted') {
                                Alert.alert(
                                    'Sorry, we need camera permissions to make this work!'
                                )
                                return
                            }

                            console.log('Launching camera...')
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ['images'],
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 1,
                            })

                            console.log('Camera result:', result)
                            if (!result.canceled) {
                                await uploadMealImage(result.assets[0])
                            }
                        } catch (error) {
                            console.error('Camera error:', error)
                            Alert.alert(
                                'Error',
                                'Failed to open camera: ' + error.message
                            )
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
                                'Sorry, we need camera roll permissions to make this work!'
                            )
                            return
                        }

                        const result =
                            await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ['images'],
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 1,
                            })

                        if (!result.canceled) {
                            await uploadMealImage(result.assets[0])
                        }
                    },
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ])
        } catch (error) {
            console.error('Error picking image:', error)
            Alert.alert('Error', 'Failed to pick image')
        }
    }

    const uploadMealImage = async (imageFile) => {
        try {
            setIsUploadingImage(true)
            const token = await storage.getItem('userToken')
            if (!token) {
                throw new Error('No token found')
            }

            const formData = new FormData()

            // Handle web blob URLs differently
            if (Platform.OS === 'web' && imageFile.uri.startsWith('blob:')) {
                // For web, we need to fetch the blob and convert it to a File
                const response = await fetch(imageFile.uri)
                const blob = await response.blob()
                const file = new File([blob], 'meal.jpg', {
                    type: 'image/jpeg',
                })
                formData.append('mealImage', file)
            } else {
                // For mobile platforms
                formData.append('mealImage', {
                    uri: imageFile.uri,
                    type: 'image/jpeg',
                    name: 'meal.jpg',
                })
            }

            const url = getServerUrl(`/meals/${meal._id}/image`)
            console.log('Uploading to URL:', url)

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                console.log('Meal image uploaded successfully')
                // Update the meal data with the new image
                const updatedMeal = { ...meal, image: response.data.meal.image }
                onImageUpdate(updatedMeal)
                Alert.alert('Success', 'Image updated successfully')
            }
        } catch (error) {
            console.error('Error uploading meal image:', error)
            Alert.alert('Error', 'Failed to upload image')
        } finally {
            setIsUploadingImage(false)
        }
    }

    const removeMealImage = () => {
        Alert.alert(
            'Remove Image',
            'Are you sure you want to remove this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await storage.getItem('userToken')
                            if (!token) {
                                throw new Error('No token found')
                            }

                            // Call backend to remove image
                            const response = await axios.delete(
                                getServerUrl(`/meals/${meal._id}/image`),
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            )

                            if (response.data.success) {
                                console.log('Meal image removed successfully')
                                // Update the meal data to remove the image
                                const updatedMeal = { ...meal, image: null }
                                onImageUpdate(updatedMeal)
                                Alert.alert(
                                    'Success',
                                    'Image removed successfully'
                                )
                            }
                        } catch (error) {
                            console.error('Error removing meal image:', error)
                            Alert.alert('Error', 'Failed to remove image')
                        }
                    },
                },
            ]
        )
    }

    if (meal.image && meal.image.url) {
        return (
            <View style={styles.mealImageContainer}>
                <Image
                    source={{ uri: meal.image.url }}
                    style={styles.mealImage}
                    resizeMode="cover"
                />
                <View style={styles.imageActions}>
                    <TouchableOpacity
                        style={styles.imageActionButton}
                        onPress={pickImage}
                        disabled={isUploadingImage}
                    >
                        <MaterialIcons
                            name="edit"
                            size={20}
                            color="#9C86FC"
                        />
                        <CustomText style={styles.imageActionText}>
                            Vaihda
                        </CustomText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.imageActionButton}
                        onPress={removeMealImage}
                        disabled={isUploadingImage}
                    >
                        <MaterialIcons
                            name="delete"
                            size={20}
                            color="#ff4444"
                        />
                        <CustomText style={styles.imageActionText}>
                            Poista
                        </CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.noImageContainer}>
            <TouchableOpacity
                style={styles.addImageButton}
                onPress={pickImage}
                disabled={isUploadingImage}
            >
                <MaterialIcons
                    name="add-a-photo"
                    size={40}
                    color="#9C86FC"
                />
                <CustomText style={styles.addImageText}>
                    Add Image
                </CustomText>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    mealImageContainer: {
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    mealImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    imageActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    imageActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        gap: 5,
    },
    imageActionText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    noImageContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    addImageButton: {
        borderWidth: 2,
        borderColor: '#9C86FC',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        width: '100%',
    },
    addImageText: {
        marginTop: 8,
        color: '#9C86FC',
        fontSize: 16,
        fontWeight: '500',
    },
})

export default MealImageUploader

