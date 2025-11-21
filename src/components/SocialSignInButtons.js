import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import {
    Alert,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import CustomText from './CustomText'

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession()

const SocialSignInButtons = ({ onSocialSignIn }) => {
    // OAuth configuration
    const googleAuthUrl = `${getServerUrl('')}/auth/google`
    const appleAuthUrl = `${getServerUrl('')}/auth/apple`
    const facebookAuthUrl = `${getServerUrl('')}/auth/facebook`

    const handleGoogleSignIn = () => {
        console.log('Google sign in button pressed')
        handleOAuthLogin(googleAuthUrl, 'google')
    }

    const handleAppleSignIn = () => {
        console.log('Apple sign in button pressed')
        handleOAuthLogin(appleAuthUrl, 'apple')
    }

    const handleFacebookSignIn = () => {
        console.log('Facebook sign in button pressed')
        handleOAuthLogin(facebookAuthUrl, 'facebook')
    }

    const handleOAuthLogin = async (authUrl, provider) => {
        console.log(`Starting OAuth flow for ${provider}`)
        console.log('Backend URL:', authUrl)
        console.log('Platform:', Platform.OS)

        if (Platform.OS === 'web') {
            // Web: Use popup window with localStorage
            handleWebOAuth(authUrl, provider)
        } else {
            // Mobile: Use WebBrowser API
            handleMobileOAuth(authUrl, provider)
        }
    }

    const handleWebOAuth = (authUrl, provider) => {
        const storageKey = `${provider}_auth_result`

        // Open OAuth in a popup window
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        const popup = window.open(
            authUrl,
            `${provider} Login`,
            `width=${width},height=${height},left=${left},top=${top}`
        )

        // Poll localStorage for the auth result
        console.log('Starting to poll localStorage for auth result')
        const pollInterval = setInterval(() => {
            const result = localStorage.getItem(storageKey)

            if (result) {
                console.log('Found auth result in localStorage!')
                clearInterval(pollInterval)

                // Clear the result from localStorage
                localStorage.removeItem(storageKey)

                const authData = JSON.parse(result)
                console.log('Auth data:', authData)

                if (authData.type === 'success') {
                    console.log('✅ Login successful, calling onSocialSignIn')
                    onSocialSignIn(provider, {
                        token: authData.token,
                        user: authData.user,
                    })
                } else if (authData.type === 'error') {
                    console.error('❌ Login error:', authData.error)
                    Alert.alert('Virhe', authData.error)
                }
            }
        }, 500)

        // Stop polling after 60 seconds (timeout)
        setTimeout(() => {
            clearInterval(pollInterval)
            console.log('⏱️ Auth polling timeout - stopped waiting')
            localStorage.removeItem(storageKey)
        }, 60000) // Increased to 60 seconds to ensure we catch the data
    }

    const handleMobileOAuth = async (authUrl, provider) => {
        try {
            console.log('Opening mobile WebBrowser for OAuth')

            // Add platform parameter to tell backend this is mobile
            const mobileAuthUrl = `${authUrl}?platform=mobile`

            // Use the deep link prefix from your app
            const redirectUrl = 'arkiapuri://auth/callback'

            const result = await WebBrowser.openAuthSessionAsync(
                mobileAuthUrl,
                redirectUrl
            )

            console.log('WebBrowser result:', result)

            if (result.type === 'success') {
                // Parse the callback URL
                const url = result.url
                console.log('Callback URL:', url)

                // Parse query parameters from the URL
                const urlParts = url.split('?')
                if (urlParts.length > 1) {
                    const params = new URLSearchParams(urlParts[1])

                    const token = params.get('token')
                    const userParam = params.get('user')
                    const error = params.get('error')

                    console.log(
                        'Parsed params - token:',
                        !!token,
                        'user:',
                        !!userParam,
                        'error:',
                        error
                    )

                    if (error) {
                        Alert.alert('Virhe', decodeURIComponent(error))
                    } else if (token && userParam) {
                        const user = JSON.parse(decodeURIComponent(userParam))
                        console.log(
                            '✅ Mobile OAuth successful, user:',
                            user.email
                        )
                        onSocialSignIn(provider, { token, user })
                    } else {
                        console.error('Missing token or user in callback')
                        Alert.alert('Virhe', 'Kirjautumistiedot puuttuvat')
                    }
                } else {
                    console.error('No query parameters in callback URL')
                    Alert.alert('Virhe', 'Virheellinen callback URL')
                }
            } else if (result.type === 'cancel') {
                console.log('User cancelled OAuth')
            }
        } catch (error) {
            console.error('Mobile OAuth error:', error)
            Alert.alert('Virhe', 'Kirjautuminen epäonnistui: ' + error.message)
        }
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
                style={[styles.socialButton, styles.facebookButton]}
                onPress={handleFacebookSignIn}
            >
                <Ionicons name="logo-facebook" size={20} color="#fff" />
                <CustomText style={styles.socialButtonText}>
                    Facebook-tilillä
                </CustomText>
            </TouchableOpacity>

            {/* Apple Sign-In - Hidden until Apple Developer enrollment is complete
            <TouchableOpacity
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleSignIn}
            >
                <Ionicons name="logo-apple" size={20} color="#fff" />
                <CustomText style={styles.socialButtonText}>
                    Apple ID:llä
                </CustomText>
            </TouchableOpacity>
            */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
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
