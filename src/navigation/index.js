import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
    NavigationContainer,
    useFocusEffect,
    useNavigation,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as React from 'react'
import {
    Image,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { useLogin } from '../context/LoginProvider'
import { useResponsiveDimensions } from '../utils/responsive'

import { AntDesign, Feather, FontAwesome6 } from '@expo/vector-icons'

import CustomText from '../components/CustomText'
import ConfirmEmailScreen from '../screens/ConfirmEmailScreen'
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen'
import HomeScreen from '../screens/HomeScreen'
import ImageUploadScreen from '../screens/ImageUploadScreen'
import LandingScreen from '../screens/LandingScreen'
import MealsScreen from '../screens/MealsScreen'
import PantryScreen from '../screens/PantryScreen'
import ProfileScreen from '../screens/ProfileScreen'
import ReadingOrderScreen from '../screens/ReadingOrderScreen'
import ResetPasswordScreen from '../screens/ResetPasswordScreen'
import ShoppingListScreen from '../screens/ShoppingListsScreen'
import SignInScreen from '../screens/SignInScreen'
import SignUpScreen from '../screens/SignUpScreen'

const HomeStack = createNativeStackNavigator()

// Navigation History Context
const NavigationHistoryContext = React.createContext()

const NavigationHistoryProvider = ({ children }) => {
    const [navigationHistory, setNavigationHistory] = React.useState([])

    const addToHistory = React.useCallback((screenName) => {
        setNavigationHistory((prev) => {
            // Don't add if it's the same as the last entry
            if (prev.length > 0 && prev[prev.length - 1] === screenName) {
                return prev
            }
            const newHistory = [...prev, screenName]
            // Keep only the last 10 entries to prevent memory issues
            return newHistory.slice(-10)
        })
    }, [])

    const getPreviousScreen = React.useCallback(() => {
        return navigationHistory.length >= 2
            ? navigationHistory[navigationHistory.length - 2]
            : null
    }, [navigationHistory])

    const clearHistory = React.useCallback(() => {
        setNavigationHistory([])
    }, [])

    const contextValue = React.useMemo(
        () => ({
            addToHistory,
            getPreviousScreen,
            clearHistory,
            navigationHistory,
        }),
        [addToHistory, getPreviousScreen, clearHistory, navigationHistory]
    )

    return (
        <NavigationHistoryContext.Provider value={contextValue}>
            {children}
        </NavigationHistoryContext.Provider>
    )
}

const useNavigationHistory = () => {
    const context = React.useContext(NavigationHistoryContext)
    if (!context) {
        throw new Error(
            'useNavigationHistory must be used within NavigationHistoryProvider'
        )
    }
    return context
}

function LogoTitle() {
    const navigation = useNavigation()
    const { isLoggedIn } = useLogin()

    const image = {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/2wzxlzyydJLVr8T7k67cOO/90074490ee64362fe6f0e384d2b3daf8/arkiapuri-removebg-preview.png',
    }

    const handleLogoPress = () => {
        if (isLoggedIn) {
            // Navigate to HomeScreen when logged in
            navigation.navigate('Main', {
                screen: 'HomeStack',
                params: { screen: 'Arkiapuri' },
            })
        } else {
            // Navigate to LandingScreen when not logged in
            navigation.navigate('Auth', {
                screen: 'Tervetuloa',
            })
        }
    }

    return (
        <TouchableOpacity
            onPress={handleLogoPress}
            style={{ flexDirection: 'row' }}
        >
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
        </TouchableOpacity>
    )
}

const BackButton = () => {
    const navigation = useNavigation()
    const { getPreviousScreen } = useNavigationHistory()
    const { isLoggedIn } = useLogin()

    const handleBackPress = () => {
        const previousScreen = getPreviousScreen()

        if (previousScreen) {
            if (isLoggedIn) {
                // For logged in users, navigate within Main tab navigator
                navigation.navigate('Main', { screen: previousScreen })
            } else {
                // For non-logged in users, navigate within Auth stack
                navigation.navigate('Auth', { screen: previousScreen })
            }
        } else if (navigation.canGoBack()) {
            // Fallback to default goBack behavior
            navigation.goBack()
        }
    }

    return (
        <TouchableOpacity
            onPress={handleBackPress}
            style={[styles.iconButton, styles.backButton]}
        >
            <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
    )
}

// Component to track screen focus and update navigation history
const NavigationTracker = ({ screenName }) => {
    const { addToHistory } = useNavigationHistory()

    useFocusEffect(
        React.useCallback(() => {
            addToHistory(screenName)
        }, [screenName, addToHistory])
    )

    return null
}

const ConditionalBackButton = () => {
    const navigation = useNavigation()

    // Simply show back button if can't go back
    const canGoBack = navigation.canGoBack()

    return canGoBack ? <BackButton /> : null
}

const UserProfile = ({ isActive = false }) => {
    const navigation = useNavigation()

    const handlePress = () => {
        navigation.navigate('ProfileStack', {
            screen: 'Omat tiedot',
            params: {
                from: navigation.getState().routes[navigation.getState().index]
                    .name,
            },
        })
    }

    return (
        <TouchableOpacity onPress={handlePress} style={styles.iconButton}>
            <FontAwesome6
                name="circle-user"
                size={24}
                color={isActive ? '#9C86FC' : 'black'}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    iconButton: {
        paddingRight: 0,
        marginRight: -48,
        marginLeft: -10,
    },
    backButton: {
        marginLeft: -10,
        paddingRight: 0,
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
                headerLeft: () => <ConditionalBackButton />,
                headerRight: () => <UserProfile />,
            }}
        >
            <HomeStack.Screen
                name="Arkiapuri"
                options={{
                    headerLeft: () => null, // Remove back button for home screen
                }}
            >
                {(props) => (
                    <>
                        <NavigationTracker screenName="HomeStack" />
                        <HomeScreen {...props} />
                    </>
                )}
            </HomeStack.Screen>
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
                headerLeft: () => <ConditionalBackButton />,
                headerRight: () => <UserProfile />,
            }}
        >
            <MealsStack.Screen name="Ateriat">
                {(props) => (
                    <>
                        <NavigationTracker screenName="MealsStack" />
                        <MealsScreen {...props} />
                    </>
                )}
            </MealsStack.Screen>
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
                headerLeft: () => <ConditionalBackButton />,
                headerRight: () => <UserProfile />,
            }}
        >
            <PantryStack.Screen name="Pentteri">
                {(props) => (
                    <>
                        <NavigationTracker screenName="PantryStack" />
                        <PantryScreen {...props} />
                    </>
                )}
            </PantryStack.Screen>
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
                headerLeft: () => <ConditionalBackButton />,
                headerRight: () => <UserProfile />,
            }}
        >
            <ShoppingListStack.Screen name="Ostoslista">
                {(props) => (
                    <>
                        <NavigationTracker screenName="ShoppingListStack" />
                        <ShoppingListScreen {...props} />
                    </>
                )}
            </ShoppingListStack.Screen>
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
                headerLeft: () => <ConditionalBackButton />,
                headerRight: () => <UserProfile />,
            }}
        >
            <ReadingOrderStack.Screen name="Lukujärjestys">
                {(props) => (
                    <>
                        <NavigationTracker screenName="ReadingOrderStack" />
                        <ReadingOrderScreen {...props} />
                    </>
                )}
            </ReadingOrderStack.Screen>
        </ReadingOrderStack.Navigator>
    )
}

