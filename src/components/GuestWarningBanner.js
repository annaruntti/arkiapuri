import { StyleSheet, View } from 'react-native'
import { useLogin } from '../context/LoginProvider'
import CustomText from './CustomText'

/**
 * GuestWarningBanner
 *
 * Shows a yellow warning banner when the user is in guest mode
 * (chose "Jatka ilman kirjautumista"). Use this at the top of any
 * form where data would normally be saved to the backend.
 *
 * Usage:
 *   <GuestWarningBanner message="Tietosi eivät tallennu pysyvästi ilman käyttäjätunnusta." />
 *
 * Or with the default message:
 *   <GuestWarningBanner />
 */
const GuestWarningBanner = ({ message, style }) => {
    const { isLoggedIn, continueWithoutLogin } = useLogin()

    if (isLoggedIn || !continueWithoutLogin) return null

    const text =
        message ||
        '⚠️ Tietosi eivät tallennu pysyvästi ilman käyttäjätunnusta. Kirjaudu sisään tallentaaksesi tiedot.'

    return (
        <View style={[styles.banner, style]}>
            <CustomText style={styles.text}>{text}</CustomText>
        </View>
    )
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#FFF3CD',
        borderColor: '#FFC107',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    text: {
        color: '#856404',
        fontSize: 13,
        textAlign: 'center',
    },
})

export default GuestWarningBanner
