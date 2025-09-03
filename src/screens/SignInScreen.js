import { Link, useNavigation } from '@react-navigation/native'
import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Alert, StyleSheet, View } from 'react-native'
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
    const { setIsLoggedIn, setProfile, login } = useLogin()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm()

    console.log(errors, 'errors')

    const onSignInPressed = async (data) => {
        console.log('Sign in data:', data)
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
                Alert.alert(
                    'Virhe',
                    response.data.message || 'Kirjautuminen epäonnistui'
                )
            }
        } catch (error) {
            console.error('Login error:', error)
            Alert.alert('Virhe', 'Kirjautuminen epäonnistui')
        }
    }

    const onForgotPasswordPressed = () => {
        navigation.navigate('ForgotPassword')
    }

    const onSignUpPress = () => {
        navigation.navigate('Luo tunnus')
    }

    const onSocialSignIn = async (provider, data) => {
        console.log('Social sign in:', provider, data)
        try {
            // Send the social auth token to your backend
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

                <Link
                    to="/forgot-password"
                    style={styles.forgotPassword}
                    children="Unohditko salasanasi?"
                />

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
    forgotPassword: {
        color: '#9C86FC',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        marginBottom: 24,
        textDecorationLine: 'underline',
    },
    buttonSection: {
        gap: 20,
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
        maxWidth: 300,
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
        maxWidth: 300,
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
