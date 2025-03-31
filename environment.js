const ENV = {
    development: {
        apiUrl: 'http://localhost:3000', // Local backend
    },
    production: {
        apiUrl: 'https://arkiapuri-api-production.up.railway.app', // Generated Railway domain
    },
}

const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
    // Temporarily force production environment
    return ENV['production']
    // Return to this when want testing with local backend:
    // return ENV[env]
}

export default getEnvVars
