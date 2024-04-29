import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
    ApolloProvider,
} from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { View, Text, StatusBar } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Feather, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'

import HomeScreen from './src/screens/home'
import MealsScreen from './src/screens/meals'
import ReadingOrderScreen from './src/screens/readingOrder'
import PantryScreen from './src/screens/pantry'
import ShoppingListScreen from './src/screens/shoppingList'

//create http link based on base url
const httpLink = createHttpLink({
    uri: 'http://192.168.1.34:4000/graphql',
})

//Create apollo client object
const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    // credentials:'include'
})

const screenOptions = {
    tabBarShowLabel: false,
    headerShown: true,
    tabBarStyle: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        elevation: 0,
        height: 60,
        bckground: '#fff',
    },
}

SplashScreen.preventAutoHideAsync()

export default function App() {
    // const [fontsLoaded, fontError] = useFonts({
    //     'Fira Sans': require('./src/assets/fonts/FiraSans-Regular.ttf'),
    // })

    // const onLayoutRootView = useCallback(async () => {
    //     if (fontsLoaded || fontError) {
    //         await SplashScreen.hideAsync()
    //     }
    // }, [fontsLoaded, fontError])

    // if (!fontsLoaded && !fontError) {
    //     return null
    // }

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

    const Tab = createBottomTabNavigator()

    return (
        // <ApolloProvider client={client} onLayout={onLayoutRootView}>
        <ApolloProvider client={client}>
            <NavigationContainer style={{ fontFamily: 'Fira Sans' }}>
                <Tab.Navigator screenOptions={screenOptions}>
                    <Tab.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{
                            title: 'Arkiapuri',
                            tabBarIcon: ({ focused }) => (
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Feather
                                        name="home"
                                        size={24}
                                        color="black"
                                    />
                                    <Text
                                        style={{ fontSize: 12, color: '#000' }}
                                    >
                                        Arkiapuri
                                    </Text>
                                </View>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Meals"
                        component={MealsScreen}
                        options={{
                            title: 'Ateriat',
                            tabBarIcon: ({ focused }) => (
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="food-takeout-box-outline"
                                        size={24}
                                        color="black"
                                    />
                                    <Text
                                        style={{ fontSize: 12, color: '#000' }}
                                    >
                                        Ateriat
                                    </Text>
                                </View>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Pantry"
                        component={PantryScreen}
                        options={{
                            title: 'Ateriat',
                            tabBarIcon: ({ focused }) => (
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="fridge-industrial-outline"
                                        size={24}
                                        color="black"
                                    />
                                    <Text
                                        style={{ fontSize: 12, color: '#000' }}
                                    >
                                        Ruokakomero
                                    </Text>
                                </View>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Shopping list"
                        component={ShoppingListScreen}
                        options={{
                            title: 'Ostoslista',
                            tabBarIcon: ({ focused }) => (
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Feather
                                        name="shopping-cart"
                                        size={24}
                                        color="black"
                                    />
                                    <Text
                                        style={{ fontSize: 12, color: '#000' }}
                                    >
                                        Ostoslista
                                    </Text>
                                </View>
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Reading order"
                        component={ReadingOrderScreen}
                        options={{
                            title: 'Lukujärjestys',
                            tabBarIcon: ({ focused }) => (
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <AntDesign
                                        name="calendar"
                                        size={24}
                                        color="black"
                                    />
                                    <Text
                                        style={{ fontSize: 12, color: '#000' }}
                                    >
                                        Lukujärjestys
                                    </Text>
                                </View>
                            ),
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </ApolloProvider>
    )
}
