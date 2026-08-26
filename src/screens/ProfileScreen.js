import * as React from 'react'
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import FamilySection from '../components/FamilySection'
import ResponsiveLayout from '../components/ResponsiveLayout'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import { openAuthScreen } from '../utils/authNavigation'
import storage from '../utils/storage'
import { AUTH_FORM_MAX_WIDTH } from '../components/AuthLayout'
import { authFormStyles } from '../styles/authFormStyles'
import { getProfileImageSource } from '../utils/profileImage'

const ProfileScreen = () => {
    const { logout, profile, setProfile, isLoggedIn } = useLogin()
    const navigation = useNavigation()
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const [household, setHousehold] = React.useState(null)
    const [loadingHousehold, setLoadingHousehold] = React.useState(true)

    // Fetch household data when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            if (isLoggedIn) {
                fetchHousehold()
            } else {
                setHousehold(null)
                setLoadingHousehold(false)
            }
        }, [isLoggedIn])
    )

    const fetchHousehold = async () => {
        try {
            setLoadingHousehold(true)
            const token = await storage.getItem('userToken')
            if (!token) {
                setHousehold(null)
                return
            }

            const response = await axios.get(getServerUrl('/household'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success && response.data.household) {
                setHousehold(response.data.household)
            }
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error('Error fetching household:', error)
            }
            setHousehold(null)
        } finally {
            setLoadingHousehold(false)
        }
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
                mediaTypes: 'images',
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

            // Handle file differently for web vs native
            if (Platform.OS === 'web') {
                // For web, we need to fetch the blob first
                const response = await fetch(imageFile.uri)
                const blob = await response.blob()
                formData.append('profileImage', blob, 'profile.jpg')
            } else {
                // For native (iOS/Android)
                formData.append('profileImage', {
                    uri: imageFile.uri,
                    type: 'image/jpeg',
                    name: 'profile.jpg',
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
                }
            )

            if (response.data.success) {
                // Update profile with the new image URL from the nested object
                setProfile({
                    ...profile,
                    profileImage:
                        response.data.user.profileImage.url,
                })
                // Refresh household data to update the image in family section
                await fetchHousehold()
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
            // Navigate to Auth screen after logout
            navigation.reset({
                index: 0,
                routes: [{ name: 'Auth', params: { screen: 'Tervetuloa' } }],
            })
        } catch (error) {
            console.error('Logout error:', error)
            Alert.alert('Virhe', 'Uloskirjautuminen epäonnistui')
        }
    }

    const getContainerStyle = () => [
        styles.container,
        isDesktop && styles.desktopContainer,
        isTablet && styles.tabletContainer,
    ]

    const getContentStyle = () => [
        styles.content,
        isDesktop && styles.desktopContent,
        isTablet && styles.tabletContent,
    ]

    return (
        <ResponsiveLayout activeRoute="ProfileStack">
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={getContainerStyle()}>
                    <View style={getContentStyle()}>
                        {!isLoggedIn ? (
                            <>
                                <View style={styles.header}>
                                    <View
                                        style={[
                                            styles.profileImageContainer,
                                            isDesktop &&
                                                styles.desktopProfileImage,
                                            isTablet &&
                                                styles.tabletProfileImage,
                                        ]}
                                    >
                                        <Image
                                            source={getProfileImageSource(null)}
                                            style={styles.profileImage}
                                            resizeMode="cover"
                                        />
                                    </View>

                                    <View style={styles.userInfo}>
                                        <CustomText
                                            style={[
                                                styles.username,
                                                isDesktop &&
                                                    styles.desktopUsername,
                                            ]}
                                        >
                                            Vierailija
                                        </CustomText>
                                        <CustomText
                                            style={[
                                                styles.email,
                                                isDesktop && styles.desktopEmail,
                                            ]}
                                        >
                                            Kirjaudu sisään hallitaksesi
                                            profiiliasi
                                        </CustomText>
                                    </View>
                                </View>

                                <View style={authFormStyles.buttonSection}>
                                    <Button
                                        title="Kirjaudu sisään"
                                        fullWidth
                                        style={authFormStyles.primaryButton}
                                        textStyle={authFormStyles.buttonText}
                                        onPress={() =>
                                            openAuthScreen(
                                                navigation,
                                                'Kirjaudu sisään'
                                            )
                                        }
                                    />
                                    <Button
                                        title="Luo käyttäjätunnus"
                                        type="TERTIARY"
                                        fullWidth
                                        style={authFormStyles.tertiaryButton}
                                        textStyle={authFormStyles.buttonText}
                                        onPress={() =>
                                            openAuthScreen(
                                                navigation,
                                                'Luo tunnus'
                                            )
                                        }
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <View style={styles.header}>
                                    <TouchableOpacity onPress={pickImage}>
                                        <View
                                            style={[
                                                styles.profileImageContainer,
                                                isDesktop &&
                                                    styles.desktopProfileImage,
                                                isTablet &&
                                                    styles.tabletProfileImage,
                                            ]}
                                        >
                                            <Image
                                                source={getProfileImageSource(
                                                    profile
                                                )}
                                                style={styles.profileImage}
                                                resizeMode="cover"
                                            />
                                            <View style={styles.editOverlay}>
                                                <CustomText
                                                    style={styles.editText}
                                                >
                                                    Muokkaa
                                                </CustomText>
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.userInfo}>
                                        <CustomText
                                            style={[
                                                styles.username,
                                                isDesktop &&
                                                    styles.desktopUsername,
                                            ]}
                                        >
                                            {profile?.username}
                                        </CustomText>
                                        <CustomText
                                            style={[
                                                styles.email,
                                                isDesktop && styles.desktopEmail,
                                            ]}
                                        >
                                            {profile?.email}
                                        </CustomText>
                                    </View>
                                </View>

                                <View style={authFormStyles.buttonSection}>
                                    <Button
                                        title="Muokkaa tietoja"
                                        fullWidth
                                        style={authFormStyles.primaryButton}
                                        textStyle={authFormStyles.buttonText}
                                        onPress={() =>
                                            navigation.navigate(
                                                'Muokkaa tietoja'
                                            )
                                        }
                                    />

                                    {!loadingHousehold && (
                                        <FamilySection
                                            household={household}
                                            onManagePress={() =>
                                                navigation.navigate(
                                                    'Hallinnoi perhettä'
                                                )
                                            }
                                        />
                                    )}

                                    <Button
                                        title="Kirjaudu ulos"
                                        type="TERTIARY"
                                        fullWidth
                                        style={authFormStyles.tertiaryButton}
                                        textStyle={authFormStyles.buttonText}
                                        onPress={handleLogout}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </ResponsiveLayout>
    )
}

export default ProfileScreen

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
        minHeight: '100%',
        backgroundColor: '#ffffff',
    },
    desktopContainer: {
        paddingHorizontal: 24,
        paddingVertical: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        width: '100%',
        ...(Platform.OS === 'web' && {
            minHeight: '100vh',
        }),
    },
    tabletContainer: {
        paddingHorizontal: 24,
        paddingVertical: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        width: '100%',
    },
    content: {
        width: '100%',
        maxWidth: AUTH_FORM_MAX_WIDTH,
        alignItems: 'center',
    },
    desktopContent: {
        maxWidth: AUTH_FORM_MAX_WIDTH,
        width: '100%',
        alignItems: 'center',
        padding: 0,
    },
    tabletContent: {
        maxWidth: AUTH_FORM_MAX_WIDTH,
        width: '100%',
        alignItems: 'center',
        padding: 0,
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
        width: '100%',
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 3,
        borderColor: '#5844BB',
        position: 'relative',
        ...(Platform.OS === 'web' && {
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
                transform: 'scale(1.05)',
            },
        }),
    },
    desktopProfileImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 4,
        marginBottom: 28,
    },
    tabletProfileImage: {
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 3.5,
        marginBottom: 28,
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingVertical: 6,
        alignItems: 'center',
    },
    editText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    userInfo: {
        alignItems: 'center',
        width: '100%',
    },
    username: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    desktopUsername: {
        fontSize: 28,
        marginBottom: 8,
    },
    email: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '400',
        lineHeight: 22,
    },
    desktopEmail: {
        fontSize: 15,
    },
})
