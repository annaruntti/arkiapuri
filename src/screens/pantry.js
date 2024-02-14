import * as React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Button from '../components/Button'

const PantryScreen = ({}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.introText}>
                Täällä voit lisätä ja selata elintarvikkeita, joita kotoasi jo
                löytyy ja käyttää niitä avuksi ateriasuunnittelussa ja
                ostoslistan luonnissa.
            </Text>
            <Button title="Lisää elintarvike" />
        </View>
    )
}

export default PantryScreen

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
        padding: 30,
        marginBottom: 20,
    },
})
