import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import * as Updates from 'expo-updates'

import CustomInput from '../components/CustomInput'
// import SocialSignInButtons from '../components/SocialSignInButtons'
import Button from '../components/Button'
import CustomText from '../components/CustomText'

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

const SignUpScreen = () => {
    const { control, handleSubmit, watch } = useForm()
    const pwd = watch('password')

    const navigation = useNavigation()

    const getServerUrl = (endpoint) => {
        const { manifest } = Updates
        let debuggerHost = 'localhost' // Default to localhost for web
        if (manifest && manifest.debuggerHost) {
            debuggerHost = manifest.debuggerHost.split(':').shift()
        } else {
            // Fallback to a hardcoded IP address for development
            debuggerHost = '192.168.250.107'
        }
        const serverUrl = `http://${debuggerHost}:3001${endpoint}`
        console.log('Manifest:', manifest)
        console.log('Debugger Host:', debuggerHost)
        console.log('Server URL:', serverUrl) // log to verify the URL
        return serverUrl
    }

    const onRegisterPressed = async (data) => {
        try {
            const response = await axios.post(
                getServerUrl('/create-user'),
                data
            )
            console.log('response', response)

            // Extract only the necessary fields for sign-in
            const signInData = {
                email: data.email,
                password: data.password,
            }

            const signInResponse = await axios.post(
                getServerUrl('/sign-in'),
                signInData
            )
            const signInRes = signInResponse.data
            console.log('signInRes', signInRes)
            if (signInRes.success) {
                navigation.navigate('Lataa profiilikuva', {
                    token: signInRes.token,
                })
            }
        } catch (error) {
            console.error('Error sending data: ', error)
        }
    }

    const onSignInPress = () => {
        navigation.navigate('Kirjaudu sisään')
    }

    const onTermsOfUsePressed = () => {
        console.warn('onTermsOfUsePressed')
    }

    const onPrivacyPressed = () => {
        console.warn('onPrivacyPressed')
    }

    return (
        <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.root}>
                <View style={styles.header}>
                    <CustomText style={styles.headerTitle}>
                        Luo käyttäjätunnus
                    </CustomText>
                </View>
                <View style={styles.inputContainer}>
                    <CustomInput
                        label="Käyttäjänimi"
                        name="username"
                        control={control}
                        placeholder="Kirjoita käyttäjänimesi"
                        rules={{
                            required: 'Käyttäjätunnus on pakollinen tieto',
                            minLength: {
                                value: 6,
                                message:
                                    'Käyttäjätunnuksen pituuden tulee olla vähintään 6 merkkiä',
                            },
                            maxLength: {
                                value: 24,
                                message:
                                    'Käyttäjätunnuksen pituuden tulee olla enintään 24 merkkiä',
                            },
                        }}
                    />
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
                        control={control}
                        placeholder="Syötä vahva salasana"
                        secureTextEntry
                        rules={{
                            required: 'Salasana on pakollinen tieto',
                            minLength: {
                                value: 6,
                                message:
                                    'Salasanan pituuden tulee olla vähintään 6 merkkiä',
                            },
                            maxLength: {
                                value: 24,
                                message:
                                    'Salasanan pituuden tulee olla enintään 24 merkkiä',
                            },
                        }}
                    />
                    <CustomInput
                        label="Salasana uudelleen"
                        name="confirmPassword"
                        control={control}
                        placeholder="Syötä salasana uudelleen"
                        secureTextEntry
                        rules={{
                            validate: (value) =>
                                value === pwd || 'Salasana ei täsmää',
                        }}
                    />
                </View>
                <View style={styles.buttonView}>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Tallenna"
                            style={styles.primaryButton}
                            onPress={handleSubmit(onRegisterPressed)}
                        />
                    </View>
                    {/* <SocialSignInButtons /> */}
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Sisäänkirjautumiseen"
                            onPress={onSignInPress}
                            type="TERTIARY"
                            style={styles.secondaryButton}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <CustomText style={styles.text}>
                            By registering, you confirm that you accept our{' '}
                            <CustomText
                                style={styles.link}
                                onPress={onTermsOfUsePressed}
                            >
                                Terms of Use
                            </CustomText>{' '}
                            and{' '}
                            <CustomText
                                style={styles.link}
                                onPress={onPrivacyPressed}
                            >
                                Privacy Policy
                            </CustomText>
                        </CustomText>
                    </View>
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
    logo: {
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
    },
    inputContainer: {
        marginBottom: 10,
    },
    buttonView: {
        paddingVertical: 10,
    },
    buttonContainer: {
        marginBottom: 10,
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
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
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
    text: {
        color: 'gray',
        marginVertical: 10,
    },
    link: {
        color: '#FDB075',
    },
})

export default SignUpScreen
