import React, { createContext, useState, useContext, useEffect } from 'react'
import storage from '../utils/storage'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)

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
                } else {
                    await storage.removeItem('userToken')
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error)
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
        } catch (error) {
            console.error('Login failed:', error)
        }
    }

    const logout = async () => {
        try {
            await storage.removeItem('userToken')
            setUser(null)
            setIsAuthenticated(false)
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
