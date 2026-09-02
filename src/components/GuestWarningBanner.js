import { StyleSheet } from 'react-native'
import { useLogin } from '../context/LoginProvider'
import NoticeBanner from './NoticeBanner'

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
        'Tietosi eivät tallennu pysyvästi ilman käyttäjätunnusta. Kirjaudu sisään tallentaaksesi tiedot.'

    return (
        <NoticeBanner variant="warning" style={style} textStyle={styles.text}>
            {text}
        </NoticeBanner>
    )
}

const styles = StyleSheet.create({
    text: {
        fontSize: 13,
        textAlign: 'center',
    },
})

export default GuestWarningBanner
