import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import Navigation from './src/navigation'
import LoginProvider from './src/context/LoginProvider'

SplashScreen.preventAutoHideAsync()

const App = () => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const prepare = async () => {
            try {
                await new Promise((resolve) => setTimeout(resolve, 2000))
            } catch (e) {
                console.warn(e)
            } finally {
                setIsLoading(false)
            }
        }

        prepare()
    }, [])

    useEffect(() => {
        const hideSplash = async () => {
            if (!isLoading) {
                await SplashScreen.hideAsync()
            }
        }
        hideSplash()
    }, [isLoading])

    if (isLoading) {
        return null
    }

    return (
        <View style={styles.root}>
            <LoginProvider>
                <Navigation />
            </LoginProvider>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#fff',
        maxWidth: 400,
        marginHorizontal: 'auto',
        width: '100%',
    },
})

export default App
