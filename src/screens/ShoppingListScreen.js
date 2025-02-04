import * as React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'

const ShoppingListScreen = ({}) => {
    return (
        <View style={styles.container}>
            <CustomText style={styles.introText}>
                Täällä voit lisätä tuotteita ostoslistalle, sekä käyttää listaa
                apuna kaupassa merkaten tuotteet kerätyksi kun olet kerännyt ne
                ostoskärryysi tai -koriisi.
            </CustomText>
            <Button
                style={styles.primaryButton}
                title="Lisää tuotteita listaan"
            />
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
        padding: 20,
    },
    introText: {
        fontSize: 25,
        textAlign: 'center',
        padding: 20,
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
        minWidth: 50,
    },
})
