import * as React from 'react'
import { Text, View, Image } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { Feather, AntDesign, FontAwesome6 } from '@expo/vector-icons'

import LandingScreen from '../screens/LandingScreen'
import SignInScreen from '../screens/SignInScreen'
import SignUpScreen from '../screens/SignUpScreen'
import ImageUploadScreen from '../screens/ImageUploadScreen'
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen'
import HomeScreen from '../screens/HomeScreen'
import MealsScreen from '../screens/MealsScreen'
import ReadingOrderScreen from '../screens/ReadingOrderScreen'
import PantryScreen from '../screens/PantryScreen'
import ShoppingListScreen from '../screens/ShoppingListScreen'
import { useLogin } from '../context/LoginProvider'

const screenOptions = {
    tabBarShowLabel: false,
    headerShown: false,
}

const HomeStack = createNativeStackNavigator()

function LogoTitle() {
    const image = {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/2wzxlzyydJLVr8T7k67cOO/90074490ee64362fe6f0e384d2b3daf8/arkiapuri-removebg-preview.png',
    }
    return (
        <View style={{ flexDirection: 'row' }}>
            <Image
                style={{ width: 40, height: 40 }}
                source={image}
                alt="Arkiapuri-logo"
            />
            <Text
                style={{
                    marginVertical: 'auto',
                    fontWeight: 'bold',
                    paddingHorizontal: 5,
                }}
            >
                Arkiapuri
            </Text>
        </View>
    )
}

function HomeStackScreen() {
    const { isLoggedIn } = useLogin()
    return isLoggedIn ? (
        <HomeStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
            }}
        >
            {/* <HomeStack.Screen
                name="Tervetuloa"
                component={LandingScreen}
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
            />
            <HomeStack.Screen
                name="Kirjaudu sisään"
                component={SignInScreen}
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
            />
            <HomeStack.Screen
                name="Luo tunnus"
                component={SignUpScreen}
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
            />
            <HomeStack.Screen
                name="Lataa profiilikuva"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={ImageUploadScreen}
            />
            <HomeStack.Screen
                name="Vahvista sähköposti"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={ConfirmEmailScreen}
            /> */}
            <HomeStack.Screen
                name="Arkiapuri"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={HomeScreen}
            />
        </HomeStack.Navigator>
    ) : (
        <HomeStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
            }}
        >
            <HomeStack.Screen
                name="Tervetuloa"
                component={LandingScreen}
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
            />
            <HomeStack.Screen
                name="Kirjaudu sisään"
                component={SignInScreen}
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
            />
            <HomeStack.Screen
                name="Luo tunnus"
                component={SignUpScreen}
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
            />
            <HomeStack.Screen
                name="Lataa profiilikuva"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={ImageUploadScreen}
            />
            <HomeStack.Screen
                name="Vahvista sähköposti"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={ConfirmEmailScreen}
            />
            <HomeStack.Screen
                name="Arkiapuri"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={HomeScreen}
            />
        </HomeStack.Navigator>
    )
}

const MealsStack = createNativeStackNavigator()

function MealsStackScreen() {
    return (
        <MealsStack.Navigator>
            <MealsStack.Screen
                name="Ateriat"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={MealsScreen}
            />
        </MealsStack.Navigator>
    )
}

const PantryStack = createNativeStackNavigator()

function PantryStackScreen() {
    return (
        <PantryStack.Navigator>
            <PantryStack.Screen
                name="Pentteri"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={PantryScreen}
            />
        </PantryStack.Navigator>
    )
}

const ShoppingListStack = createNativeStackNavigator()

function ShoppingListStackScreen() {
    return (
        <ShoppingListStack.Navigator>
            <ShoppingListStack.Screen
                name="Ostoslista"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={ShoppingListScreen}
            />
        </ShoppingListStack.Navigator>
    )
}

const ReadingOrderStack = createNativeStackNavigator()

function ReadingOrderStackScreen() {
    return (
        <ReadingOrderStack.Navigator>
            <ReadingOrderStack.Screen
                name="Lukujärjestys"
                options={{ headerTitle: (props) => <LogoTitle {...props} /> }}
                component={ReadingOrderScreen}
            />
        </ReadingOrderStack.Navigator>
    )
}

const Tab = createBottomTabNavigator()

export default function Navigation() {
    return (
        <NavigationContainer>
            <Tab.Navigator screenOptions={screenOptions}>
                <Tab.Screen
                    name="HomeStack"
                    component={HomeStackScreen}
                    options={{
                        title: 'Arkiapuri',
                        tabBarIcon: ({ focused }) => (
                            <View
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Feather name="home" size={24} color="black" />
                                <Text style={{ fontSize: 12, color: '#000' }}>
                                    Arkiapuri
                                </Text>
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="MealsStack"
                    component={MealsStackScreen}
                    options={{
                        title: 'Ateriat',
                        tabBarIcon: ({ focused }) => (
                            <View
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <FontAwesome6
                                    name="bowl-food"
                                    size={24}
                                    color="black"
                                />
                                <Text style={{ fontSize: 12, color: '#000' }}>
                                    Ateriat
                                </Text>
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="PantryStack"
                    component={PantryStackScreen}
                    options={{
                        title: 'Pentteri',
                        tabBarIcon: ({ focused }) => (
                            <View
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AntDesign
                                    name="database"
                                    size={24}
                                    color="black"
                                />
                                <Text style={{ fontSize: 12, color: '#000' }}>
                                    Pentteri
                                </Text>
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Shopping list"
                    component={ShoppingListStackScreen}
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
                                <Text style={{ fontSize: 12, color: '#000' }}>
                                    Ostoslista
                                </Text>
                            </View>
                        ),
                    }}
                />
                <Tab.Screen
                    name="Reading order"
                    component={ReadingOrderStackScreen}
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
                                <Text style={{ fontSize: 12, color: '#000' }}>
                                    Lukujärjestys
                                </Text>
                            </View>
                        ),
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    )
}
