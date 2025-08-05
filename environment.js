const ENV = {
    development: {
        apiUrl: 'http://localhost:3000', // Local backend for testing in web
        // For mobile device testing, uncomment below and comment above:
        // apiUrl: 'http://(local-ip-address):3000', // local IP - update as needed
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
