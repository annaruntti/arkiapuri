import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const isWeb = Platform.OS === 'web'

const storage = {
    setItem: async (key, value) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.setItem(key, value)
            }
            // Convert value to string if it's not already
            const stringValue =
                typeof value === 'string' ? value : JSON.stringify(value)

            if (isWeb) {
                console.log(`Web: Stored ${key}:`, stringValue)
            } else {
                await AsyncStorage.setItem(key, stringValue)
                console.log(`Mobile: Stored ${key}:`, stringValue)
            }
        } catch (e) {
            console.error('Error writing to storage:', e)
        }
    },
    getItem: async (key) => {
        try {
            if (Platform.OS === 'web') {
                return localStorage.getItem(key)
            }
            let value
            if (isWeb) {
                value = window.localStorage.getItem(key)
            } else {
                value = await AsyncStorage.getItem(key)
            }

            console.log(`Retrieved ${key}:`, value)

            // Try to parse JSON, return original string if parsing fails
            try {
                return value ? JSON.parse(value) : null
            } catch {
                return value
            }
        } catch (e) {
            console.error('Error reading from storage:', e)
            return null
        }
    },
    removeItem: async (key) => {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem(key)
            }
            if (isWeb) {
                window.localStorage.removeItem(key)
                console.log(`Web: Removed ${key}`)
            } else {
                await AsyncStorage.removeItem(key)
                console.log(`Mobile: Removed ${key}`)
            }
        } catch (e) {
            console.error('Error removing from storage:', e)
        }
    },
}

// test function
const testStorage = async () => {
    try {
        // Test string storage
        await storage.setItem('test-string', 'test-value')
        const stringResult = await storage.getItem('test-string')
        console.log('String test result:', stringResult)

        // Test object storage
        const testObj = { test: 'value', number: 123 }
        await storage.setItem('test-object', testObj)
        const objResult = await storage.getItem('test-object')
        console.log('Object test result:', objResult)

        // Cleanup
        await storage.removeItem('test-string')
        await storage.removeItem('test-object')
        console.log('Test cleanup done')
    } catch (error) {
        console.error('Storage test failed:', error)
    }
}

// Run the test
testStorage()

export default storage
