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
import { useResponsiveDimensions } from '../utils/responsive'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import CustomText from './CustomText'
import Button from './Button'
import SocialSignInButtons from './SocialSignInButtons'
import ResponsiveModal from './ResponsiveModal'
import { openAuthScreen } from '../utils/authNavigation'

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
    const { isTablet } = useResponsiveDimensions()
    // Tablet breakpoint includes desktop widths (>= 690)
    const useWideLayout = isTablet

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
                    'Kirjaudu sisään tai luo käyttäjätunnus, niin reseptisi ja ateriasuunnitelmasi pysyvät tallessa.',
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

    const navigateToAuth = (screen) => {
        onClose()
        openAuthScreen(navigation, screen, { fromPrompt: true })
    }

    const handleEmailPress = () => {
        navigateToAuth(isSignup ? 'Luo tunnus' : 'Kirjaudu sisään')
    }

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onClose}
            title={message.title}
            maxWidth={640}
            showCloseButton
            headerStyle={styles.titleArea}
            titleStyle={styles.titleText}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View>
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
                        showDivider={false}
                        layout={useWideLayout ? 'row' : 'column'}
                        compact={useWideLayout}
                    />
                </View>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <CustomText style={styles.dividerText}>tai</CustomText>
                    <View style={styles.dividerLine} />
                </View>

                {useWideLayout ? (
                    <View style={styles.authButtonsRow}>
                        <Button
                            title="Kirjaudu sisään"
                            onPress={() => navigateToAuth('Kirjaudu sisään')}
                            type="PRIMARY"
                            size="small"
                            style={styles.authRowButton}
                            textStyle={styles.primaryButtonText}
                        />
                        <Button
                            title="Jatka ilman kirjautumista"
                            onPress={() => {
                                onClose()
                                if (onContinueWithoutLogin) {
                                    onContinueWithoutLogin()
                                }
                            }}
                            type="TERTIARY"
                            size="small"
                            style={styles.authRowButton}
                            textStyle={styles.tertiaryButtonText}
                        />
                    </View>
                ) : (
                    <>
                        <View style={styles.emailSection}>
                            <Button
                                title={
                                    isSignup
                                        ? 'Luo tili ja tallenna'
                                        : triggerType === 'ai_feature'
                                          ? 'Tallenna tietoni'
                                          : 'Kirjaudu sähköpostiosoitteella'
                                }
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
                            <TouchableOpacity
                                onPress={() => setIsSignup(!isSignup)}
                            >
                                <CustomText style={styles.toggleLink}>
                                    {isSignup ? 'Kirjaudu' : 'Luo tili'}
                                </CustomText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.continueWithoutLoginSection}>
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
                        </View>
                    </>
                )}
            </ScrollView>
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    titleArea: {
        padding: 20,
        marginBottom: 0,
        paddingRight: 48,
    },
    titleText: {
        marginBottom: 0,
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    socialButtonsSection: {
        marginBottom: 16,
        paddingHorizontal: 20,
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
        paddingHorizontal: 20,
    },
    authButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 16,
        justifyContent: 'center',
    },
    authRowButton: {
        flex: 1,
        width: 'auto',
        maxWidth: 190,
        borderRadius: 25,
    },
    continueWithoutLoginSection: {
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    primaryButton: {
        width: '100%',
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    primaryButtonText: {
        color: '#000000',
        fontWeight: '600',
        fontSize: 14,
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
        color: '#AE9CFC',
        fontWeight: '600',
    },
    tertiaryButton: {
        width: '100%',
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 16,
        minHeight: 40,
    },
    tertiaryButtonText: {
        textAlign: 'center',
        color: '#5844BB',
        fontWeight: '600',
        fontSize: 14,
    },
})

export default LoginPromptModal
