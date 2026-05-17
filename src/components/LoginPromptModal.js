import { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import {
    Alert,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import CustomText from './CustomText'
import Button from './Button'
import SocialSignInButtons from './SocialSignInButtons'
import ResponsiveModal from './ResponsiveModal'

/**
 * LoginPromptModal
 * Shows login prompt at the right moment
 * Supports multiple trigger types: save, ai_feature, sync, premium
 */
const LoginPromptModal = ({
    visible,
    onClose,
    triggerType = 'save',
    customMessage,
    onLoginSuccess,
    onSocialSignIn,
    onContinueWithoutLogin,
}) => {
    const [isSignup, setIsSignup] = useState(false)
    const navigation = useNavigation()
    const { isLoggedIn, login } = useLogin()

    useEffect(() => {
        if (visible && isLoggedIn) {
            onClose()
        }
    }, [visible, isLoggedIn, onClose])

    const getTriggerMessage = () => {
        const messages = {
            save: {
                title: 'Tallenna tietosi turvallisesti',
                subtitle:
                    'Luo tili, niin ostoslistasi, ateriasi ja ruokakomero säilyvät tallessa ja ovat käytettävissä kaikilla laitteillasi.',
                description:
                    'Kaikki tallentuu automaattisesti, jotta voit jatkaa helposti myöhemmin.',
            },
            shopping_list: {
                title: 'Älä hukkaa ostoslistaasi',
                subtitle:
                    'Luo tili, niin listasi säilyy tallessa ja voit käyttää sitä myöhemmin.',
                description:
                    'Näet saman listan helposti kaikilla laitteillasi.',
            },
            meal_create: {
                title: 'Tallenna ateriasi myöhempää käyttöä varten',
                subtitle:
                    'Jatka sisään, niin reseptisi ja suunnitelmasi pysyvät tallessa.',
                description:
                    'Voit palata niihin milloin tahansa ilman, että aloitat alusta.',
            },
            ai_feature: {
                title: 'Haluatko säilyttää tämän?',
                subtitle:
                    'Luo tili, niin tämä ateria ja sen resepti tallentuvat sinulle talteen.',
                description:
                    'Jatka siitä mihin jäit — kaikki tekemäsi tallentuu automaattisesti.',
            },
            sync: {
                title: 'Jatka siitä mihin jäit',
                subtitle:
                    'Luo tili, niin kaikki tekemäsi tallentuu automaattisesti.',
                description:
                    'Käytä ostoslistoja ja aterioita missä ja milloin tahansa.',
            },
            premium: {
                title: 'Avaa Premium',
                subtitle:
                    'Luo tili saadaksesi premium-ominaisuudet käyttöön.',
                description:
                    'Saat rajattomat AI-ominaisuudet, edistyneen ateriansuunnittelun ja paljon muuta.',
            },
        }

        if (customMessage && typeof customMessage === 'object') {
            return {
                ...messages.save,
                ...customMessage,
            }
        }

        if (typeof customMessage === 'string') {
            return {
                ...messages.save,
                subtitle: customMessage,
            }
        }

        return messages[triggerType] || messages.save
    }

    const getEmailButtonTitle = () => {
        if (isSignup) {
            return 'Luo tili ja tallenna'
        }

        if (triggerType === 'ai_feature') {
            return 'Tallenna tietoni'
        }

        return 'Jatka sähköpostiosoitteella'
    }

    const message = getTriggerMessage()

    const handleSocialSignIn = async (provider, data) => {
        if (onSocialSignIn) {
            await onSocialSignIn(provider, data)
            onClose()
            return
        }

        if (onLoginSuccess) {
            await onLoginSuccess(provider, data)
            onClose()
            return
        }

        try {
            if (
                (provider === 'google' ||
                    provider === 'apple' ||
                    provider === 'facebook') &&
                data.user
            ) {
                await storage.setItem('userToken', data.token)
                await login(data.user)
                onClose()
                return
            }

            const response = await axios.post(getServerUrl('/auth/social'), {
                provider,
                token: data.token,
            })

            if (response.data.success) {
                await storage.setItem('userToken', response.data.token)
                await login(response.data.user)
                onClose()
            } else {
                Alert.alert(
                    'Virhe',
                    response.data.message ||
                        'Sosiaalinen kirjautuminen epäonnistui'
                )
            }
        } catch (error) {
            console.error('Social login error:', error)
            Alert.alert('Virhe', 'Sosiaalinen kirjautuminen epäonnistui')
        }
    }

    const handleEmailPress = () => {
        navigation.navigate('Auth', {
            screen: isSignup ? 'Luo tunnus' : 'Kirjaudu sisään',
            params: {
                fromPrompt: true,
            },
        })
    }

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onClose}
            title={message.title}
            maxWidth={480}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <CustomText style={styles.subtitle}>
                        {message.subtitle}
                    </CustomText>
                    <CustomText style={styles.description}>
                        {message.description}
                    </CustomText>
                </View>

                <View style={styles.socialButtonsSection}>
                    <CustomText style={styles.socialLabel}>
                        Jatka valitsemalla
                    </CustomText>
                    <SocialSignInButtons
                        onSocialSignIn={handleSocialSignIn}
                        layout="vertical"
                    />
                </View>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <CustomText style={styles.dividerText}>tai</CustomText>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.emailSection}>
                    <Button
                        title={getEmailButtonTitle()}
                        onPress={handleEmailPress}
                        type="PRIMARY"
                        style={styles.primaryButton}
                        textStyle={styles.primaryButtonText}
                    />
                </View>

                <View style={styles.toggleSection}>
                    <CustomText style={styles.toggleText}>
                        {isSignup
                            ? 'Onko sinulla jo tili? '
                            : 'Ei vielä tiliä? '}
                    </CustomText>
                    <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
                        <CustomText style={styles.toggleLink}>
                            {isSignup ? 'Kirjaudu' : 'Luo tili'}
                        </CustomText>
                    </TouchableOpacity>
                </View>

                <Button
                    title="Jatka ilman kirjautumista"
                    onPress={() => {
                        onClose()
                        if (onContinueWithoutLogin) {
                            onContinueWithoutLogin()
                        }
                    }}
                    type="TERTIARY"
                    style={styles.tertiaryButton}
                    textStyle={styles.tertiaryButtonText}
                />
            </ScrollView>
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
        lineHeight: 22,
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    socialButtonsSection: {
        marginBottom: 16,
    },
    socialLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#999',
        fontSize: 14,
    },
    emailSection: {
        marginBottom: 12,
    },
    primaryButton: {
        width: '100%',
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    primaryButtonText: {
        color: '#000000',
        fontWeight: '600',
        fontSize: 16,
    },
    toggleSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    toggleText: {
        fontSize: 14,
        color: '#666',
    },
    toggleLink: {
        fontSize: 14,
        color: '#9C86FC',
        fontWeight: '600',
    },
    tertiaryButton: {
        width: '100%',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minHeight: 48,
    },
    tertiaryButtonText: {
        textAlign: 'center',
        color: '#5844BB',
        fontWeight: '600',
        fontSize: 14,
    },
})

export default LoginPromptModal
