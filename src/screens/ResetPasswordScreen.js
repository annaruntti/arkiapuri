import { useRoute } from '@react-navigation/native'
import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, StyleSheet, View } from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'

import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import CustomInput from '../components/CustomInput'
import CustomText from '../components/CustomText'

const ResetPasswordScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [passwordReset, setPasswordReset] = useState(false)
    const { isDesktop } = useResponsiveDimensions()
    const route = useRoute()

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm()

    const password = watch('password')

    const onResetPassword = async (data) => {
        if (isLoading) return

        const token =
            route.params?.token ||
            new URLSearchParams(window.location.search).get('token')

        if (!token) {
            Alert.alert(
                'Virhe',
                'Virheellinen linkki. Pyydä uusi salasanan vaihto.'
            )
            return
        }

        setIsLoading(true)
        try {
            const response = await axios.post(
                getServerUrl('/auth/reset-password'),
                {
                    token: token,
                    newPassword: data.password,
                }
            )

            if (response.data.success) {
                setPasswordReset(true)
                Alert.alert(
                    'Onnistui!',
                    'Salasanasi on vaihdettu onnistuneesti. Voit nyt kirjautua sisään uudella salasanalla.'
                )
            } else {
                Alert.alert(
                    'Virhe',
                    response.data.message || 'Salasanan vaihto epäonnistui'
                )
            }
        } catch (error) {
            console.error('Reset password error:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    'Verkkovirhe. Tarkista internetyhteys ja yritä uudelleen.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const onBackToSignIn = () => {
        navigation.navigate('Kirjaudu sisään')
    }

    return (
        <AuthLayout title="Vaihda salasana" centerContent={false}>
            <View style={styles.container}>
                {!passwordReset ? (
                    <>
                        <CustomText style={styles.description}>
                            Syötä uusi salasanasi alle.
                        </CustomText>

                        <CustomInput
                            name="password"
                            placeholder="Uusi salasana"
                            control={control}
                            rules={{
                                required: 'Salasana on pakollinen',
                                minLength: {
                                    value: 6,
                                    message:
                                        'Salasanan pituuden tulee olla vähintään 6 merkkiä',
                                },
                            }}
                            secureTextEntry
                        />

                        <CustomInput
                            name="confirmPassword"
                            placeholder="Vahvista uusi salasana"
                            control={control}
                            rules={{
                                required: 'Salasanan vahvistus on pakollinen',
                                validate: (value) =>
                                    value === password ||
                                    'Salasanat eivät täsmää',
                            }}
                            secureTextEntry
                        />

                        <View style={styles.buttonSection}>
                            <Button
                                title={
                                    isLoading
                                        ? 'Vaihdetaan...'
                                        : 'Vaihda salasana'
                                }
                                onPress={handleSubmit(onResetPassword)}
                                style={styles.primaryButton}
                                textStyle={styles.buttonText}
                                disabled={isLoading}
                            />

                            <Button
                                title="Takaisin kirjautumiseen"
                                onPress={onBackToSignIn}
                                style={styles.tertiaryButton}
                                textStyle={styles.tertiaryButtonText}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <CustomText style={styles.successMessage}>
                            Salasana vaihdettu!
                        </CustomText>

                        <CustomText style={styles.description}>
                            Salasanasi on vaihdettu onnistuneesti. Voit nyt
                            kirjautua sisään uudella salasanallasi.
                        </CustomText>

                        <View style={styles.buttonSection}>
                            <Button
                                title="Kirjaudu sisään"
                                onPress={onBackToSignIn}
                                style={styles.primaryButton}
                                textStyle={styles.buttonText}
                            />
                        </View>
                    </>
                )}
            </View>
        </AuthLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
        lineHeight: 22,
        maxWidth: 400,
    },
    successMessage: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonSection: {
        gap: 10,
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
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    tertiaryButtonText: {
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
})

export default ResetPasswordScreen
