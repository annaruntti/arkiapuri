import * as React from 'react'
import { StyleSheet, View, Alert } from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import { useLogin } from '../context/LoginProvider'
import { useNavigation } from '@react-navigation/native'

const ProfileScreen = () => {
    const { logout, profile } = useLogin()
    const navigation = useNavigation()

    const handleLogout = async () => {
        try {
            await logout()
            // Navigation will be handled automatically by the Navigation component
            // since it's watching isLoggedIn state
        } catch (error) {
            console.error('Logout error:', error)
            Alert.alert('Virhe', 'Uloskirjautuminen epäonnistui')
        }
    }

    return (
        <View style={styles.container}>
            <CustomText style={styles.introText}>
                Täällä voit selata, muokata ja lisätä tietojasi.
            </CustomText>
            <CustomText>Sähköposti: {profile?.email}</CustomText>
            <Button
                style={styles.primaryButton}
                title="Muokkaa tietoja"
                onPress={() => {
                    console.log('You tapped the button!')
                }}
            />
            <Button
                style={styles.logoutButton}
                title="Kirjaudu ulos"
                onPress={handleLogout}
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
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#FACE67',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
    logoutButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#FACE67',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
})
