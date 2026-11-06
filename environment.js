import { Platform } from 'react-native'

const ENV = {
    development: {
        // Expo Go on a physical device: use your computer's LAN IP.
        // Web / simulator: localhost.
        // Prefer EXPO_PUBLIC_API_URL in `.env` over editing these defaults.
        lanApiUrl: 'http://192.168.50.162:3000',
        localApiUrl: 'http://localhost:3000',
    },
    production: {
        // Fallback if EXPO_PUBLIC_API_URL is unset in a production build.
        apiUrl: 'https://api.arkiapuri.fi',
    },
}

const trimTrailingSlash = (url) => url.replace(/\/$/, '')

const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
    const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim()
    if (fromEnv) {
        return { apiUrl: trimTrailingSlash(fromEnv) }
    }

    if (env === 'production') {
        return { apiUrl: trimTrailingSlash(ENV.production.apiUrl) }
    }

    // Prefer localhost on web so a stale LAN IP cannot hang auth/bootstrap.
    const apiUrl =
        Platform.OS === 'web'
            ? ENV.development.localApiUrl
            : ENV.development.lanApiUrl

    return { apiUrl: trimTrailingSlash(apiUrl) }
}

export default getEnvVars
