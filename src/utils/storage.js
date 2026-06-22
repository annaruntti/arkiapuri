import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const isWeb = Platform.OS === 'web'

const storage = {
    setItem: async (key, value) => {
        try {
            const stringValue =
                typeof value === 'string'
                    ? value
                    : JSON.stringify(value)

            if (isWeb) {
                localStorage.setItem(key, stringValue)
            } else {
                await AsyncStorage.setItem(key, stringValue)
            }
        } catch (e) {
            console.error('Error writing to storage:', e)
        }
    },

    getItem: async (key) => {
        try {
            const value = isWeb
                ? localStorage.getItem(key)
                : await AsyncStorage.getItem(key)

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
            if (isWeb) {
                localStorage.removeItem(key)
            } else {
                await AsyncStorage.removeItem(key)
            }
        } catch (e) {
            console.error('Error removing from storage:', e)
        }
    },
}

export default storage