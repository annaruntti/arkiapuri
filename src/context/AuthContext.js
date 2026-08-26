import React, { createContext, useState, useContext, useEffect } from 'react'
import storage from '../utils/storage'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)
    const [isGuest, setIsGuest] = useState(true) // Guest mode by default

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const token = await storage.getItem('userToken')
            if (token) {
                // Verify token with backend
                const response = await axios.get(getServerUrl('/profile'), {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (response.data.success) {
                    setUser(response.data.user)
                    setIsAuthenticated(true)
                    setIsGuest(false) // Exit guest mode
                } else {
                    await storage.removeItem('userToken')
                }
            }
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error('Auth check failed:', error)
            }
            await storage.removeItem('userToken')
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (token, userData) => {
        try {
            await storage.setItem('userToken', token)
            setUser(userData)
            setIsAuthenticated(true)
            setIsGuest(false) // Exit guest mode
        } catch (error) {
            console.error('Login failed:', error)
        }
    }

    const logout = async () => {
        try {
            const token = await storage.getItem('userToken')
            if (token) {
                try {
                    await axios.post(
                        getServerUrl('/sign-out'),
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )
                } catch (error) {
                    console.error('Server sign-out failed:', error)
                }
            }

            await storage.removeItem('userToken')
            setUser(null)
            setIsAuthenticated(false)
            setIsGuest(true) // Return to guest mode
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                isGuest,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