const ProfileStack = createNativeStackNavigator()

function ProfileStackScreen() {
    const navigation = useNavigation()

    return (
        <ProfileStack.Navigator
            screenOptions={({ route }) => ({
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitle: (props) => <LogoTitle {...props} />,
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => {
                            const fromScreen = route.params?.from || 'HomeStack'
                            navigation.navigate(fromScreen)
                        }}
                        style={[styles.iconButton, styles.backButton]}
                    >
                        <Feather name="arrow-left" size={24} color="black" />
                    </TouchableOpacity>
                ),
                headerRight: () => <UserProfile isActive={true} />,
            })}
        >
            <ProfileStack.Screen name="Omat tiedot" component={ProfileScreen} />
        </ProfileStack.Navigator>
    )
}

const Tab = createBottomTabNavigator()

const tabBarItemStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    paddingBottom: 15,
    paddingHorizontal: 0,
    borderTopWidth: 0,
    flex: 1,
}

const tabBarLabelStyle = {
    fontSize: 10,
    color: '#000',
    marginTop: 2,
    textAlign: 'center',
}

function TabNavigator() {
    const { isDesktop } = useResponsiveDimensions()

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarShowLabel: false,
                headerShown: false,
                tabBarStyle: isDesktop
                    ? { display: 'none' }
                    : {
                          height: 80,
                          paddingHorizontal: 0,
                          paddingBottom: 10,
                          paddingTop: 0,
                          flexDirection: 'row',
                      },
                tabBarIcon: ({ focused }) => {
                    let iconName
                    let iconColor = focused ? '#9C86FC' : 'black'
                    let IconComponent
                    let finnishLabel = ''

                    switch (route.name) {
                        case 'HomeStack':
                            IconComponent = Feather
                            iconName = 'home'
                            finnishLabel = 'Arkiapuri'
                            break
                        case 'MealsStack':
                            IconComponent = FontAwesome6
                            iconName = 'bowl-food'
                            finnishLabel = 'Ateriat'
                            break
                        case 'PantryStack':
                            IconComponent = AntDesign
                            iconName = 'database'
                            finnishLabel = 'Pentteri'
                            break
                        case 'ShoppingListStack':
                            IconComponent = Feather
                            iconName = 'shopping-cart'
                            finnishLabel = 'Ostoslista'
                            break
                        case 'ReadingOrderStack':
                            IconComponent = AntDesign
                            iconName = 'calendar'
                            finnishLabel = 'Lukujärjestys'
                            break
                        default:
                            IconComponent = Feather
                            iconName = 'alert-circle'
                            finnishLabel = route.name.replace('Stack', '')
                    }

                    return (
                        <View
                            style={[
                                tabBarItemStyle,
                                focused && {
                                    borderTopWidth: 3,
                                    borderTopColor: '#9C86FC',
                                },
                            ]}
                        >
                            <IconComponent
                                name={iconName}
                                size={24}
                                color={iconColor}
                            />
                            <CustomText
                                style={[
                                    tabBarLabelStyle,
                                    focused && { color: '#9C86FC' },
                                ]}
                            >
                                {finnishLabel}
                            </CustomText>
                        </View>
                    )
                },
            })}
        >
            <Tab.Screen name="HomeStack" component={HomeStackScreen} />
            <Tab.Screen name="MealsStack" component={MealsStackScreen} />
            <Tab.Screen name="PantryStack" component={PantryStackScreen} />
            <Tab.Screen
                name="ShoppingListStack"
                component={ShoppingListStackScreen}
            />
            <Tab.Screen
                name="ReadingOrderStack"
                component={ReadingOrderStackScreen}
            />
            <Tab.Screen
                name="ProfileStack"
                component={ProfileStackScreen}
                options={{
                    tabBarButton: () => null,
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault()
                        navigation.navigate('ProfileStack', {
                            screen: 'Omat tiedot',
                        })
                    },
                })}
            />
        </Tab.Navigator>
    )
}

