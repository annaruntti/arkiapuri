import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
    ApolloProvider,
} from '@apollo/client'
import { NavigationContainer } from '@react-navigation/native'
// import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from './src/screens/home'
import MealsScreen from './src/screens/meals'
import ReadingOrderScreen from './src/screens/readingOrder'
import PantryScreen from './src/screens/pantry'
import ShoppingListScreen from './src/screens/shoppingList'
import { View } from 'react-native'

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

export default function App() {
    const Stack = createNativeStackNavigator()
    // const Tab = createBottomTabNavigator()

    return (
        <ApolloProvider client={client}>
            <NavigationContainer>
                {/* <View style={styles.container}>
            <Text>Open up App.js to start working on your app!</Text>
            <Button/>
            <StatusBar style="auto" />
          </View> */}
                <Stack.Navigator>
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: 'Arkiapuri' }}
                    ></Stack.Screen>
                    <Stack.Screen name="Pantry" component={PantryScreen} />
                    <Stack.Screen name="Meals" component={MealsScreen} />
                    <Stack.Screen
                        name="Reading order"
                        component={ReadingOrderScreen}
                    />
                    <Stack.Screen
                        name="Shopping list"
                        component={ShoppingListScreen}
                    />
                </Stack.Navigator>
                {/* <Tab.Navigator>
                    <Tab.Screen name="Home" component={HomeScreen} />
                    <Tab.Screen name="Pantry" component={PantryScreen} />
                </Tab.Navigator> */}
            </NavigationContainer>
        </ApolloProvider>
    )
}
