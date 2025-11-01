import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import * as ImagePicker from 'expo-image-picker'
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
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import ResponsiveLayout from '../components/ResponsiveLayout'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

const ProfileScreen = () => {
    const { logout, profile, setProfile } = useLogin()
    const navigation = useNavigation()
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const [household, setHousehold] = React.useState(null)
    const [loadingHousehold, setLoadingHousehold] = React.useState(true)

    const defaultImage = {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/2wzxlzyydJLVr8T7k67cOO/90074490ee64362fe6f0e384d2b3daf8/arkiapuri-removebg-preview.png',
    }

    // Fetch household data
    React.useEffect(() => {
        fetchHousehold()
    }, [])

    const fetchHousehold = async () => {
        try {
            setLoadingHousehold(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/household'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success && response.data.household) {
                setHousehold(response.data.household)
            }
        } catch (error) {
            console.error('Error fetching household:', error)
            // Silent fail - household is optional
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
                        <View style={styles.header}>
                            <TouchableOpacity onPress={pickImage}>
                                <View
                                    style={[
                                        styles.profileImageContainer,
                                        isDesktop && styles.desktopProfileImage,
                                        isTablet && styles.tabletProfileImage,
                                    ]}
                                >
                                    <Image
                                        source={
                                            profile?.profileImage
                                                ? { uri: profile.profileImage }
                                                : defaultImage
                                        }
                                        style={styles.profileImage}
                                    />
                                    <View style={styles.editOverlay}>
                                        <CustomText style={styles.editText}>
                                            Muokkaa
                                        </CustomText>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.userInfo}>
                                <CustomText
                                    style={[
                                        styles.username,
                                        isDesktop && styles.desktopUsername,
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

                        {/* Family Section */}
                        {!loadingHousehold && household && (
                            <View style={styles.familySection}>
                                <View style={styles.familyHeader}>
                                    <CustomText
                                        style={[
                                            styles.familyTitle,
                                            isDesktop && styles.desktopFamilyTitle,
                                        ]}
                                    >
                                        {household.name}
                                    </CustomText>
                                </View>
                                
                                <View style={styles.familyMembers}>
                                    {household.members.map((member) => (
                                        <View key={member._id} style={styles.memberRow}>
                                            <Image
                                                source={
                                                    member.userId?.profileImage
                                                        ? { uri: member.userId.profileImage }
                                                        : defaultImage
                                                }
                                                style={styles.memberAvatar}
                                            />
                                            <View style={styles.memberInfo}>
                                                <CustomText style={styles.memberName}>
                                                    {member.userId?.username}
                                                    {household.owner.toString() === member.userId?._id && (
                                                        <CustomText style={styles.ownerBadge}> (Omistaja)</CustomText>
                                                    )}
                                                </CustomText>
                                                <CustomText style={styles.memberEmail}>
                                                    {member.userId?.email}
                                                </CustomText>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={styles.manageFamilyButton}
                                    onPress={() => navigation.navigate('Hallinnoi perhettä')}
                                >
                                    <CustomText style={styles.manageFamilyText}>
                                        Hallinnoi perhettä
                                    </CustomText>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.buttonSection}>
                            <Button
                                title="Muokkaa tietoja"
                                style={styles.secondaryButton}
                                textStyle={styles.buttonText}
                                onPress={() => {}}
                            />
                            <Button
                                title="Kirjaudu ulos"
                                style={styles.tertiaryButton}
                                textStyle={styles.buttonText}
                                onPress={handleLogout}
                            />
                        </View>
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
        paddingHorizontal: 20,
        paddingVertical: 40,
        minHeight: '100%',
    },
    desktopContainer: {
        paddingHorizontal: 40,
        paddingVertical: 60,
        alignItems: 'center',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
    },
    tabletContainer: {
        paddingHorizontal: 32,
        paddingVertical: 50,
        alignItems: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    desktopContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 40,
        maxWidth: 480,
        width: '100%',
        alignItems: 'center',
        ...(Platform.OS === 'web' && {
            boxShadow:
                '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        }),
    },
    tabletContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 32,
        maxWidth: 440,
        width: '100%',
        alignItems: 'center',
        ...(Platform.OS === 'web' && {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }),
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
        width: '100%',
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 3,
        borderColor: '#9C86FC',
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
        marginBottom: 32,
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
        resizeMode: 'cover',
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
        marginBottom: 12,
    },
    email: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        fontWeight: '400',
    },
    desktopEmail: {
        fontSize: 18,
    },
    buttonSection: {
        width: '100%',
        gap: 16,
        alignItems: 'center',
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
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
        width: '80%',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    familySection: {
        width: '100%',
        marginTop: 24,
        marginBottom: 24,
        padding: 20,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    familyHeader: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 12,
    },
    familyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    desktopFamilyTitle: {
        fontSize: 20,
    },
    familyMembers: {
        gap: 12,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 2,
        borderColor: '#9C86FC',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    ownerBadge: {
        fontSize: 14,
        fontWeight: '400',
        color: '#9C86FC',
    },
    memberEmail: {
        fontSize: 14,
        color: '#6b7280',
    },
    manageFamilyButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#9C86FC',
        borderRadius: 8,
        alignItems: 'center',
    },
    manageFamilyText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
})
