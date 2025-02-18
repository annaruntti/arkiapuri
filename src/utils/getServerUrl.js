import { Platform } from 'react-native'
import * as Updates from 'expo-updates'

export const getServerUrl = (endpoint) => {
    if (Platform.OS === 'web') {
        return `http://localhost:3001${endpoint}`
    }

    const { manifest } = Updates
    let debuggerHost = '192.168.250.107' // Default IP for mobile
    if (manifest && manifest.debuggerHost) {
        debuggerHost = manifest.debuggerHost.split(':').shift()
    }
    return `http://${debuggerHost}:3001${endpoint}`
}
