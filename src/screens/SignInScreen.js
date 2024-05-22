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
                {/* <Image
                    source={Logo}
                    style={[styles.logo, { height: height * 0.3 }]}
                    resizeMode="contain"
                /> */}
                <Text>Testi</Text>

                <CustomInput
                    name="username"
                    placeholder="Username"
                    control={control}
                />
                <CustomInput
                    name="password"
                    placeholder="Password"
                    secureTextEntry
                    control={control}
                />

                <Controller
                    control={control}
                    name="username"
                    render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder={'username'}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholder={'password'}
                        />
                    )}
                />
                <Button
                    text="Sign In"
                    onPress={handleSubmit(onSignInPressed)}
                />

                {/* <Button
                    text="Forgot password?"
                    onPress={onForgotPasswordPressed}
                    type="TERTIARY"
                />

                <SocialSignInButtons />

                <Button
                    text="Don't have an account? Create one"
                    onPress={onSignUpPress}
                    type="TERTIARY"
                /> */}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
    },
})

export default SignInScreen
