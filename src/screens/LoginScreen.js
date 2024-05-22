import * as React from 'react'
import { StyleSheet, Text, View, ImageBackground } from 'react-native'
import Button from '../components/Button'

const LoginScreen = ({ navigation }) => {
    return (
        <View style={styles.loginView}>
            <View style={styles.header}>
                <ImageBackground
                    style={styles.backgroundImage}
                    source={require('../assets/images/IMG_0842.png')}
                >
                    <View style={styles.layer}>
                        <Text style={styles.introText}>
                            Kirjaudu sisään tai rekisteröidy. Se on helppoa,
                            ilmaista ja vie vain hetken!
                        </Text>
                    </View>
                    <View style={styles.container}>
                        <Button
                            style={styles.loginButton}
                            title="Kirjaudu sisään"
                            onPress={() => navigation.navigate('Pantry')}
                        />
                        <Button
                            style={styles.registerButton}
                            title="Rekisteröidy"
                            onPress={() => navigation.navigate('Meals')}
                        />
                    </View>
                </ImageBackground>
            </View>
        </View>
    )
}

export default LoginScreen

const styles = StyleSheet.create({
    loginView: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    introText: {
        fontSize: 25,
        textAlign: 'center',
        padding: 20,
        marginBottom: 10,
    },
    header: {
        minHeight: 400,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
    layer: {
        backgroundColor: 'rgba(248, 247, 216, 0.7)',
        width: '100%',
        height: '100%',
    },
})
