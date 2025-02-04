import React, { createContext, useContext, useState, useEffect } from 'react'
import storage from '../utils/storage'

const LoginContext = createContext()

const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState({})

    useEffect(() => {
        const loadStoredData = async () => {
            try {
                const storedIsLoggedIn = await storage.getItem('isLoggedIn')
                const storedProfile = await storage.getItem('profile')

                if (storedIsLoggedIn === 'true' && storedProfile) {
                    setIsLoggedIn(true)
                    setProfile(JSON.parse(storedProfile))
                }
            } catch (error) {
                console.error('Failed to load stored data', error)
            }
        }

        loadStoredData()
    }, [])

    const login = async (userProfile) => {
        try {
            await storage.setItem('isLoggedIn', 'true')
            await storage.setItem('profile', JSON.stringify(userProfile))
            setIsLoggedIn(true)
            setProfile(userProfile)
        } catch (error) {
            console.error('Failed to save login data', error)
        }
    }

    const logout = async () => {
        try {
            await storage.removeItem('isLoggedIn')
            await storage.removeItem('profile')
            setIsLoggedIn(false)
            setProfile({})
        } catch (error) {
            console.error('Failed to clear login data', error)
        }
    }

    return (
        <LoginContext.Provider value={{ isLoggedIn, login, logout, profile }}>
            {children}
        </LoginContext.Provider>
    )
}

export const useLogin = () => useContext(LoginContext)

export default LoginProvider
