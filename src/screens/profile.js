import * as React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Button from '../components/Button'

const Profile = ({}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.introText}>
                Täällä voit selata, muokata ja lisätä tietojasi.
            </Text>
            <Button
                title="Muokkaa tietoja"
                onPress={() => {
                    console.log('You tapped the button!')
                }}
            />
        </View>
    )
}

export default Profile

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
