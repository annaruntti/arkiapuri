import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import CustomText from './CustomText'

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession()

const SocialSignInButtons = ({ onSocialSignIn }) => {
    // Google OAuth configuration
    const googleAuthUrl = `${getServerUrl('')}/auth/google`

    const handleGoogleSignIn = async () => {

        Alert.alert(
            'Google Kirjautuminen',
            'Haluatko kirjautua demo-tilillä vai yrittää todellista Google OAuth:ia?',
            [
                {
                    text: 'Peruuta',
                    style: 'cancel',
                },
                {
                    text: 'Demo',
                    onPress: () => {
                        onSocialSignIn('demo', {
                            token: 'demo-token',
                            user: {
                                email: 'demo@gmail.com',
                                name: 'Demo User (Google)',
                                picture: 'https://via.placeholder.com/150',
                            },
                        })
                    },
                },
                {
                    text: 'Google OAuth',
                    onPress: async () => {
                        try {
                            const result =
                                await WebBrowser.openAuthSessionAsync(
                                    googleAuthUrl,
                                    'exp://127.0.0.1:8081/--/auth/callback'
                                )

                            if (result.type === 'success') {
                                const { url } = result

                                if (url.includes('token=')) {
                                    const token = url
                                        .split('token=')[1]
                                        .split('&')[0]

                                    // Parse user data if present
                                    let userData = null
                                    if (url.includes('user=')) {
                                        const userParam = url
                                            .split('user=')[1]
                                            .split('&')[0]
                                        try {
                                            userData = JSON.parse(
                                                decodeURIComponent(userParam)
                                            )
                                        } catch (e) {
                                            console.error(
                                                'Error parsing user data:',
                                                e
                                            )
                                        }
                                    }

                                    onSocialSignIn('google', {
                                        token,
                                        user: userData,
                                    })
                                } else if (url.includes('error=')) {
                                    const error = url
                                        .split('error=')[1]
                                        .split('&')[0]
                                    Alert.alert(
                                        'Virhe',
                                        `Google kirjautuminen epäonnistui: ${decodeURIComponent(error)}`
                                    )
                                }
                            }
                        } catch (error) {
                            console.error('Google sign in error:', error)
                            Alert.alert(
                                'Virhe',
                                'Google kirjautuminen epäonnistui'
                            )
                        }
                    },
                },
            ]
        )
    }

    const handleAppleSignIn = async () => {
        // Apple Sign-In implementation would go here
        Alert.alert('Tulossa pian', 'Apple kirjautuminen lisätään myöhemmin')
    }

    const handleFacebookSignIn = async () => {
        // Facebook Sign-In implementation would go here
        Alert.alert('Tulossa pian', 'Facebook kirjautuminen lisätään myöhemmin')
    }

    return (
        <View style={styles.container}>
            <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <CustomText style={styles.dividerText}>tai kirjaudu</CustomText>
                <View style={styles.divider} />
            </View>

            <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={handleGoogleSignIn}
            >
                <Ionicons name="logo-google" size={20} color="#fff" />
                <CustomText style={styles.socialButtonText}>
                    Google-tilillä
                </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleSignIn}
            >
                <Ionicons name="logo-apple" size={20} color="#fff" />
                <CustomText style={styles.socialButtonText}>
                    Apple ID:llä
                </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={handleFacebookSignIn}
            >
                <Ionicons name="logo-facebook" size={20} color="#fff" />
                <CustomText style={styles.socialButtonText}>
                    Facebook-tilillä
                </CustomText>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 20,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#666',
        fontSize: 14,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginVertical: 6,
        minHeight: 46,
    },
    googleButton: {
        backgroundColor: '#DB4437',
    },
    appleButton: {
        backgroundColor: '#000000',
    },
    facebookButton: {
        backgroundColor: '#4267B2',
    },
    socialButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
})

export default SocialSignInButtons
