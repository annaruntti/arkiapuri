import React from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    useWindowDimensions,
    ScrollView,
    TextInput,
} from 'react-native'
// import Logo from '../../../assets/images/Logo_1.png'
import Button from '../components/Button'
// import SocialSignInButtons from '../../components/SocialSignInButtons'
import { useNavigation } from '@react-navigation/native'
import { useForm, Controller } from 'react-hook-form'
import CustomInput from '../components/CustomInput'

const SignInScreen = () => {
    // const [username, setUsername] = useState('')
    // const [password, setPassword] = useState('')

    const { height } = useWindowDimensions()
    const navigation = useNavigation()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm()

    console.log(errors, 'errors')

    const onSignInPressed = (data) => {
        console.log(data, 'data')
        // validate user
        navigation.navigate('Home')
    }

    const onForgotPasswordPressed = () => {
        navigation.navigate('ForgotPassword')
    }

    const onSignUpPress = () => {
        navigation.navigate('SignUp')
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.root}>
                <View style={styles.header}>
                    {/* <Image
                    source={Logo}
                    style={[styles.logo, { height: height * 0.3 }]}
                    resizeMode="contain"
                /> */}
                    <Text style={styles.headerTitle}>Kirjaudu sisään</Text>
                </View>

                <CustomInput
                    label="Käyttäjänimi"
                    name="username"
                    placeholder="Kirjoita käyttäjätunnuksesi"
                    control={control}
                    rules={{ required: 'Käyttäjänimi on pakollinen tieto' }}
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
                                'Salsanan pituuden tulee olla vähintään 6 merkkiä',
                        },
                    }}
                />
                <View style="buttonView">
                    <Button
                        title="Sign In"
                        onPress={handleSubmit(onSignInPressed)}
                        style={styles.button}
                    />

                    <Button
                        title="Forgot password?"
                        onPress={onForgotPasswordPressed}
                        type="TERTIARY"
                    />

                    {/* <SocialSignInButtons /> */}

                    <Button
                        title="Don't have an account? Create one"
                        onPress={onSignUpPress}
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
        paddingHorizontal: 8,
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
    },
})

export default SignInScreen
