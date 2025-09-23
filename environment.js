const ENV = {
    development: {
        // For web testing, use localhost
        apiUrl: 'http://localhost:3000',
        // For mobile device testing with Expo Go, use: 'http://192.168.50.179:3000'
    },
    production: {
        apiUrl: 'https://arkiapuri-api-production.up.railway.app', // Railway backend domain
    },
}

const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
    // Temporarily force production environment (uncomment if needed)
    // return ENV['production']

    // Use this when want testing with local backend:
    return ENV[env]
}

export default getEnvVars
