import * as React from 'react'
import { StyleSheet, Text, View, ImageBackground } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Button from '../components/Button'

const image = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/3OzNmAlq5mzLJyKIJSlGaX/a02fc998f812267ea2c349285897dd5c/IMG_1682.jpg',
}

const StartScreen = ({ navigation }) => {
    const onSignUpPress = () => {
        navigation.navigate('Kirjaudu sisään')
    }
    return (
        <View style={styles.loginView}>
            <LinearGradient
                // Background Linear Gradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                style={styles.background}
            >
                <ImageBackground
                    // style={{
                    //     width: '100%', // applied to Image
                    //     height: '100%',
                    // }}
                    // imageStyle={{
                    //     resizeMode: 'cover', // works only here!
                    // }}
                    style={styles.image}
                    source={image}
                >
                    <View style={styles.layer}>
                        <View style={styles.textContentArea}>
                            <Text style={styles.introText}>
                                Kirjaudu sisään tai rekisteröidy. Se on helppoa,
                                ilmaista ja vie vain hetken!
                            </Text>
                            <Button
                                title="Aloita kirjautumalla sisään"
                                onPress={onSignUpPress}
                                style={styles.button}
                            />
                        </View>
                    </View>
                </ImageBackground>
            </LinearGradient>
        </View>
    )
}

export default StartScreen

const styles = StyleSheet.create({
    loginView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '90vh',
    },
    textContentArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'top',
        width: '100%',
        padding: 40,
        backgroundColor: '#000000a0',
    },
    introText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        paddingTop: 40,
        paddingBottom: 20,
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    layer: {
        height: '90vh',
    },
    button: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#FFB703',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
})
