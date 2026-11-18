import {
    Alert,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import CustomText from './CustomText'

WebBrowser.maybeCompleteAuthSession()

const ALLOWED_PROVIDERS = new Set(['google', 'apple', 'facebook'])

const oauthSessions = new Map()

const closePopupWindow = (popup) => {
    if (!popup) return
    try {
        if (!popup.closed) popup.close()
    } catch {
        // Cross-origin redirects can revoke access to the popup.
    }
}

const endOAuthSession = (provider, sessionId) => {
    const session = oauthSessions.get(provider)
    if (!session || (sessionId && session.id !== sessionId)) return
    oauthSessions.delete(provider)
    clearInterval(session.pollInterval)
    clearTimeout(session.timeoutId)
    closePopupWindow(session.popup)
}

const exchangeCodeForSession = async (code) => {
    const response = await axios.post(getServerUrl('/auth/exchange'), { code })
    if (!response.data?.success || !response.data?.token) {
        throw new Error(response.data?.message || 'Kirjautuminen epäonnistui')
    }
    return {
        token: response.data.token,
        user: response.data.user,
    }
}

const PROVIDER_ICON_COLOR = {
    google: '#C5221F',
    apple: '#000000',
    facebook: '#0C63D4',
}

const SocialProviderButton = ({
    icon,
    color,
    label,
    onPress,
    wide,
    accessibilityLabel,
}) => (
    <TouchableOpacity
        style={[styles.button, wide ? styles.buttonContent : styles.buttonFull]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
    >
        <Ionicons name={icon} size={20} color={color} />
        <CustomText style={styles.buttonText}>{label}</CustomText>
    </TouchableOpacity>
)

const SocialSignInButtons = ({ onSocialSignIn, showDivider = true }) => {
    const { isTablet } = useResponsiveDimensions()
    const googleAuthUrl = `${getServerUrl('')}/auth/google`
    const appleAuthUrl = `${getServerUrl('')}/auth/apple`
    const facebookAuthUrl = `${getServerUrl('')}/auth/facebook`

    const handleGoogleSignIn = () => {
        handleOAuthLogin(googleAuthUrl, 'google')
    }

    const handleAppleSignIn = () => {
        handleOAuthLogin(appleAuthUrl, 'apple')
    }

    const handleFacebookSignIn = () => {
        handleOAuthLogin(facebookAuthUrl, 'facebook')
    }

    const handleOAuthLogin = async (authUrl, provider) => {
        if (!ALLOWED_PROVIDERS.has(provider)) {
            Alert.alert('Virhe', 'Tuntematon kirjautumistapa')
            return
        }
        if (Platform.OS === 'web') {
            handleWebOAuth(authUrl, provider)
        } else {
            handleMobileOAuth(authUrl, provider)
        }
    }

    const handleWebOAuth = (authUrl, provider) => {
        const storageKey = `${provider}_auth_result`
        endOAuthSession(provider)
        localStorage.removeItem(storageKey)

        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2

        const popup = window.open(
            authUrl,
            `${provider} - Kirjautuminen`,
            `width=${width},height=${height},left=${left},top=${top}`
        )

        if (!popup) {
            Alert.alert(
                'Virhe',
                'Kirjautumisikkuna estettiin. Salli ponnahdusikkunat ja yritä uudelleen.'
            )
            return
        }

        const session = {
            id: `${provider}-${Date.now()}`,
            popup,
            pollInterval: null,
            timeoutId: null,
        }
        oauthSessions.set(provider, session)

        const finishSession = () => {
            endOAuthSession(provider, session.id)
            localStorage.removeItem(storageKey)
        }

        session.pollInterval = setInterval(async () => {
            if (oauthSessions.get(provider)?.id !== session.id) return

            let popupClosed = false
            try {
                popupClosed = popup.closed
            } catch {
                popupClosed = false
            }

            const result = localStorage.getItem(storageKey)
            if (!result) {
                if (popupClosed) finishSession()
                return
            }

            finishSession()

            try {
                const authData = JSON.parse(result)
                if (authData.type === 'success' && authData.code) {
                    const authSession = await exchangeCodeForSession(
                        authData.code
                    )
                    onSocialSignIn(provider, authSession)
                } else if (authData.type === 'error') {
                    Alert.alert('Virhe', authData.error)
                } else {
                    Alert.alert('Virhe', 'Kirjautumiskoodi puuttuu')
                }
            } catch (error) {
                Alert.alert(
                    'Virhe',
                    error.message || 'Kirjautuminen epäonnistui'
                )
            }
        }, 500)

        session.timeoutId = setTimeout(finishSession, 60000)
    }

    const handleMobileOAuth = async (authUrl, provider) => {
        try {
            const mobileAuthUrl = `${authUrl}?platform=mobile`
            const redirectUrl = 'arkiapuri://auth/callback'

            const result = await WebBrowser.openAuthSessionAsync(
                mobileAuthUrl,
                redirectUrl
            )

            if (result.type === 'success') {
                const url = result.url
                const urlParts = url.split('?')
                if (urlParts.length > 1) {
                    const params = new URLSearchParams(urlParts[1])
                    const code = params.get('code')
                    const error = params.get('error')

                    if (error) {
                        Alert.alert('Virhe', decodeURIComponent(error))
                    } else if (code) {
                        const session = await exchangeCodeForSession(code)
                        onSocialSignIn(provider, session)
                    } else {
                        Alert.alert('Virhe', 'Kirjautumistiedot puuttuvat')
                    }
                } else {
                    Alert.alert('Virhe', 'Virheellinen callback URL')
                }
            }
        } catch (error) {
            Alert.alert('Virhe', 'Kirjautuminen epäonnistui: ' + error.message)
        }
    }

    return (
        <View style={styles.container}>
            {showDivider && (
                <View style={styles.dividerRow}>
                    <View
                        style={
                            isTablet
                                ? styles.dividerLineShort
                                : styles.dividerLine
                        }
                    />
                    <CustomText
                        style={[
                            styles.dividerText,
                            isTablet && styles.dividerTextStart,
                        ]}
                    >
                        tai
                    </CustomText>
                    <View style={styles.dividerLine} />
                </View>
            )}

            <View style={[styles.buttons, isTablet && styles.buttonsRow]}>
                <SocialProviderButton
                    icon="logo-google"
                    color={PROVIDER_ICON_COLOR.google}
                    label="Google"
                    wide={isTablet}
                    onPress={handleGoogleSignIn}
                    accessibilityLabel="Kirjaudu Googlella"
                />
                {Platform.OS === 'ios' && (
                    <SocialProviderButton
                        icon="logo-apple"
                        color={PROVIDER_ICON_COLOR.apple}
                        label="Apple"
                        wide={isTablet}
                        onPress={handleAppleSignIn}
                        accessibilityLabel="Kirjaudu Applella"
                    />
                )}
                <SocialProviderButton
                    icon="logo-facebook"
                    color={PROVIDER_ICON_COLOR.facebook}
                    label="Facebook"
                    wide={isTablet}
                    onPress={handleFacebookSignIn}
                    accessibilityLabel="Kirjaudu Facebookilla"
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerLineShort: {
        width: 24,
        height: 1,
        backgroundColor: '#ddd',
        marginRight: 12,
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#666',
        fontSize: 14,
    },
    dividerTextStart: {
        marginLeft: 0,
        marginRight: 12,
        textAlign: 'left',
    },
    buttons: {
        gap: 10,
        width: '100%',
    },
    buttonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: 40,
        paddingVertical: 7,
        paddingLeft: 20,
        paddingRight: 20,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#4B5563',
        backgroundColor: '#fff',
    },
    buttonFull: {
        width: '100%',
        alignSelf: 'stretch',
    },
    buttonContent: {
        alignSelf: 'flex-start',
        flexGrow: 0,
        flexShrink: 0,
        width: 'auto',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
})

export default SocialSignInButtons
