import React, { useState } from 'react'
import {
    View,
    StyleSheet,
    Text,
    Image,
    Pressable,
    Platform,
    Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { StackActions } from '@react-navigation/native'
import { useLogin } from '../context/LoginProvider'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

import Button from '../components/Button'
import CustomText from '../components/CustomText'

const ImageUpload = (props) => {
    const [profileImage, setProfileImage] = useState('')
    const { token } = props.route.params
    const { setProfile, setIsLoggedIn } = useLogin()

    const openImageLibrary = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!')
            return
        }

        const response = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })

        if (!response.canceled) {
            setProfileImage(response.assets[0].uri)
        }
    }

    const completeSignUp = async (userData) => {
        try {
            await storage.setItem('userToken', token)
            await storage.setItem('profile', JSON.stringify(userData))
            await storage.setItem('isLoggedIn', 'true')
            setProfile(userData)
            setIsLoggedIn(true)
        } catch (error) {
            console.error('Error completing sign up:', error)
        }
    }

    const uploadImage = async () => {
        try {
            if (!token) {
                throw new Error('No token found')
            }

            if (!profileImage) {
                throw new Error('No image selected')
            }

            const formData = new FormData()

            if (Platform.OS === 'web') {
                try {
                    const response = await fetch(profileImage)
                    const blob = await response.blob()

                    const file = new File([blob], 'profile.jpg', {
                        type: 'image/jpeg',
                    })

                    console.log('File details:', {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                    })

                    formData.append('profileImage', file)
                } catch (error) {
                    console.error('Error processing web image:', error)
                    throw new Error('Failed to process image')
                }
            } else {
                formData.append('profileImage', {
                    uri: profileImage,
                    type: 'image/jpeg',
                    name: 'profile.jpg',
                })
            }

            // Log the full FormData contents
            for (let pair of formData.entries()) {
                console.log('FormData entry:', {
                    key: pair[0],
                    value:
                        pair[1] instanceof File
                            ? {
                                  name: pair[1].name,
                                  type: pair[1].type,
                                  size: pair[1].size,
                              }
                            : pair[1],
                })
            }

            const response = await axios.post(
                getServerUrl('/profile/image'),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                    transformRequest: (data) => data,
                }
            )

            if (response.data.success) {
                const userData = {
                    ...response.data.user,
                    profileImage: response.data.user.profileImage.url,
                }
                await completeSignUp(userData)
                Alert.alert('Success', 'Profile image updated successfully')
            } else {
                throw new Error(response.data.message || 'Upload failed')
            }
        } catch (error) {
            console.error('Upload error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                stack: error.stack,
            })
            Alert.alert(
                'Error',
                error.response?.data?.message ||
                    error.message ||
                    'Failed to upload image'
            )
        }
    }

    const skipUpload = async () => {
        try {
            await completeSignUp({})
        } catch (error) {
            console.error('Error skipping upload:', error)
        }
    }

    return (
        <View style={styles.container}>
            <View>
                <Pressable
                    onPress={openImageLibrary}
                    style={styles.uploadBtnContainer}
                >
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={{
                                width: '100%',
                                height: '100%',
                                resizeMode: 'cover',
                            }}
                        />
                    ) : (
                        <CustomText style={styles.uploadBtn}>
                            Lataa profiilikuva
                        </CustomText>
                    )}
                </Pressable>
                {profileImage ? (
                    <Button
                        title="Tallenna profiilikuva"
                        onPress={() => uploadImage()}
                        style={styles.primaryButton}
                    />
                ) : null}
                <Button
                    title="Ohita"
                    onPress={skipUpload}
                    style={styles.tertiaryButton}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        width: '100%',
    },
    uploadBtnContainer: {
        height: 125,
        width: 125,
        borderRadius: 125 / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 20,
        alignSelf: 'center',
    },
    uploadBtn: {
        textAlign: 'center',
        fontSize: 16,
        opacity: 0.3,
        fontWeight: 'bold',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginBottom: 10,
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
})

export default ImageUpload
