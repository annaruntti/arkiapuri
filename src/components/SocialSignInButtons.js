import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import CustomText from './CustomText'

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession()

const SocialSignInButtons = ({ onSocialSignIn }) => {
    // OAuth configuration
    const googleAuthUrl = `${getServerUrl('')}/auth/google`
    const appleAuthUrl = `${getServerUrl('')}/auth/apple`

    const handleGoogleSignIn = () => {
        console.log('Google sign in button pressed')
        handleOAuthLogin(googleAuthUrl, 'Google Login', 'google_auth_result')
    }

    const handleAppleSignIn = () => {
        console.log('Apple sign in button pressed')
        handleOAuthLogin(appleAuthUrl, 'Apple Login', 'apple_auth_result')
    }

    const handleOAuthLogin = async (authUrl, windowTitle, storageKey) => {
        console.log(`Starting OAuth flow for ${windowTitle}`)
        console.log('Backend URL:', authUrl)

        // Open OAuth in a popup window
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        const popup = window.open(
            authUrl,
            windowTitle,
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
                    // Extract provider from storage key (google_auth_result -> google)
                    const provider = storageKey.replace('_auth_result', '')
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

        // Stop polling after 30 seconds (timeout)
        setTimeout(() => {
            clearInterval(pollInterval)
            console.log('⏱️ Auth polling timeout - stopped waiting')
            localStorage.removeItem(storageKey)
        }, 30000)
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

            {/* Facebook Sign-In - Coming soon
            <TouchableOpacity
                style={[styles.socialButton, styles.facebookButton]}
                onPress={handleFacebookSignIn}
            >
                <Ionicons name="logo-facebook" size={20} color="#fff" />
                <CustomText style={styles.socialButtonText}>
                    Facebook-tilillä
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
