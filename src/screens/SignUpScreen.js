import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import CustomInput from '../components/CustomInput'
// import SocialSignInButtons from '../components/SocialSignInButtons'
import { useNavigation } from '@react-navigation/core'
import { useForm } from 'react-hook-form'
import Button from '../components/Button'

const SignUpScreen = () => {
    const { control, handleSubmit } = useForm()

    const navigation = useNavigation()

    const onRegisterPressed = () => {
        navigation.navigate('ConfirmEmail')
    }

    const onSignInPress = () => {
        navigation.navigate('SignIn')
    }

    const onTermsOfUsePressed = () => {
        console.warn('onTermsOfUsePressed')
    }

    const onPrivacyPressed = () => {
        console.warn('onPrivacyPressed')
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.root}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Luo käyttäjätunnus</Text>
                </View>

                <CustomInput
                    label="Käyttäjänimi"
                    name="username"
                    control={control}
                    placeholder="Kirjoita käyttäjänimesi"
                />
                <CustomInput
                    label="Sähköpostiosoite"
                    name="email"
                    control={control}
                    placeholder="Kirjoita sähköpostiosoitteesi"
                />
                <CustomInput
                    label="Salasana"
                    name="password"
                    control={control}
                    placeholder="Syötä vahva salasana"
                    secureTextEntry
                />
                <CustomInput
                    label="Salasana uudelleen"
                    name="repeatPassword"
                    control={control}
                    placeholder="Syötä salsana uudelleen"
                    secureTextEntry
                />
                <View style={styles.buttonView}>
                    <Button
                        title="Register"
                        style={styles.button}
                        onPress={handleSubmit(onRegisterPressed)}
                    />

                    <Text style={styles.text}>
                        By registering, you confirm that you accept our{' '}
                        <Text style={styles.link} onPress={onTermsOfUsePressed}>
                            Terms of Use
                        </Text>{' '}
                        and{' '}
                        <Text style={styles.link} onPress={onPrivacyPressed}>
                            Privacy Policy
                        </Text>
                    </Text>
                    {/* <SocialSignInButtons /> */}

                    <Button
                        title="Have an account? Sign in"
                        onPress={onSignInPress}
                        type="TERTIARY"
                    />
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
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
    buttonView: {
        paddingvertical: 8,
    },
    button: {
        borderRadius: 25,
        padding: 7,
        elevation: 2,
        backgroundColor: '#FFC121',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
        marginBottom: 8,
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
