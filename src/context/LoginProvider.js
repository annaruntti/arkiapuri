import React, { createContext, useContext, useState } from 'react'

const LoginContext = createContext()

const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [profile, setProfile] = useState({})

    const login = (userProfile) => {
        setIsLoggedIn(true)
        setProfile(userProfile)
    }

    const logout = () => {
        setIsLoggedIn(false)
        setProfile({})
    }

    return (
        <LoginContext.Provider value={{ isLoggedIn, login, logout, profile }}>
            {children}
        </LoginContext.Provider>
    )
}

export const useLogin = () => useContext(LoginContext)

export default LoginProvider
