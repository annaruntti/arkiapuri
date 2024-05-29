import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import CustomInput from '../components/CustomInput'
// import SocialSignInButtons from '../components/SocialSignInButtons'
import { useNavigation } from '@react-navigation/core'
import { useForm } from 'react-hook-form'
import Button from '../components/Button'

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

const SignUpScreen = () => {
    const { control, handleSubmit } = useForm()

    const navigation = useNavigation()

    const onRegisterPressed = () => {
        navigation.navigate('ConfirmEmail')
    }

    const onSignInPress = () => {
        navigation.navigate('Kirjaudu siään')
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
                    name="repeatPassword"
                    control={control}
                    placeholder="Syötä salasana uudelleen"
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
