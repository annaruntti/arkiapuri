import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation, useRoute } from '@react-navigation/core'
import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Alert, StyleSheet, View } from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'

import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import CustomInput from '../components/CustomInput'
import CustomText from '../components/CustomText'

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

const SignUpScreen = () => {
    const route = useRoute()
    const invitedEmail = route.params?.invitedEmail
    
    const { control, handleSubmit, watch } = useForm({
        defaultValues: {
            email: invitedEmail || '',
        }
    })
    const pwd = watch('password')

    const navigation = useNavigation()

    const onRegisterPressed = async (data) => {
        try {
            const response = await axios.post(
                getServerUrl('/create-user'),
                data
            )

            if (response.data.success) {
                const signInData = {
                    email: data.email,
                    password: data.password,
                }

                const signInResponse = await axios.post(
                    getServerUrl('/sign-in'),
                    signInData
                )
                const signInRes = signInResponse.data
                if (signInRes.success) {
                    await AsyncStorage.setItem('userToken', signInRes.token)
                    navigation.navigate('Lataa profiilikuva', {
                        token: signInRes.token,
                    })
                } else {
                    Alert.alert(
                        'Virhe',
                        signInRes.message ||
                            'Kirjautuminen epäonnistui rekisteröinnin jälkeen'
                    )
                }
            } else {
                Alert.alert(
                    'Virhe',
                    response.data.message || 'Rekisteröinti epäonnistui'
                )
            }
        } catch (error) {
            console.error('Error sending data: ', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Rekisteröinti epäonnistui'
            )
        }
    }

    const onSignInPress = () => {
        navigation.navigate('Kirjaudu sisään')
    }

    const onTermsOfUsePressed = () => {}

    const onPrivacyPressed = () => {}

    return (
        <AuthLayout
            title="Luo käyttäjätunnus"
            subtitle={
                invitedEmail 
                    ? `Luo tili osoitteella ${invitedEmail} hyväksyäksesi perhekutsu.`
                    : "Aloita matka Arkiapurin kanssa luomalla käyttäjätunnus."
            }
        >
            <View style={styles.form}>
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
                    editable={!invitedEmail}
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

                <View style={styles.buttonSection}>
                    <Button
                        title="Luo käyttäjätunnus"
                        onPress={handleSubmit(onRegisterPressed)}
                        style={styles.primaryButton}
                        textStyle={styles.buttonText}
                    />

                    <View style={styles.signInSection}>
                        <CustomText style={styles.signInText}>
                            Onko sinulla jo käyttäjätunnus?
                        </CustomText>
                        <Button
                            title="Kirjaudu sisään"
                            onPress={onSignInPress}
                            style={styles.tertiaryButton}
                            textStyle={styles.buttonText}
                        />
                    </View>

                    <View style={styles.termsSection}>
                        <CustomText style={styles.termsText}>
                            Rekisteröitymällä hyväksyt{' '}
                            <CustomText
                                style={styles.link}
                                onPress={onTermsOfUsePressed}
                            >
                                käyttöehdot
                            </CustomText>{' '}
                            ja{' '}
                            <CustomText
                                style={styles.link}
                                onPress={onPrivacyPressed}
                            >
                                tietosuojaselosteen
                            </CustomText>
                        </CustomText>
                    </View>
                </View>
            </View>
        </AuthLayout>
    )
}

const styles = StyleSheet.create({
    form: {
        width: '100%',
    },
    buttonSection: {
        marginTop: 8,
        gap: 20,
    },
    signInSection: {
        alignItems: 'center',
        gap: 12,
    },
    signInText: {
        color: '#6b7280',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    termsSection: {
        marginTop: 8,
    },
    termsText: {
        color: '#6b7280',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    link: {
        color: '#9C86FC',
        fontWeight: '600',
        textDecorationLine: 'underline',
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

export default SignUpScreen
