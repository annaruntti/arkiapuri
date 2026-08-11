import { useRoute } from '@react-navigation/native'
import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import { showAlert } from '../utils/showAlert'
import { authFormStyles } from '../styles/authFormStyles'

import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import CustomInput from '../components/CustomInput'
import CustomText from '../components/CustomText'

const ResetPasswordScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [passwordReset, setPasswordReset] = useState(false)
    const [feedback, setFeedback] = useState(null)
    const route = useRoute()

    const { control, handleSubmit, watch } = useForm()

    const password = watch('password')

    const onResetPassword = async (data) => {
        if (isLoading) return

        const token =
            route.params?.token ||
            (typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('token')
                : null)

        if (!token) {
            const message =
                'Virheellinen linkki. Pyydä uusi salasanan vaihto.'
            setFeedback({ type: 'error', message })
            showAlert('Virhe', message)
            return
        }

        setIsLoading(true)
        setFeedback(null)
        try {
            const response = await axios.post(
                getServerUrl('/auth/reset-password'),
                {
                    token: token,
                    newPassword: data.password,
                }
            )

            const message =
                response.data.message ||
                'Salasanasi on vaihdettu onnistuneesti. Voit nyt kirjautua sisään uudella salasanalla.'

            if (response.data.success) {
                setPasswordReset(true)
                setFeedback({ type: 'success', message })
                showAlert('Onnistui!', message)
            } else {
                setFeedback({
                    type: 'error',
                    message: message || 'Salasanan vaihto epäonnistui',
                })
                showAlert('Virhe', message || 'Salasanan vaihto epäonnistui')
            }
        } catch (error) {
            console.error('Reset password error:', error)
            const message =
                error.response?.data?.message ||
                'Verkkovirhe. Tarkista internetyhteys ja yritä uudelleen.'
            setFeedback({ type: 'error', message })
            showAlert('Virhe', message)
        } finally {
            setIsLoading(false)
        }
    }

    const onBackToSignIn = () => {
        navigation.navigate('Kirjaudu sisään')
    }

    return (
        <AuthLayout
            title={passwordReset ? 'Salasana vaihdettu' : 'Vaihda salasana'}
            subtitle={
                passwordReset
                    ? 'Voit nyt kirjautua sisään uudella salasanalla.'
                    : 'Syötä uusi salasanasi alle.'
            }
        >
            <View style={authFormStyles.form}>
                {!passwordReset ? (
                    <>
                        <CustomInput
                            name="password"
                            label="Uusi salasana"
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
                            label="Vahvista uusi salasana"
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

                        {feedback?.type === 'error' && (
                            <View style={styles.errorBanner}>
                                <CustomText style={styles.errorBannerText}>
                                    {feedback.message}
                                </CustomText>
                            </View>
                        )}

                        <View style={authFormStyles.buttonSection}>
                            <Button
                                title={
                                    isLoading
                                        ? 'Vaihdetaan...'
                                        : 'Vaihda salasana'
                                }
                                onPress={handleSubmit(onResetPassword)}
                                fullWidth
                                style={authFormStyles.primaryButton}
                                textStyle={authFormStyles.buttonText}
                                disabled={isLoading}
                            />

                            <Button
                                title="Takaisin kirjautumiseen"
                                onPress={onBackToSignIn}
                                type="TERTIARY"
                                fullWidth
                                style={authFormStyles.tertiaryButton}
                                textStyle={authFormStyles.tertiaryButtonText}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.successBanner}>
                            <CustomText style={styles.successMessage}>
                                Salasana vaihdettu!
                            </CustomText>
                            <CustomText style={styles.description}>
                                {feedback?.message ||
                                    'Salasanasi on vaihdettu onnistuneesti. Voit nyt kirjautua sisään uudella salasanallasi.'}
                            </CustomText>
                        </View>

                        <View style={authFormStyles.buttonSection}>
                            <Button
                                title="Kirjaudu sisään"
                                onPress={onBackToSignIn}
                                fullWidth
                                style={authFormStyles.primaryButton}
                                textStyle={authFormStyles.buttonText}
                            />
                        </View>
                    </>
                )}
            </View>
        </AuthLayout>
    )
}

const styles = StyleSheet.create({
    successBanner: {
        width: '100%',
        backgroundColor: '#f0fdf4',
        borderWidth: 1,
        borderColor: '#86efac',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        textAlign: 'left',
        color: '#166534',
        lineHeight: 22,
    },
    successMessage: {
        fontSize: 18,
        fontWeight: '700',
        color: '#15803d',
        marginBottom: 8,
        textAlign: 'left',
    },
    errorBanner: {
        width: '100%',
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    errorBannerText: {
        fontSize: 14,
        color: '#b91c1c',
        lineHeight: 20,
    },
})

export default ResetPasswordScreen
