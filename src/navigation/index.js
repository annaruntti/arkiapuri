import * as React from 'react'
import { TouchableOpacity, View, Image, StyleSheet } from 'react-native'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useLogin } from '../context/LoginProvider'

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
import ShoppingListScreen from '../screens/ShoppingListsScreen'
import ProfileScreen from '../screens/ProfileScreen'
import CustomText from '../components/CustomText'

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
            <CustomText
                style={{
                    marginVertical: 'auto',
                    fontWeight: 'bold',
                    paddingHorizontal: 5,
                    fontSize: 18,
                }}
            >
                Arkiapuri
            </CustomText>
        </View>
    )
}

const UserProfile = () => {
    const navigation = useNavigation()

    const handlePress = () => {
        navigation.navigate('ProfileStack', {
            screen: 'Omat tiedot',
        })
    }

    return (
        <TouchableOpacity onPress={handlePress} style={styles.iconButton}>
            <FontAwesome6 name="circle-user" size={24} color="black" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    iconButton: {
        paddingRight: 10,
    },
})

function HomeStackScreen() {
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitle: (props) => <LogoTitle {...props} />,
                headerRight: () => <UserProfile />,
            }}
        >
            <HomeStack.Screen name="Arkiapuri" component={HomeScreen} />
        </HomeStack.Navigator>
    )
}

const MealsStack = createNativeStackNavigator()

function MealsStackScreen() {
    return (
        <MealsStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitle: (props) => <LogoTitle {...props} />,
                headerRight: () => <UserProfile />,
            }}
        >
            <MealsStack.Screen name="Ateriat" component={MealsScreen} />
        </MealsStack.Navigator>
    )
}

const PantryStack = createNativeStackNavigator()

function PantryStackScreen() {
    return (
        <PantryStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitle: (props) => <LogoTitle {...props} />,
                headerRight: () => <UserProfile />,
            }}
        >
            <PantryStack.Screen name="Pentteri" component={PantryScreen} />
        </PantryStack.Navigator>
    )
}

const ShoppingListStack = createNativeStackNavigator()

function ShoppingListStackScreen() {
    return (
        <ShoppingListStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitle: (props) => <LogoTitle {...props} />,
                headerRight: () => <UserProfile />,
            }}
        >
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
        <ReadingOrderStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitle: (props) => <LogoTitle {...props} />,
                headerRight: () => <UserProfile />,
            }}
        >
            <ReadingOrderStack.Screen
                name="Lukujärjestys"
                component={ReadingOrderScreen}
            />
        </ReadingOrderStack.Navigator>
    )
}

const ProfileStack = createNativeStackNavigator()

function ProfileStackScreen() {
    return (
        <ProfileStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitle: (props) => <LogoTitle {...props} />,
                headerRight: () => <UserProfile />,
            }}
        >
            <ProfileStack.Screen name="Omat tiedot" component={ProfileScreen} />
        </ProfileStack.Navigator>
    )
}

const Tab = createBottomTabNavigator()

function TabNavigator() {
    return (
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
                            <CustomText style={{ fontSize: 12, color: '#000' }}>
                                Arkiapuri
                            </CustomText>
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
                            <CustomText style={{ fontSize: 12, color: '#000' }}>
                                Ateriat
                            </CustomText>
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
                            <CustomText style={{ fontSize: 12, color: '#000' }}>
                                Pentteri
                            </CustomText>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="ShoppingListStack"
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
                            <CustomText style={{ fontSize: 12, color: '#000' }}>
                                Ostoslista
                            </CustomText>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="ReadingOrderStack"
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
                            <CustomText style={{ fontSize: 12, color: '#000' }}>
                                Lukujärjestys
                            </CustomText>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileStack"
                component={ProfileStackScreen}
                options={{
                    tabBarButton: () => null,
                }}
            />
        </Tab.Navigator>
    )
}

const RootStack = createNativeStackNavigator()

export default function Navigation() {
    const { isLoggedIn } = useLogin()

    return (
        <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {isLoggedIn ? (
                    <RootStack.Screen name="Main" component={TabNavigator} />
                ) : (
                    <RootStack.Screen name="Auth" component={AuthStackScreen} />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    )
}

function AuthStackScreen() {
    return (
        <HomeStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitle: (props) => <LogoTitle {...props} />,
            }}
        >
            <HomeStack.Screen name="Tervetuloa" component={LandingScreen} />
            <HomeStack.Screen name="Kirjaudu sisään" component={SignInScreen} />
            <HomeStack.Screen name="Luo tunnus" component={SignUpScreen} />
            <HomeStack.Screen
                name="Lataa profiilikuva"
                component={ImageUploadScreen}
            />
            <HomeStack.Screen
                name="Vahvista sähköposti"
                component={ConfirmEmailScreen}
            />
        </HomeStack.Navigator>
    )
}
