import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
// import axios from 'axios'

import Navigation from './src/navigation'
import LoginProvider from './src/context/LoginProvider'

SplashScreen.preventAutoHideAsync()

const App = () => {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function prepare() {
            try {
                // keeps the splash screen visible while assets are cached
                await SplashScreen.preventAutoHideAsync()

                // pre-load/cache assets: images, fonts, and videos
                await func.loadAssetsAsync()
            } catch (e) {
                // console.warn(e);
            } finally {
                // loading is complete
                setIsLoading(false)
            }
        }

        prepare()
    }, [])

    useEffect(() => {
        // when loading is complete
        if (isLoading === false) {
            // hide splash function
            const hideSplash = async () => SplashScreen.hideAsync()

            // hide splash screen to show app
            hideSplash()
        }
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
    },
})

export default App
