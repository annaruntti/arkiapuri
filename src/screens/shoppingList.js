import * as React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Button from '../components/Button'

const ShoppingListScreen = ({}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.container}>
                Täällä voit lisätä tuotteita ostoslistaan, sekä käyttää listaa
                apuna kaupassa merkaten tuotteet kerätyksi kun olet kerännyt ne
                ostoskärryysi tai -koriisi.
            </Text>
            <Button title="Lisää tuotteita listaan" />
        </View>
    )
}

export default ShoppingListScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    introText: {
        fontSize: 25,
        textAlign: 'center',
        padding: 20,
        marginBottom: 10,
    },
})
