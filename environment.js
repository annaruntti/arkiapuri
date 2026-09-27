import { Platform } from 'react-native'

const ENV = {
    development: {
        // Expo Go on a physical device: use your computer's LAN IP.
        // Web / simulator: localhost.
        lanApiUrl: 'http://192.168.50.162:3000',
        localApiUrl: 'http://localhost:3000',
    },
    production: {
        apiUrl: 'https://arkiapuri-api-production.up.railway.app',
    },
}

const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
    if (env === 'production') {
        return ENV.production
    }

    // Prefer localhost on web so a stale LAN IP cannot hang auth/bootstrap.
    const apiUrl =
        Platform.OS === 'web'
            ? ENV.development.localApiUrl
            : ENV.development.lanApiUrl

    return { apiUrl }
}

export default getEnvVars
