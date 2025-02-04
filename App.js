import React, { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import Navigation from './src/navigation'
import LoginProvider from './src/context/LoginProvider'

SplashScreen.preventAutoHideAsync()

const App = () => {
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

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync()
        }
    }, [fontsLoaded])

    if (!fontsLoaded) {
        return null
    }

    return (
        <View style={styles.root} onLayout={onLayoutRootView}>
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
        fontFamily: 'FireSans-Regular',
    },
})

export default App
