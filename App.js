import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import Navigation from './src/navigation'
import LoginProvider from './src/context/LoginProvider'
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen'

// Splash screen is keep visible while we fetch resources
SplashScreen.preventAutoHideAsync()

const App = () => {
    console.log('App component rendering')
    const [appIsReady, setAppIsReady] = useState(false)
    const [showSplash, setShowSplash] = useState(true)
    const [fontsLoaded] = useFonts({
        'FireSans-Regular': require('./src/assets/fonts/FiraSans-Regular.ttf'),
        'FiraSans-Regular': require('./src/assets/fonts/FiraSans-Regular.ttf'),
        'FiraSans-Bold': require('./src/assets/fonts/FiraSans-Bold.ttf'),
        'FiraSans-Medium': require('./src/assets/fonts/FiraSans-Medium.ttf'),
        'FiraSans-SemiBold': require('./src/assets/fonts/FiraSans-SemiBold.ttf'),
        'FiraSans-Light': require('./src/assets/fonts/FiraSans-Light.ttf'),
        'FiraSans-ExtraLight': require('./src/assets/fonts/FiraSans-ExtraLight.ttf'),
        'FiraSans-Italic': require('./src/assets/fonts/FiraSans-Italic.ttf'),
        'FiraSans-BoldItalic': require('./src/assets/fonts/FiraSans-BoldItalic.ttf'),
    })

    useEffect(() => {
        async function prepare() {
            try {
                // Keep the splash screen visible while we prepare the app
                await SplashScreen.preventAutoHideAsync()

                // Wait for fonts to load
                if (fontsLoaded) {
                    // Wait a bit longer to ensure smooth transition
                    await new Promise((resolve) => setTimeout(resolve, 1000))
                    setAppIsReady(true)
                }
            } catch (e) {
                console.warn(e)
            }
        }

        prepare()
    }, [fontsLoaded])

    const onLayoutRootView = async () => {
        if (appIsReady) {
            // Hide the native splash screen
            await SplashScreen.hideAsync()
            // Start our custom splash screen animation
            setShowSplash(true)
            // Hide our custom splash screen after animation
            setTimeout(() => {
                setShowSplash(false)
            }, 3000)
        }
    }

    if (!appIsReady) {
        return null
    }

    return (
        <View style={styles.root} onLayout={onLayoutRootView}>
            {showSplash ? (
                <AnimatedSplashScreen />
            ) : (
                <LoginProvider>
                    <Navigation />
                </LoginProvider>
            )}
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
        fontFamily: 'FireSans-Regular',
    },
})

export default App
