import * as React from 'react'
import { StyleSheet, Text, View, ImageBackground } from 'react-native'
import Button from '../components/Button'

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.homeView}>
            <View style={styles.header}>
                <ImageBackground
                    style={styles.backgroundImage}
                    source={require('../assets/images/letut.png')}
                >
                    <View style={styles.layer}>
                        <Text style={styles.introText}>
                            Tervetuloa Arkiapuriin! Täältä pääset siirtymään
                            aterioiden suunnitteluun ja selaamiseen,
                            lukujärjestykseesi, ruokakomeroon sekä ostoslistaan.
                        </Text>
                    </View>
                </ImageBackground>
            </View>
            <View style={styles.container}>
                <Button
                    style={styles.pantryButton}
                    title="Ruokakomero"
                    onPress={() => navigation.navigate('Pantry')}
                />
                <Button
                    style={styles.mealsButton}
                    title="Ateriat"
                    onPress={() => navigation.navigate('Meals')}
                />
                <Button
                    style={styles.readingOrderButton}
                    title="Lukujärjestys"
                    onPress={() => navigation.navigate('Reading order')}
                />
                <Button
                    style={styles.shoppingListButton}
                    title="Ostoslista"
                    onPress={() => navigation.navigate('Shopping list')}
                />
            </View>
        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    homeView: {
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
