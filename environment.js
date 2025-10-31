const ENV = {
    development: {
        // For mobile device testing with Expo Go, use your computer's IP
        apiUrl: 'http://<your-ip-address>:3000',
        // For web testing, use:
        // apiUrl: 'http://localhost:3000',
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
