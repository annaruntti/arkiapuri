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

const image = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/1IyAq7R57oKbkLeh84dr1v/9b42c88e57eb245980260266810f3823/vecteezy_cartoon-young-woman-sharing-life-moments-at-social-networks_36895727.png',
}

const SignInScreen = () => {
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
        navigation.navigate('Arkiapuri')
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
                    <View style={styles.headerImage}>
                        <Image
                            style={styles.image}
                            source={image}
                            alt="Henkilö käyttämässä puhelintaan"
                            resizeMode={'contain'}
                        />
                    </View>
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
                                'Salasanan pituuden tulee olla vähintään 6 merkkiä',
                        },
                    }}
                />
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
        paddingHorizontal: 20,
    },
    header: {
        paddingVertical: 20,
        paddingTop: 20,
    },
    headerImage: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    image: {
        width: 230,
        height: 160,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 20,
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