const RootStack = createNativeStackNavigator()

// Navigation state persistence (for mobile only - web uses URL-based linking)
const NAVIGATION_STATE_KEY = '@navigation_state'

const getStoredState = async () => {
    // Only use state persistence on mobile (web uses URL-based linking)
    if (Platform.OS !== 'web') {
        try {
            const state = sessionStorage.getItem(NAVIGATION_STATE_KEY)
            return state ? JSON.parse(state) : undefined
        } catch (e) {
            console.warn('Failed to get navigation state', e)
            return undefined
        }
    }
    return undefined
}

const setStoredState = async (state) => {
    // Only persist state on mobile (web uses URL-based linking)
    if (Platform.OS !== 'web') {
        try {
            sessionStorage.setItem(NAVIGATION_STATE_KEY, JSON.stringify(state))
        } catch (e) {
            console.warn('Failed to save navigation state', e)
        }
    }
}

// Web linking configuration
const linking = {
    prefixes: [
        'http://localhost:8081',
        'http://localhost:19006',
        'https://yourdomain.com',
    ], // Add your production domain later
    enabled: true,
    config: {
        screens: {
            Auth: {
                screens: {
                    Tervetuloa: '',
                    'Kirjaudu sisään': 'sign-in',
                    'Luo tunnus': 'sign-up',
                    'Unohtunut salasana': 'forgot-password',
                    'Vaihda salasana': 'reset-password',
                    'Vahvista sähköposti': 'confirm-email',
                    'Lataa profiilikuva': 'upload-image',
                },
            },
            Main: {
                screens: {
                    HomeStack: {
                        screens: {
                            Arkiapuri: 'home',
                        },
                    },
                    MealsStack: {
                        screens: {
                            Ateriat: 'meals',
                        },
                    },
                    PantryStack: {
                        screens: {
                            Pentteri: 'pantry',
                        },
                    },
                    ShoppingListStack: {
                        screens: {
                            Ostoslista: 'shopping-list',
                        },
                    },
                    ReadingOrderStack: {
                        screens: {
                            Lukujärjestys: 'reading-order',
                        },
                    },
                    ProfileStack: {
                        screens: {
                            'Omat tiedot': 'profile',
                        },
                    },
                },
            },
        },
    },
}

