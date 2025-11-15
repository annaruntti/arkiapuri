import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import CustomInput from '../components/CustomInput'
import CustomText from '../components/CustomText'
import SocialSignInButtons from '../components/SocialSignInButtons'

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

const SignInScreen = () => {
    const navigation = useNavigation()
    const { login } = useLogin()

    const { control, handleSubmit, setError } = useForm()

    const onSignInPressed = async (data) => {
        try {
            const response = await axios.post(getServerUrl('/sign-in'), {
                email: data.email,
                password: data.password,
            })

            if (response.data.success) {
                await storage.setItem('userToken', response.data.token)
                await login(response.data.user)
            } else {
                console.error('Sign in failed:', response.data.message)
                const message =
                    response.data.message || 'Kirjautuminen epäonnistui'

                // Show error in password field if it's a credential error
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
        navigation.navigate('Luo tunnus')
    }

    const onSocialSignIn = async (provider, data) => {
        try {
            // If provider is 'google' or 'apple' and we have user data, we already have a JWT token from OAuth
            // No need to call /auth/social again
            if ((provider === 'google' || provider === 'apple') && data.user) {
                console.log(
                    `Using existing JWT token from ${provider} OAuth flow`
                )
                await storage.setItem('userToken', data.token)
                await login(data.user)
                return
            }

            // For demo mode, send to backend
            const response = await axios.post(getServerUrl('/auth/social'), {
                provider,
                token: data.token,
            })

            if (response.data.success) {
                await storage.setItem('userToken', response.data.token)
                await login(response.data.user)
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
            <View style={styles.form}>
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
                    style={styles.forgotPasswordContainer}
                >
                    <CustomText style={styles.forgotPassword}>
                        Unohditko salasanasi?
                    </CustomText>
                </TouchableOpacity>

                <View style={styles.buttonSection}>
                    <Button
                        title="Kirjaudu sisään"
                        onPress={handleSubmit(onSignInPressed)}
                        style={styles.primaryButton}
                        textStyle={styles.buttonText}
                    />

                    <View style={styles.signUpSection}>
                        <CustomText style={styles.signUpText}>
                            Eikö sinulla ole vielä käyttäjätunnusta?
                        </CustomText>
                        <Button
                            title="Luo käyttäjätunnus"
                            onPress={onSignUpPress}
                            style={styles.tertiaryButton}
                            textStyle={styles.buttonText}
                        />
                    </View>

                    <SocialSignInButtons onSocialSignIn={onSocialSignIn} />
                </View>
            </View>
        </AuthLayout>
    )
}

const styles = StyleSheet.create({
    form: {
        width: '100%',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-start',
        marginBottom: 24,
    },
    forgotPassword: {
        color: '#9C86FC',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        textDecorationLine: 'underline',
    },
    buttonSection: {
        gap: 10,
    },
    signUpSection: {
        alignItems: 'center',
        gap: 12,
    },
    signUpText: {
        color: '#6b7280',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        width: '100%',
        alignSelf: 'center',
        marginBottom: 10,
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        width: '100%',
        alignSelf: 'center',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
})

export default SignInScreen
