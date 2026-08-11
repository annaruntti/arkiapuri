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

const ForgotPasswordScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [feedback, setFeedback] = useState(null)

    const { control, handleSubmit } = useForm()

    const onSendResetEmail = async (data) => {
        if (isLoading) return

        setIsLoading(true)
        setFeedback(null)

        try {
            const response = await axios.post(
                getServerUrl('/auth/forgot-password'),
                {
                    email: data.email,
                }
            )

            const message =
                response.data.message ||
                'Ohjeet salasanan vaihtamiseen on lähetetty sähköpostiisi.'

            if (response.data.success && response.data.emailSent !== false) {
                setEmailSent(true)
                setFeedback({ type: 'success', message })
                showAlert('Sähköposti lähetetty', message)
            } else {
                setFeedback({
                    type: 'error',
                    message:
                        message || 'Sähköpostin lähettäminen epäonnistui',
                })
                showAlert(
                    'Virhe',
                    message || 'Sähköpostin lähettäminen epäonnistui'
                )
                if (
                    typeof __DEV__ !== 'undefined' &&
                    __DEV__ &&
                    response.data.previewUrl
                ) {
                    console.log(
                        'Password reset preview URL:',
                        response.data.previewUrl
                    )
                }
            }
        } catch (error) {
            console.error('Forgot password error:', error)
            const data = error.response?.data
            const message =
                data?.message ||
                'Verkkovirhe. Tarkista internetyhteys ja yritä uudelleen.'
            setFeedback({ type: 'error', message })
            showAlert('Virhe', message)
            if (
                typeof __DEV__ !== 'undefined' &&
                __DEV__ &&
                data?.previewUrl
            ) {
                console.log('Password reset preview URL:', data.previewUrl)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const onBackToSignIn = () => {
        navigation.navigate('Kirjaudu sisään')
    }

    return (
        <AuthLayout
            title={
                emailSent ? 'Sähköposti lähetetty' : 'Unohditko salasanasi?'
            }
            subtitle={
                emailSent
                    ? 'Tarkista sähköpostisi ja seuraa ohjeita.'
                    : 'Syötä sähköpostiosoitteesi alle, niin lähetämme sinulle ohjeet salasanan vaihtamiseen.'
            }
        >
            <View style={authFormStyles.form}>
                {!emailSent ? (
                    <>
                        <CustomInput
                            name="email"
                            label="Sähköpostiosoite"
                            placeholder="Sähköpostiosoite"
                            control={control}
                            rules={{
                                required: 'Sähköpostiosoite on pakollinen',
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: 'Virheellinen sähköpostiosoite',
                                },
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
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
                                        ? 'Lähetetään...'
                                        : 'Lähetä ohjeet'
                                }
                                onPress={handleSubmit(onSendResetEmail)}
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
                                Sähköposti lähetetty!
                            </CustomText>
                            <CustomText style={styles.description}>
                                {feedback?.message ||
                                    'Tarkista sähköpostisi ja seuraa ohjeita salasanan vaihtamiseen. Jos et näe viestiä, tarkista roskaposti-kansio.'}
                            </CustomText>
                        </View>

                        <View style={authFormStyles.buttonSection}>
                            <Button
                                title="Takaisin kirjautumiseen"
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

export default ForgotPasswordScreen
