const ENV = {
    development: {
        // Use IP address for mobile device testing with Expo Go
        apiUrl: 'http://192.168.50.179:3000', // Your local IP for mobile testing
        // For web testing only, use: 'http://localhost:3000'
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
