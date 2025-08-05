import { Link, useNavigation } from '@react-navigation/native'
import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

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
        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.root}>
                <View style={styles.header}>
                    <CustomText style={styles.headerTitle}>
                        Kirjaudu sisään
                    </CustomText>
                </View>
                <View style={styles.inputContainer}>
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
                        placeholder="Kirjoita salsanasi"
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
                </View>
                <Link
                    to="/forgot-password"
                    style={styles.link}
                    children="Unohditko salasanasi?"
                />
                <View style={styles.buttonView}>
                    <View style={styles.buttonMainContainer}>
                        <Button
                            title="Kirjaudu sisään"
                            onPress={handleSubmit(onSignInPressed)}
                            style={styles.primaryButton}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <CustomText style={styles.text}>
                            Eikö sinulla ole vielä käyttäjätunnusta?
                        </CustomText>
                        <Button
                            title="Luo käyttäjätunnus"
                            onPress={onSignUpPress}
                            type="TERTIARY"
                            style={styles.tertiaryButton}
                        />
                    </View>
                    <SocialSignInButtons onSocialSignIn={onSocialSignIn} />
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#fff',
    },
    root: {
        alignItems: 'left',
        padding: 20,
    },
    header: {
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 5,
    },
    logo: {
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
    },
    buttonView: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    buttonContainer: {
        paddingTop: 10,
        marginBottom: 10,
    },
    buttonMainContainer: {
        marginBottom: 5,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    link: {
        marginBottom: 10,
        color: '#9C86FC',
        fontWeight: 'normal',
        textAlign: 'left',
    },
    text: {
        color: 'gray',
        marginVertical: 10,
        textAlign: 'center',
    },
})

export default SignInScreen
