import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Button from '../components/Button'

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.introText}>
                    Tervetuloa Arkiapuriin! Täältä pääset siirtymään aterioiden
                    suunnitteluun ja selaamiseen, lukujärjestykseesi,
                    ruokakomeroon sekä ostoslistaan.
                </Text>
            </View>
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
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    mealsButton: {
        // marginBottom: 20,
    },
    radingOrderButton: {
        // marginBottom: 20,
    },
})
