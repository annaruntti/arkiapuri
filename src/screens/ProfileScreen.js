import * as React from 'react'
import {
    StyleSheet,
    View,
    Alert,
    Image,
    Platform,
    TouchableOpacity,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import { useLogin } from '../context/LoginProvider'
import { useNavigation } from '@react-navigation/native'
import { getServerUrl } from '../utils/getServerUrl'
import axios from 'axios'
import storage from '../utils/storage'

const ProfileScreen = () => {
    const { logout, profile, setProfile } = useLogin()
    const navigation = useNavigation()

    const defaultImage = {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/2wzxlzyydJLVr8T7k67cOO/90074490ee64362fe6f0e384d2b3daf8/arkiapuri-removebg-preview.png',
    }

    const pickImage = async () => {
        try {
            // Request permissions
            if (Platform.OS !== 'web') {
                const { status } =
                    await ImagePicker.requestMediaLibraryPermissionsAsync()
                if (status !== 'granted') {
                    Alert.alert(
                        'Sorry, we need camera roll permissions to make this work!'
                    )
                    return
                }
            }

            // Pick the image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            })

            if (!result.canceled) {
                await uploadImage(result.assets[0])
            }
        } catch (error) {
            console.error('Error picking image:', error)
            Alert.alert('Error', 'Failed to pick image')
        }
    }

    const uploadImage = async (imageFile) => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) {
                throw new Error('No token found')
            }

            const formData = new FormData()
            formData.append('profile', {
                uri: imageFile.uri,
                type: 'image/jpeg',
                name: 'profile.jpg',
            })

            const response = await axios.post(
                getServerUrl('/profile/image'),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                // Update profile with the new image URL from the nested object
                setProfile({
                    ...profile,
                    profileImage: response.data.user.profileImage.url,
                })
                Alert.alert('Success', 'Profile image updated successfully')
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            Alert.alert('Error', 'Failed to upload image')
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            // Navigation will be handled automatically by the Navigation component
            // since it's watching isLoggedIn state
        } catch (error) {
            console.error('Logout error:', error)
            Alert.alert('Virhe', 'Uloskirjautuminen epäonnistui')
        }
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={
                            profile?.profileImage
                                ? { uri: profile.profileImage }
                                : defaultImage
                        }
                        style={styles.profileImage}
                    />
                    <View style={styles.editOverlay}>
                        <CustomText style={styles.editText}>Edit</CustomText>
                    </View>
                </View>
            </TouchableOpacity>
            <CustomText style={styles.introText}>
                {profile?.username}
            </CustomText>
            <CustomText style={styles.userInfoText}>
                Sähköposti: {profile?.email}
            </CustomText>
            <Button
                style={styles.secondaryButton}
                title="Muokkaa tietoja"
                onPress={() => {
                    console.log('You tapped the button!')
                }}
            />
            <Button
                style={styles.tertiaryButton}
                title="Kirjaudu ulos"
                onPress={handleLogout}
            />
        </View>
    )
}

export default ProfileScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    introText: {
        fontSize: 17,
        textAlign: 'center',
        padding: 10,
        marginBottom: 10,
    },
    userInfoText: {
        fontSize: 17,
        textAlign: 'center',
        padding: 10,
        marginBottom: 20,
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginBottom: 10,
        width: '80%',
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
        width: '80%',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    editOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 5,
        alignItems: 'center',
    },
    editText: {
        color: 'white',
        fontSize: 12,
    },
})
