import * as React from 'react'
import { StyleSheet, Text, View, ImageBackground } from 'react-native'
import Button from '../components/Button'
import images from '../assets/images'

const StartScreen = ({ navigation }) => {
    const onSignUpPress = () => {
        navigation.navigate('Kirjaudu sisään')
    }
    return (
        <View style={styles.loginView}>
            <View style={styles.header}>
                <ImageBackground
                    style={{
                        width: '100%', // applied to Image
                        height: '100%',
                    }}
                    imageStyle={{
                        resizeMode: 'covern', // works only here!
                    }}
                    source={images.startViewImage}
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
            </View>
        </View>
    )
}

export default StartScreen

const styles = StyleSheet.create({
    loginView: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    textContentArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'top',
        width: '100%',
        padding: 40,
    },
    introText: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        paddingTop: 20,
        paddingBottom: 20,
        marginBottom: 10,
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
        backgroundColor: '#FFC121',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
})
