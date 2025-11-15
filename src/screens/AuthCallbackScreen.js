import React, { useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import CustomText from '../components/CustomText'

const AuthCallbackScreen = () => {
    console.log('🔵 AuthCallbackScreen component rendered!')
    
    useEffect(() => {
        console.log('🟢 === Auth Callback Screen useEffect Started ===')
        console.log('Current URL:', window.location.href)

        // Get token and user data from URL
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const userParam = urlParams.get('user')
        const error = urlParams.get('error')

        console.log('Token:', token ? 'YES' : 'NO')
        console.log('User:', userParam ? 'YES' : 'NO')
        console.log('Error:', error)
        console.log('Has window.opener:', !!window.opener)

        if (error) {
            console.log('🔴 Storing error in localStorage')
            localStorage.setItem('google_auth_result', JSON.stringify({
                type: 'error',
                error: decodeURIComponent(error)
            }))
        } else if (token) {
            // Parse user data
            let userData = null
            if (userParam) {
                try {
                    userData = JSON.parse(decodeURIComponent(userParam))
                    console.log('Parsed user data:', userData)
                } catch (e) {
                    console.error('Error parsing user data:', e)
                }
            }

            console.log('🟢 Storing success in localStorage')
            localStorage.setItem('google_auth_result', JSON.stringify({
                type: 'success',
                token: token,
                user: userData
            }))
            console.log('✅ Data stored! Closing in 1 second...')
        }

        // Close popup after a longer delay to ensure main window processes the login
        setTimeout(() => {
            console.log('⏰ Closing popup now...')
            window.close()
        }, 3000) // Increased to 3 seconds
    }, [])

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#9C86FC" />
            <CustomText style={styles.title}>Kirjautuminen onnistui!</CustomText>
            <CustomText style={styles.subtitle}>
                Voit nyt sulkea tämän ikkunan.
            </CustomText>
            <CustomText style={styles.hint}>
                (Ikkuna sulkeutuu automaattisesti hetken kuluttua)
            </CustomText>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 10,
        textAlign: 'center',
    },
})

export default AuthCallbackScreen

