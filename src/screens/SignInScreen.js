import { useNavigation, useRoute } from '@react-navigation/native'
import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Alert, TouchableOpacity, View } from 'react-native'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import { hasCompletedPersonalization } from '../utils/userPreferences'
import storage from '../utils/storage'
import { authFormStyles } from '../styles/authFormStyles'

import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import CustomInput from '../components/CustomInput'
import CustomText from '../components/CustomText'
import SocialSignInButtons from '../components/SocialSignInButtons'

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

const SignInScreen = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { login } = useLogin()

    const { control, handleSubmit, setError } = useForm()

    const navigateAfterAuth = (user, token) => {
        if (!hasCompletedPersonalization(user)) {
            navigation.navigate('Personoi Arkiapuri', {
                token,
                userData: user,
                fromPrompt: route.params?.fromPrompt,
            })
            return
        }

        if (route.params?.fromPrompt) {
            navigation.navigate('Main')
        } else {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            })
        }
    }

    const onSignInPressed = async (data) => {
        try {
            const response = await axios.post(getServerUrl('/sign-in'), {
                email: data.email,
                password: data.password,
            })

            if (response.data.success) {
                await storage.setItem('userToken', response.data.token)
                await login(response.data.user)
                navigateAfterAuth(response.data.user, response.data.token)
            } else {
                console.error('Sign in failed:', response.data.message)
                const message =
                    response.data.message || 'Kirjautuminen epäonnistui'

                if (
                    message.toLowerCase().includes('password') ||
                    message.toLowerCase().includes('salasana') ||
                    message.toLowerCase().includes('does not match')
                ) {
                    setError('password', {
                        type: 'manual',
                        message: 'Väärä salasana',
                    })
                } else if (
                    message.toLowerCase().includes('email') ||
                    message.toLowerCase().includes('not found') ||
                    message.toLowerCase().includes('user')
                ) {
                    setError('email', {
                        type: 'manual',
                        message: 'Käyttäjää ei löytynyt tällä sähköpostilla',
                    })
                } else {
                    Alert.alert('Virhe', message)
                }
            }
        } catch (error) {
            console.error('Login error:', error)
            const errorMessage = error.response?.data?.message

            if (
                errorMessage &&
                (errorMessage.toLowerCase().includes('password') ||
                    errorMessage.toLowerCase().includes('salasana'))
            ) {
                setError('password', {
                    type: 'manual',
                    message: 'Väärä salasana',
                })
            } else {
                Alert.alert(
                    'Virhe',
                    errorMessage || 'Kirjautuminen epäonnistui'
                )
            }
        }
    }

    const onSignUpPress = () => {
        navigation.navigate('Luo tunnus', {
            fromPrompt: route.params?.fromPrompt,
            returnTo: route.params?.returnTo,
        })
    }

    const onSocialSignIn = async (provider, data) => {
        try {
            if (
                (provider === 'google' ||
                    provider === 'apple' ||
                    provider === 'facebook') &&
                data.user
            ) {
                await storage.setItem('userToken', data.token)
                await login(data.user)
                navigateAfterAuth(data.user, data.token)
                return
            }

            const response = await axios.post(getServerUrl('/auth/social'), {
                provider,
                token: data.token,
            })

            if (response.data.success) {
                await storage.setItem('userToken', response.data.token)
                await login(response.data.user)
                navigateAfterAuth(response.data.user, response.data.token)
            } else {
                Alert.alert(
                    'Virhe',
                    response.data.message ||
                        'Sosiaalinen kirjautuminen epäonnistui'
                )
            }
        } catch (error) {
            console.error('Social login error:', error)
            Alert.alert('Virhe', 'Sosiaalinen kirjautuminen epäonnistui')
        }
    }

    return (
        <AuthLayout
            title="Kirjaudu sisään"
            subtitle="Tervetuloa takaisin! Kirjaudu sisään jatkaaksesi."
        >
            <View style={authFormStyles.form}>
                <CustomInput
                    label="Sähköpostiosoite"
                    name="email"
                    control={control}
                    placeholder="Kirjoita sähköpostiosoitteesi"
                    rules={{
                        pattern: {
                            value: emailRegex,
                            message:
                                'Kirjoita sähköpostiosoitteesi muodossa esim. "matti.meikalainen@gmail.com"',
                        },
                        required: 'Sähköpostiosoite on pakollinen tieto',
                    }}
                />
                <CustomInput
                    label="Salasana"
                    name="password"
                    placeholder="Kirjoita salasanasi"
                    secureTextEntry
                    control={control}
                    rules={{
                        required: 'Salasana on pakollinen tieto',
                        minLength: {
                            value: 6,
                            message:
                                'Salasanan pituuden tulee olla vähintään 6 merkkiä',
                        },
                    }}
                />

                <TouchableOpacity
                    onPress={() => navigation.navigate('Unohtunut salasana')}
                    style={authFormStyles.linkRow}
                >
                    <CustomText style={authFormStyles.link}>
                        Unohditko salasanasi?
                    </CustomText>
                </TouchableOpacity>

                <View style={authFormStyles.buttonSection}>
                    <Button
                        title="Kirjaudu sisään"
                        onPress={handleSubmit(onSignInPressed)}
                        fullWidth
                        style={authFormStyles.primaryButton}
                        textStyle={authFormStyles.buttonText}
                    />

                    <View style={authFormStyles.secondarySection}>
                        <CustomText style={authFormStyles.secondaryText}>
                            Eikö sinulla ole vielä käyttäjätunnusta?
                        </CustomText>
                        <Button
                            title="Luo käyttäjätunnus"
                            onPress={onSignUpPress}
                            type="TERTIARY"
                            fullWidth
                            style={authFormStyles.tertiaryButton}
                            textStyle={authFormStyles.buttonText}
                        />
                    </View>

                    <SocialSignInButtons onSocialSignIn={onSocialSignIn} />
                </View>
            </View>
        </AuthLayout>
    )
}

export default SignInScreen
