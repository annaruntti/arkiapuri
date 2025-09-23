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

const ForgotPasswordScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const { isDesktop } = useResponsiveDimensions()

    const {
        control,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm()

    const onSendResetEmail = async (data) => {
        if (isLoading) return

        setIsLoading(true)
        try {
            const response = await axios.post(
                getServerUrl('/auth/forgot-password'),
                {
                    email: data.email,
                }
            )

            if (response.data.success) {
                setEmailSent(true)
                Alert.alert(
                    'Sähköposti lähetetty',
                    'Ohjeet salasanan vaihtamiseen on lähetetty sähköpostiisi.'
                )
            } else {
                Alert.alert(
                    'Virhe',
                    response.data.message ||
                        'Sähköpostin lähettäminen epäonnistui'
                )
            }
        } catch (error) {
            console.error('Forgot password error:', error)
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
        <AuthLayout
            title="Unohditko salasanasi?"
            subtitle="Syötä sähköpostiosoitteesi alle, niin lähetämme sinulle ohjeet salasanan vaihtamiseen."
            centerContent={false}
        >
            <View style={styles.form}>
                {!emailSent ? (
                    <>
                        <CustomInput
                            name="email"
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

                        <View style={styles.buttonSection}>
                            <Button
                                title={
                                    isLoading
                                        ? 'Lähetetään...'
                                        : 'Lähetä ohjeet'
                                }
                                onPress={handleSubmit(onSendResetEmail)}
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
                            Sähköposti lähetetty!
                        </CustomText>

                        <CustomText style={styles.description}>
                            Tarkista sähköpostisi ja seuraa ohjeita salasanan
                            vaihtamiseen. Jos et näe viestiä, tarkista
                            roskaposti-kansio.
                        </CustomText>

                        <View style={styles.buttonSection}>
                            <Button
                                title="Takaisin kirjautumiseen"
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
    form: {
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
        lineHeight: 22,
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
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    tertiaryButtonText: {
        color: '#9C86FC',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
})

export default ForgotPasswordScreen
