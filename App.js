import {
    ApolloClient,
    createHttpLink,
    InMemoryCache,
    ApolloProvider,
} from '@apollo/client'
import { NavigationContainer } from '@react-navigation/native'
// import { StatusBar } from 'expo-status-bar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
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
    const Tab = createBottomTabNavigator()

    return (
        <ApolloProvider client={client}>
            <NavigationContainer>
                <Tab.Navigator>
                    <Tab.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: 'Arkiapuri' }}
                    />
                    <Tab.Screen
                        name="Meals"
                        component={MealsScreen}
                        options={{ title: 'Ateriat' }}
                    />
                    <Tab.Screen
                        name="Pantry"
                        component={PantryScreen}
                        options={{ title: 'Ruokakomero' }}
                    />
                    <Tab.Screen
                        name="Reading order"
                        component={ReadingOrderScreen}
                        options={{ title: 'Lukujärjestys' }}
                    />
                    <Tab.Screen
                        name="Shopping list"
                        component={ShoppingListScreen}
                        options={{ title: 'Ostoslista' }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        </ApolloProvider>
    )
}
