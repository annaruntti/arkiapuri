import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import React, { useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen'
import LoginProvider from './src/context/LoginProvider'
import Navigation from './src/navigation'
import { useResponsiveDimensions } from './src/utils/responsive'

// Splash screen is keep visible while we fetch resources
SplashScreen.preventAutoHideAsync()

const App = () => {
    console.log('App component rendering')
    const [appIsReady, setAppIsReady] = useState(false)
    const [showSplash, setShowSplash] = useState(true)
    const { containerMaxWidth, responsivePadding, isDesktop, isWeb } =
        useResponsiveDimensions()
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

    const dynamicStyles = {
        ...styles.root,
        maxWidth: isDesktop ? 960 : containerMaxWidth,
        backgroundColor: '#fff',
        marginTop: isDesktop ? 20 : 0,
        marginBottom: isDesktop ? 20 : 0,
    }

    return (
        <View style={styles.container}>
            <View style={dynamicStyles} onLayout={onLayoutRootView}>
                {showSplash ? (
                    <AnimatedSplashScreen />
                ) : (
                    <LoginProvider>
                        <Navigation />
                    </LoginProvider>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    root: {
        flex: 1,
        backgroundColor: '#fff',
        width: '100%',
        fontFamily: 'FireSans-Regular',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 5,
        // Web-specific shadow that matches your specification
        ...(Platform.OS === 'web' && {
            boxShadow:
                'rgba(0, 0, 0, 0.1) 0px 2px 8px, rgba(0, 0, 0, 0.1) 0px 2px 8px',
        }),
    },
})

export default App
