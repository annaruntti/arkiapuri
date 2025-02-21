import * as React from 'react'
import { StyleSheet, View, Alert, Image } from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import { useLogin } from '../context/LoginProvider'
import { useNavigation } from '@react-navigation/native'

const ProfileScreen = () => {
    const { logout, profile } = useLogin()
    const navigation = useNavigation()

    const defaultImage = {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/2wzxlzyydJLVr8T7k67cOO/90074490ee64362fe6f0e384d2b3daf8/arkiapuri-removebg-preview.png',
    }

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
            <View style={styles.profileImageContainer}>
                <Image
                    source={
                        profile?.profileImage
                            ? { uri: profile.profileImage }
                            : defaultImage
                    }
                    style={styles.profileImage}
                />
            </View>
            <CustomText style={styles.introText}>
                <b>{profile?.username}</b>
            </CustomText>
            <CustomText style={styles.userInfoText}>
                Sähköposti: {profile?.email}
            </CustomText>
            <Button
                style={styles.secondaryButton}
                title="Muokkaa tietoja"
                onPress={() => {
                    console.log('You tapped the button!')
                }}
            />
            <Button
                style={styles.tertiaryButton}
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
        padding: 10,
        marginBottom: 10,
    },
    userInfoText: {
        fontSize: 17,
        textAlign: 'center',
        padding: 10,
        marginBottom: 20,
    },
    secondaryButton: {
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
        marginBottom: 10,
        width: '80%',
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: '80%',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
})
