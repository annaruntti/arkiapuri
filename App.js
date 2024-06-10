// import {
//     ApolloClient,
//     createHttpLink,
//     InMemoryCache,
//     ApolloProvider,
// } from '@apollo/client'
import { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import axios from 'axios'

import Navigation from './src/navigation'

// //create http link based on base url
// const httpLink = createHttpLink({
//     uri: 'http://192.168.1.34:4000/graphql',
// })

// //Create apollo client object
// const client = new ApolloClient({
//     link: httpLink,
//     cache: new InMemoryCache(),
//     // credentials:'include'
// })

SplashScreen.preventAutoHideAsync()

const App = () => {
    const [isLoading, setIsLoading] = useState(true)

    const fetchApi = async () => {
        //my ip
        try {
            const res = await axios.get('http://192.168.50.223:8000/')
            console.log(res.data)
        } catch (error) {
            console.log(error.message)
        }
    }

    useEffect(() => {
        fetchApi()
    }, [])

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
        // <ApolloProvider client={client}>
        <SafeAreaView style={styles.root}>
            <Navigation />
        </SafeAreaView>
        // </ApolloProvider>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F9FBFC',
    },
})

export default App
