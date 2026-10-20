import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation, useRoute } from '@react-navigation/core'
import axios from 'axios'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Alert, View } from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import { authFormStyles } from '../styles/authFormStyles'
import { useResponsiveDimensions } from '../utils/responsive'

import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import CustomInput from '../components/CustomInput'
import CustomText from '../components/CustomText'
import { passwordLengthRules } from '../utils/passwordRules'

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

const SignUpScreen = () => {
    const route = useRoute()
    const invitedEmail = route.params?.invitedEmail

    const { control, handleSubmit, watch } = useForm({
        defaultValues: {
            email: invitedEmail || '',
        },
    })
    const pwd = watch('password')

    const navigation = useNavigation()
    const { isDesktop } = useResponsiveDimensions()

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
                        fromPrompt: route.params?.fromPrompt,
                        userData: signInRes.user,
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
        navigation.navigate('Kirjaudu sisään', {
            fromPrompt: route.params?.fromPrompt,
            returnTo: route.params?.returnTo,
        })
    }

    const onTermsOfUsePressed = () => {
        navigation.navigate('Käyttöehdot')
    }

    const onPrivacyPressed = () => {
        navigation.navigate('Tietosuojaseloste')
    }

    return (
        <AuthLayout
            profileCard
            title="Luo käyttäjätunnus"
            subtitle={
                invitedEmail
                    ? `Luo tili osoitteella ${invitedEmail} hyväksyäksesi perhekutsu.`
                    : 'Aloita matka Arkiapurin kanssa luomalla käyttäjätunnus.'
            }
        >
            <View style={authFormStyles.form}>
                <View style={isDesktop ? authFormStyles.desktopFieldRow : undefined}>
                <View style={isDesktop ? authFormStyles.desktopFieldCell : undefined}>
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
                </View>
                <View style={isDesktop ? authFormStyles.desktopFieldCell : undefined}>
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
                </View>
                </View>
                <View style={isDesktop ? authFormStyles.desktopFieldRow : undefined}>
                <View style={isDesktop ? authFormStyles.desktopFieldCell : undefined}>
                <CustomInput
                    label="Salasana"
                    name="password"
                    control={control}
                    placeholder="Syötä vahva salasana"
                    secureTextEntry
                    rules={{
                        required: 'Salasana on pakollinen tieto',
                        ...passwordLengthRules,
                    }}
                />
                </View>
                <View style={isDesktop ? authFormStyles.desktopFieldCell : undefined}>
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
                </View>

                {isDesktop ? (
                    <View
                        style={[
                            authFormStyles.desktopButtonRow,
                            authFormStyles.signupButtons,
                        ]}
                    >
                        <Button
                            title="Luo käyttäjätunnus"
                            onPress={handleSubmit(onRegisterPressed)}
                            style={authFormStyles.desktopCompactButton}
                        />
                        <Button
                            title="Kirjaudu sisään"
                            onPress={onSignInPress}
                            type="TERTIARY"
                            style={authFormStyles.desktopCompactButton}
                        />
                    </View>
                ) : (
                    <View
                        style={[
                            authFormStyles.buttonSection,
                            authFormStyles.signupButtons,
                        ]}
                    >
                        <Button
                            title="Luo käyttäjätunnus"
                            onPress={handleSubmit(onRegisterPressed)}
                            fullWidth
                            style={authFormStyles.primaryButton}
                            textStyle={authFormStyles.buttonText}
                        />
                        <View style={authFormStyles.secondarySection}>
                            <CustomText style={authFormStyles.secondaryText}>
                                Onko sinulla jo käyttäjätunnus?
                            </CustomText>
                            <Button
                                title="Kirjaudu sisään"
                                onPress={onSignInPress}
                                type="TERTIARY"
                                fullWidth
                                style={authFormStyles.tertiaryButton}
                                textStyle={authFormStyles.buttonText}
                            />
                        </View>
                    </View>
                )}

                <CustomText
                    style={[
                        authFormStyles.termsText,
                        isDesktop && authFormStyles.desktopTermsText,
                    ]}
                >
                        Rekisteröitymällä hyväksyt{' '}
                        <CustomText
                            style={authFormStyles.termsLink}
                            onPress={onTermsOfUsePressed}
                        >
                            käyttöehdot
                        </CustomText>{' '}
                        ja{' '}
                        <CustomText
                            style={authFormStyles.termsLink}
                            onPress={onPrivacyPressed}
                        >
                            tietosuojaselosteen
                        </CustomText>
                    </CustomText>
            </View>
        </AuthLayout>
    )
}

export default SignUpScreen
