import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

const isWeb = Platform.OS === 'web'
const SECURE_KEYS = new Set(['userToken', 'token'])

const useSecure = (key) => !isWeb && SECURE_KEYS.has(key)

const storage = {
    setItem: async (key, value) => {
        try {
            const stringValue =
                typeof value === 'string' ? value : JSON.stringify(value)

            if (useSecure(key)) {
                await SecureStore.setItemAsync(key, stringValue)
                return
            }

            if (isWeb) {
                // Prefer sessionStorage for tokens on web (cleared when tab closes).
                if (SECURE_KEYS.has(key)) {
                    sessionStorage.setItem(key, stringValue)
                } else {
                    localStorage.setItem(key, stringValue)
                }
            } else {
                await AsyncStorage.setItem(key, stringValue)
            }
        } catch (e) {
            console.error('Error writing to storage:', e)
        }
    },

    getItem: async (key) => {
        try {
            let value
            if (useSecure(key)) {
                value = await SecureStore.getItemAsync(key)
            } else if (isWeb) {
                value = SECURE_KEYS.has(key)
                    ? sessionStorage.getItem(key) || localStorage.getItem(key)
                    : localStorage.getItem(key)
            } else {
                value = await AsyncStorage.getItem(key)
            }

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
            if (useSecure(key)) {
                await SecureStore.deleteItemAsync(key)
                return
            }
            if (isWeb) {
                sessionStorage.removeItem(key)
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