export default function Navigation() {
    const { isLoggedIn, isLoading } = useLogin()
    const [isReady, setIsReady] = React.useState(Platform.OS === 'web') // Web is ready immediately (uses linking)
    const [initialState, setInitialState] = React.useState()

    React.useEffect(() => {
        const restoreState = async () => {
            try {
                // Only restore state on mobile (web uses URL-based linking)
                if (Platform.OS !== 'web') {
                    const savedState = await getStoredState()
                    if (savedState !== undefined) {
                        setInitialState(savedState)
                    }
                }
            } catch (e) {
                console.warn('Failed to restore navigation state', e)
            } finally {
                setIsReady(true)
            }
        }

        if (!isReady) {
            restoreState()
        }
    }, [isReady])

    // Wait for auth loading to complete before rendering navigation
    if (!isReady || isLoading) {
        return null
    }

    return (
        <NavigationHistoryProvider>
            <NavigationContainer
                linking={linking}
                initialState={Platform.OS === 'web' ? undefined : initialState}
                onStateChange={(state) => setStoredState(state)}
            >
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
                    {isLoggedIn ? (
                        <RootStack.Screen
                            name="Main"
                            component={TabNavigator}
                        />
                    ) : (
                        <RootStack.Screen
                            name="Auth"
                            component={AuthStackScreen}
                        />
                    )}
                </RootStack.Navigator>
            </NavigationContainer>
        </NavigationHistoryProvider>
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
                headerLeft: () => <ConditionalBackButton />,
            }}
        >
            <HomeStack.Screen
                name="Tervetuloa"
                options={{
                    headerLeft: () => null, // Remove back button for landing screen
                }}
            >
                {(props) => (
                    <>
                        <NavigationTracker screenName="Tervetuloa" />
                        <LandingScreen {...props} />
                    </>
                )}
            </HomeStack.Screen>
            <HomeStack.Screen name="Kirjaudu sisään">
                {(props) => (
                    <>
                        <NavigationTracker screenName="Kirjaudu sisään" />
                        <SignInScreen {...props} />
                    </>
                )}
            </HomeStack.Screen>
            <HomeStack.Screen name="Luo tunnus">
                {(props) => (
                    <>
                        <NavigationTracker screenName="Luo tunnus" />
                        <SignUpScreen {...props} />
                    </>
                )}
            </HomeStack.Screen>
            <HomeStack.Screen name="Lataa profiilikuva">
                {(props) => (
                    <>
                        <NavigationTracker screenName="Lataa profiilikuva" />
                        <ImageUploadScreen {...props} />
                    </>
                )}
            </HomeStack.Screen>
            <HomeStack.Screen name="Vahvista sähköposti">
                {(props) => (
                    <>
                        <NavigationTracker screenName="Vahvista sähköposti" />
                        <ConfirmEmailScreen {...props} />
                    </>
                )}
            </HomeStack.Screen>
            <HomeStack.Screen name="Unohtunut salasana">
                {(props) => (
                    <>
                        <NavigationTracker screenName="Unohtunut salasana" />
                        <ForgotPasswordScreen {...props} />
                    </>
                )}
            </HomeStack.Screen>
            <HomeStack.Screen name="Vaihda salasana">
                {(props) => (
                    <>
                        <NavigationTracker screenName="Vaihda salasana" />
                        <ResetPasswordScreen {...props} />
                    </>
                )}
            </HomeStack.Screen>
        </HomeStack.Navigator>
    )
}
