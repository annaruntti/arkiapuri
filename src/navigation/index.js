import * as React from 'react'
import { Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { Feather, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons'

import LandingScreen from '../screens/LandingScreen'
import SignInScreen from '../screens/SignInScreen'
import SignUpScreen from '../screens/SignUpScreen'
import HomeScreen from '../screens/HomeScreen'
import MealsScreen from '../screens/MealsScreen'
import ReadingOrderScreen from '../screens/ReadingOrderScreen'
import PantryScreen from '../screens/PantryScreen'
import ShoppingListScreen from '../screens/ShoppingListScreen'

const screenOptions = {
    tabBarShowLabel: false,
    headerShown: false,
}

const HomeStack = createNativeStackNavigator()

function HomeStackScreen() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen name="Tervetuloa" component={LandingScreen} />
            <HomeStack.Screen name="Kirjaudu sisään" component={SignInScreen} />
            <HomeStack.Screen name="Luo tunnus" component={SignUpScreen} />
            <HomeStack.Screen name="Arkiapuri" component={HomeScreen} />
        </HomeStack.Navigator>
    )
}

const MealsStack = createNativeStackNavigator()

function MealsStackScreen() {
    return (
        <MealsStack.Navigator>
            <MealsStack.Screen name="Ateriat" component={MealsScreen} />
        </MealsStack.Navigator>
    )
}

const PantryStack = createNativeStackNavigator()

function PantryStackScreen() {
    return (
        <PantryStack.Navigator>
            <PantryStack.Screen name="Ruokakomero" component={PantryScreen} />
        </PantryStack.Navigator>
    )
}

const ShoppingListStack = createNativeStackNavigator()

function ShoppingListStackScreen() {
    return (
        <ShoppingListStack.Navigator>
            <ShoppingListStack.Screen
                name="Ostoslista"
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
                component={ReadingOrderScreen}
            />
        </ReadingOrderStack.Navigator>
    )
}

const Tab = createBottomTabNavigator()

export default function Navigation() {
    return (
        <NavigationContainer style={{ fontFamily: 'Fira Sans' }}>
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
                                <MaterialCommunityIcons
                                    name="food-takeout-box-outline"
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
                        title: 'Ruokakomero',
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
                                <Text style={{ fontSize: 12, color: '#000' }}>
                                    Ruokakomero
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
