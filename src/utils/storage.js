import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const isWeb = Platform.OS === 'web'

const storage = {
    setItem: async (key, value) => {
        if (isWeb) {
            localStorage.setItem(key, value)
        } else {
            await AsyncStorage.setItem(key, value)
        }
    },
    getItem: async (key) => {
        if (isWeb) {
            return localStorage.getItem(key)
        } else {
            return await AsyncStorage.getItem(key)
        }
    },
    removeItem: async (key) => {
        if (isWeb) {
            localStorage.removeItem(key)
        } else {
            await AsyncStorage.removeItem(key)
        }
    },
}

export default storage
