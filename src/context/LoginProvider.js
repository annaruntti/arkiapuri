import React, { createContext, useContext, useState, useEffect } from 'react'
import storage from '../utils/storage'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'

const LoginContext = createContext()

const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const checkToken = async () => {
            setIsLoading(true)
            try {
                const token = await storage.getItem('userToken')
                console.log('Retrieved token:', token)

                if (token) {
                    const response = await axios.get(getServerUrl('/profile'), {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    console.log('Profile response:', response.data)

                    if (response.data.success) {
                        // Store complete user data including profile image
                        setProfile({
                            ...response.data.user,
                            profileImage:
                                response.data.user.profileImage || null,
                        })
                        setIsLoggedIn(true)
                    } else {
                        await storage.removeItem('userToken')
                        setIsLoggedIn(false)
                    }
                } else {
                    setIsLoggedIn(false)
                }
            } catch (error) {
                console.error('Token verification failed:', error)
                await storage.removeItem('userToken')
                setIsLoggedIn(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkToken()
    }, [])

    const login = async (userProfile) => {
        try {
            // Store both token and profile data
            const token = await storage.getItem('userToken') // Get the token that was just stored
            if (!token) {
                throw new Error('No token found')
            }

            await storage.setItem('isLoggedIn', 'true')
            await storage.setItem('profile', JSON.stringify(userProfile))

            // Update state
            setIsLoggedIn(true)
            setProfile(userProfile)
        } catch (error) {
            console.error('Failed to save login data', error)
            // Clean up if something goes wrong
            await storage.removeItem('userToken')
            await storage.removeItem('isLoggedIn')
            await storage.removeItem('profile')
            throw error // Re-throw to handle in the component
        }
    }

    const logout = async () => {
        try {
            await storage.removeItem('userToken')
            await storage.removeItem('isLoggedIn')
            await storage.removeItem('profile')
            setIsLoggedIn(false)
            setProfile({})
        } catch (error) {
            console.error('Failed to clear login data', error)
        }
    }

    return (
        <LoginContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                profile,
                setProfile,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </LoginContext.Provider>
    )
}

export const useLogin = () => useContext(LoginContext)

export default LoginProvider
