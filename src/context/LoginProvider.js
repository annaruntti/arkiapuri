import React, { createContext, useContext, useState, useEffect } from 'react'
import storage from '../utils/storage'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import { getProfileImageUrl } from '../utils/profileImage'
import {
    readOnboardingComplete,
    writeOnboardingComplete,
} from '../utils/onboarding'

const LoginContext = createContext()

const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [continueWithoutLogin, setContinueWithoutLogin] = useState(false)
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

    useEffect(() => {
        const checkToken = async () => {
            setIsLoading(true)
            try {
                const seenOnboarding = await readOnboardingComplete()
                setHasCompletedOnboarding(seenOnboarding)

                const token = await storage.getItem('userToken')

                if (token) {
                    const response = await axios.get(getServerUrl('/profile'), {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })


                    if (response.data.success) {
                        setProfile({
                            ...response.data.user,
                            profileImage: getProfileImageUrl(response.data.user),
                        })
                        setIsLoggedIn(true)
                        await storage.setItem('isLoggedIn', 'true')
                    } else {
                        await storage.removeItem('userToken')
                        await storage.removeItem('isLoggedIn')
                        setIsLoggedIn(false)
                    }
                } else {
                    setIsLoggedIn(false)
                }
            } catch (error) {
                if (error?.response?.status !== 401) {
                    console.error('Token verification failed:', error)
                }
                await storage.removeItem('userToken')
                await storage.removeItem('isLoggedIn')
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
            setProfile({
                ...userProfile,
                profileImage: getProfileImageUrl(userProfile),
            })
            await writeOnboardingComplete()
            setHasCompletedOnboarding(true)
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
            await storage.removeItem('isLoggedIn')
            await storage.removeItem('profile')
            setIsLoggedIn(false)
            setProfile({})
            setContinueWithoutLogin(false)
        } catch (error) {
            console.error('Failed to clear login data', error)
        }
    }

    const allowContinueWithoutLogin = () => {
        setContinueWithoutLogin(true)
    }

    const completeOnboarding = async () => {
        await writeOnboardingComplete()
        setHasCompletedOnboarding(true)
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
                continueWithoutLogin,
                allowContinueWithoutLogin,
                hasCompletedOnboarding,
                completeOnboarding,
            }}
        >
            {children}
        </LoginContext.Provider>
    )
}

export const useLogin = () => useContext(LoginContext)

export default LoginProvider
