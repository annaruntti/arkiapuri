import { MaterialIcons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

const AcceptInviteScreen = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { isLoggedIn, profile } = useLogin()
    const { isDesktop } = useResponsiveDimensions()
    const [loading, setLoading] = useState(true)
    const [invitationData, setInvitationData] = useState(null)
    const [error, setError] = useState(null)
    const [accepting, setAccepting] = useState(false)

    // Get invitation token from route params or URL
    const invitationToken = route.params?.token || route.params?.invitationToken

    useEffect(() => {
        if (invitationToken) {
            validateInvitation()
        } else {
            setError('Virheellinen kutsulinkki')
            setLoading(false)
        }
    }, [invitationToken])

    const validateInvitation = async () => {
        try {
            setLoading(true)
            setError(null)

            // Validate the invitation token
            const response = await axios.get(
                getServerUrl(`/household/invitation/${invitationToken}`)
            )

            if (response.data.success) {
                setInvitationData(response.data.invitation)
            } else {
                setError(
                    response.data.message ||
                        'Kutsu on vanhentunut tai virheellinen'
                )
            }
        } catch (err) {
            console.error('Error validating invitation:', err)
            setError(
                err.response?.data?.message ||
                    'Kutsun tarkistaminen epäonnistui'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptInvitation = async () => {
        console.log('handleAcceptInvitation called, isLoggedIn:', isLoggedIn)

        if (!isLoggedIn) {
            // Save invitation token and redirect to sign up with pre-filled email
            try {
                await storage.setItem('pendingInvitation', invitationToken)
                console.log('Saved pending invitation:', invitationToken)

                // Navigate directly to sign up with pre-filled email
                navigation.navigate('Auth', {
                    screen: 'Luo tunnus',
                    params: { invitedEmail: invitationData.email },
                })
            } catch (error) {
                console.error('Error saving invitation:', error)
                Alert.alert('Virhe', 'Kutsun tallentaminen epäonnistui')
            }
            return
        }

        try {
            setAccepting(true)
            const token = await storage.getItem('userToken')

            const response = await axios.post(
                getServerUrl('/household/accept-invite'),
                {
                    invitationToken,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                Alert.alert('Onnistui!', 'Olet nyt osa perhettä. Tervetuloa!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('Main', {
                                screen: 'HomeStack',
                                params: { screen: 'Arkiapuri' },
                            })
                        },
                    },
                ])
            }
        } catch (err) {
            console.error('Error accepting invitation:', err)
            Alert.alert(
                'Virhe',
                err.response?.data?.message || 'Kutsun hyväksyminen epäonnistui'
            )
        } finally {
            setAccepting(false)
        }
    }

    const handleDeclineInvitation = () => {
        Alert.alert('Hylkää kutsu', 'Haluatko varmasti hylätä tämän kutsun?', [
            { text: 'Peruuta', style: 'cancel' },
            {
                text: 'Hylkää',
                style: 'destructive',
                onPress: () => navigation.navigate('HomeStack'),
            },
        ])
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#9C86FC" />
                    <CustomText style={styles.loadingText}>
                        Tarkistetaan kutsua...
                    </CustomText>
                </View>
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        styles.centerContent,
                    ]}
                >
                    <MaterialIcons
                        name="error-outline"
                        size={80}
                        color="#ef4444"
                    />
                    <CustomText style={styles.errorTitle}>
                        Virhe kutsun käsittelyssä
                    </CustomText>
                    <CustomText style={styles.errorMessage}>{error}</CustomText>
                    <Button
                        title="Palaa etusivulle"
                        onPress={() => navigation.navigate('HomeStack')}
                        style={styles.primaryButton}
                        textStyle={styles.buttonText}
                    />
                </ScrollView>
            </View>
        )
    }

    if (!invitationData) {
        return (
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <CustomText style={styles.errorMessage}>
                        Kutsua ei löytynyt
                    </CustomText>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.invitationCard}>
                    <CustomText style={styles.header}>Perhekutsu</CustomText>

                    <MaterialIcons
                        name="people-outline"
                        size={80}
                        color="#9C86FC"
                        style={styles.icon}
                    />

                    <CustomText style={styles.title}>
                        Perhekutsu saapunut!
                    </CustomText>

                    <CustomText style={styles.subtitle}>
                        Sinut on kutsuttu liittymään perheeseen
                    </CustomText>

                    <View style={styles.householdInfo}>
                        <View style={styles.infoRow}>
                            <MaterialIcons
                                name="home"
                                size={24}
                                color="#6b7280"
                            />
                            <CustomText style={styles.householdName}>
                                {invitationData.household?.name || 'Perhe'}
                            </CustomText>
                        </View>

                        {invitationData.invitedBy && (
                            <View style={styles.infoRow}>
                                <MaterialIcons
                                    name="person"
                                    size={24}
                                    color="#6b7280"
                                />
                                <CustomText style={styles.inviterInfo}>
                                    Kutsunut:{' '}
                                    {invitationData.invitedBy.username ||
                                        invitationData.invitedBy.email}
                                </CustomText>
                            </View>
                        )}

                        <View style={styles.infoRow}>
                            <MaterialIcons
                                name="people"
                                size={24}
                                color="#6b7280"
                            />
                            <CustomText style={styles.memberCount}>
                                {invitationData.household?.members?.length || 0}{' '}
                                jäsentä
                            </CustomText>
                        </View>
                    </View>

                    {!isLoggedIn && (
                        <View style={styles.loginNotice}>
                            <MaterialIcons
                                name="info-outline"
                                size={20}
                                color="#9C86FC"
                            />
                            <CustomText style={styles.loginNoticeText}>
                                Sinulla ei ole vielä tiliä? Luo tili osoitteella{' '}
                                <CustomText style={styles.emailHighlight}>
                                    {invitationData.email}
                                </CustomText>{' '}
                                hyväksyäksesi kutsun.{'\n\n'}
                                Jos sinulla on jo tili, voit{' '}
                                <CustomText
                                    style={styles.linkText}
                                    onPress={() => {
                                        storage.setItem(
                                            'pendingInvitation',
                                            invitationToken
                                        )
                                        navigation.navigate('Auth', {
                                            screen: 'Kirjaudu sisään',
                                        })
                                    }}
                                >
                                    kirjautua sisään tästä
                                </CustomText>
                                .
                            </CustomText>
                        </View>
                    )}

                    {isLoggedIn && invitationData.email !== profile?.email && (
                        <View style={styles.warningNotice}>
                            <MaterialIcons
                                name="warning"
                                size={20}
                                color="#f59e0b"
                            />
                            <CustomText style={styles.warningNoticeText}>
                                Tämä kutsu lähetettiin osoitteeseen{' '}
                                {invitationData.email}, mutta olet kirjautunut
                                sisään käyttäjänä {profile?.email}
                            </CustomText>
                        </View>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            title={
                                accepting
                                    ? 'Hyväksytään...'
                                    : isLoggedIn
                                      ? 'Hyväksy kutsu'
                                      : 'Luo tili ja hyväksy'
                            }
                            onPress={handleAcceptInvitation}
                            type="PRIMARY"
                            style={styles.primaryButton}
                            disabled={accepting}
                        />
                        <Button
                            title="Hylkää"
                            onPress={handleDeclineInvitation}
                            type="TERTIARY"
                            disabled={accepting}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    invitationCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 24,
    },
    icon: {
        alignSelf: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    householdInfo: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        gap: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    householdName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    inviterInfo: {
        fontSize: 16,
        color: '#6b7280',
    },
    memberCount: {
        fontSize: 16,
        color: '#6b7280',
    },
    loginNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#f3f0ff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    loginNoticeText: {
        flex: 1,
        fontSize: 14,
        color: '#7c3aed',
        lineHeight: 20,
    },
    emailHighlight: {
        fontWeight: '700',
        color: '#7c3aed',
    },
    linkText: {
        fontWeight: '700',
        color: '#7c3aed',
        textDecorationLine: 'underline',
    },
    warningNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#fef3c7',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    warningNoticeText: {
        flex: 1,
        fontSize: 14,
        color: '#92400e',
        lineHeight: 20,
    },
    buttonContainer: {
        gap: 12,
    },
    primaryButton: {
        borderRadius: 25,
        paddingVertical: 14,
        paddingHorizontal: 24,
        backgroundColor: '#9C86FC',
        elevation: 2,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    errorMessage: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
})

export default AcceptInviteScreen
