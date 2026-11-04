import { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import { Alert, View, StyleSheet, ScrollView } from 'react-native'
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

                <View style={styles.emailSection}>
                    {useWideLayout ? (
                        <View style={styles.authButtonsRow}>
                            <Button
                                title="Kirjaudu sisään"
                                onPress={() =>
                                    navigateToAuth('Kirjaudu sisään')
                                }
                                type="PRIMARY"
                                size="small"
                                style={styles.authRowButton}
                                textStyle={styles.primaryButtonText}
                            />
                            <Button
                                title="Luo käyttäjätunnus"
                                onPress={() => navigateToAuth('Luo tunnus')}
                                type="SECONDARY"
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
                            <Button
                                title="Kirjaudu sisään"
                                onPress={() =>
                                    navigateToAuth('Kirjaudu sisään')
                                }
                                type="PRIMARY"
                                style={styles.primaryButton}
                                textStyle={styles.primaryButtonText}
                            />
                            <View style={styles.accountPrompt}>
                                <CustomText style={styles.accountPromptText}>
                                    Eikö sinulla ole vielä käyttäjätunnusta?
                                </CustomText>
                                <Button
                                    title="Luo käyttäjätunnus"
                                    onPress={() =>
                                        navigateToAuth('Luo tunnus')
                                    }
                                    type="SECONDARY"
                                    style={styles.primaryButton}
                                    textStyle={styles.primaryButtonText}
                                />
                            </View>
                        </>
                    )}

                    {useWideLayout ? null : (
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
                    )}
                </View>

                <View style={styles.socialButtonsSection}>
                    <SocialSignInButtons
                        onSocialSignIn={handleSocialSignIn}
                        layout={useWideLayout ? 'row' : 'column'}
                        compact={useWideLayout}
                    />
                </View>
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
        marginTop: 4,
        marginBottom: 8,
        paddingHorizontal: 20,
    },
    emailSection: {
        paddingHorizontal: 20,
    },
    accountPrompt: {
        marginTop: 12,
        gap: 10,
    },
    accountPromptText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    authButtonsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 4,
        justifyContent: 'center',
    },
    authRowButton: {
        flexGrow: 0,
        flexShrink: 0,
        width: 'auto',
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 14,
        minHeight: 40,
        minWidth: 0,
    },
    continueWithoutLoginSection: {
        marginTop: 12,
        marginBottom: 4,
    },
    primaryButton: {
        width: '100%',
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 14,
    },
    primaryButtonText: {
        color: '#000000',
        fontWeight: '600',
        fontSize: 14,
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
