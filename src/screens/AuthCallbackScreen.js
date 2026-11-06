import React, { useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import CustomText from '../components/CustomText'

const ALLOWED_PROVIDERS = new Set(['google', 'apple', 'facebook'])

const AuthCallbackScreen = () => {
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const error = urlParams.get('error')
        const providerRaw = urlParams.get('provider') || 'google'
        const provider = ALLOWED_PROVIDERS.has(providerRaw)
            ? providerRaw
            : 'google'

        const storageKey = `${provider}_auth_result`

        if (error) {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    type: 'error',
                    error: decodeURIComponent(error),
                })
            )
        } else if (code) {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    type: 'success',
                    code,
                })
            )
        } else {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    type: 'error',
                    error: 'Kirjautumiskoodi puuttuu',
                })
            )
        }

        setTimeout(() => {
            window.close()
        }, 1500)
    }, [])

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#5844BB" />
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
