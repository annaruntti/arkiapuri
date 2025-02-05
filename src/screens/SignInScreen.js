import React from 'react'
import {
    View,
    StyleSheet,
    // useWindowDimensions,
    ScrollView,
} from 'react-native'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import { useForm } from 'react-hook-form'

import Button from '../components/Button'
// import SocialSignInButtons from '../../components/SocialSignInButtons'
import CustomInput from '../components/CustomInput'
import CustomText from '../components/CustomText'
import { useLogin } from '../context/LoginProvider'

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

const SignInScreen = () => {
    // const { height } = useWindowDimensions()
    const navigation = useNavigation()
    const { login } = useLogin()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm()

    console.log(errors, 'errors')

    const onSignInPressed = async (data) => {
        console.log('data', data)
        axios
            .post('http://localhost:3001/sign-in', data) // this is for web, in mobile use ip address
            // .post('http://192.168.250.107:3001/sign-in', data)
            .then((response) => {
                console.log('data4', data)
                console.log('response', response)
                if (response.data.success) {
                    const userProfile = response.data.user
                    if (userProfile) {
                        login(userProfile)
                        navigation.navigate('Arkiapuri')
                    } else {
                        console.error('User profile is undefined')
                    }
                }
            })
            .catch((error) => {
                console.error('Error sending data: ', error)
            })
    }

    const onForgotPasswordPressed = () => {
        navigation.navigate('ForgotPassword')
    }

    const onSignUpPress = () => {
        navigation.navigate('Luo tunnus')
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
                <View style={styles.buttonView}>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Kirjaudu sisään"
                            onPress={handleSubmit(onSignInPressed)}
                            style={styles.primaryButton}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Luo käyttäjätunnus"
                            onPress={onSignUpPress}
                            type="TERTIARY"
                            style={styles.tertiaryButton}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Unohditko salasanan?"
                            onPress={onForgotPasswordPressed}
                            type="TERTIARY"
                            style={styles.secondaryButton}
                        />
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
    inputContainer: {
        marginBottom: 10,
    },
    logo: {
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
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
        backgroundColor: '#FACE67',
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
        backgroundColor: '#38E4D9',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
})

export default SignInScreen
