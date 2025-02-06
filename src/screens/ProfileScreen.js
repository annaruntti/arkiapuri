import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'

const ProfileScreen = ({}) => {
    return (
        <View style={styles.container}>
            <CustomText style={styles.introText}>
                Täällä voit selata, muokata ja lisätä tietojasi.
            </CustomText>
            <Button
                style={styles.primaryButton}
                title="Muokkaa tietoja"
                onPress={() => {
                    console.log('You tapped the button!')
                }}
            />
        </View>
    )
}

export default ProfileScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    introText: {
        fontSize: 17,
        textAlign: 'center',
        padding: 20,
        marginBottom: 10,
    },
    primaryButton: {
        borderRadius: 25,
        padding: 15,
        elevation: 2,
    },
})
