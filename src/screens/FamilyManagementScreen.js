import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { AUTH_FORM_MAX_WIDTH } from '../components/AuthLayout'
import Button from '../components/Button'
import ContentContainer from '../components/ContentContainer'
import CustomText from '../components/CustomText'
import ListItem from '../components/ListItem'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import { useLogin } from '../context/LoginProvider'
import { authFormStyles } from '../styles/authFormStyles'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import { showAlert, showConfirm } from '../utils/showAlert'
import { getProfileImageSource } from '../utils/profileImage'
import storage from '../utils/storage'

const getRefId = (value) => {
    if (value == null || value === '') return ''
    if (typeof value === 'string') {
        if (
            value === 'undefined' ||
            value === 'null' ||
            value.startsWith('[object ')
        ) {
            return ''
        }
        return value
    }
    if (typeof value === 'object') {
        if (value._id != null) return getRefId(value._id)
        if (typeof value.id === 'string' && value.id) return value.id
    }
    return ''
}

const getMemberId = (member) =>
    getRefId(member?.userId) || getRefId(member?._id)

const getRoleLabel = (role) => {
    if (role === 'owner') return 'Omistaja'
    if (role === 'admin') return 'Ylläpitäjä'
    return 'Jäsen'
}

const FamilyManagementScreen = ({ navigation }) => {
    const { profile } = useLogin()
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const [household, setHousehold] = useState(null)
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [showInviteModal, setShowInviteModal] = useState(false)

    useFocusEffect(
        React.useCallback(() => {
            fetchHousehold()
        }, [])
    )

    const fetchHousehold = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')
            if (!token) {
                setHousehold(null)
                return
            }

            const response = await axios.get(getServerUrl('/household'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                setHousehold(response.data.household)
            }
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error('Error fetching household:', error)
            }
            setHousehold(null)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateHousehold = async () => {
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.post(
                getServerUrl('/household'),
                {
                    name: `${profile?.username}n perhe`,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                if (response.data.household) {
                    setHousehold(response.data.household)
                }
                Alert.alert('Onnistui', 'Perhe luotu onnistuneesti')
                await fetchHousehold()
            }
        } catch (error) {
            console.error('Error creating household:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Perheen luominen epäonnistui'
            )
        }
    }

    const handleInviteMember = async () => {
        if (!inviteEmail.trim()) {
            Alert.alert('Virhe', 'Syötä sähköpostiosoite')
            return
        }

        try {
            const token = await storage.getItem('userToken')
            const response = await axios.post(
                getServerUrl('/household/invite'),
                {
                    email: inviteEmail.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                const sentTo = inviteEmail.trim()
                setInviteEmail('')
                setShowInviteModal(false)
                showAlert(
                    'Kutsu lähetetty!',
                    `Kutsuviesti on lähetetty sähköpostiosoitteeseen ${sentTo}. Vastaanottaja voi liittyä perheeseen klikkaamalla sähköpostissa olevaa linkkiä.`
                )
                fetchHousehold()
            }
        } catch (error) {
            console.error('Error inviting member:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    'Jäsenen kutsuminen epäonnistui'
            )
        }
    }

    const handleLeaveHousehold = () => {
        showConfirm({
            title: 'Poistu perheestä',
            message:
                'Haluatko varmasti poistua perheestä? Et voi enää nähdä perheen jaettuja tietoja.',
            confirmText: 'Poistu',
            destructive: true,
            onConfirm: async () => {
                try {
                    const token = await storage.getItem('userToken')
                    const response = await axios.post(
                        getServerUrl('/household/leave'),
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (response.data.success) {
                        showAlert('Onnistui', 'Poistuit perheestä')
                        navigation.goBack()
                    }
                } catch (error) {
                    console.error('Error leaving household:', error)
                    showAlert(
                        'Virhe',
                        error.response?.data?.message ||
                            'Perheestä poistuminen epäonnistui'
                    )
                }
            },
        })
    }

    const handleRemoveMember = (memberId, memberName) => {
        if (!memberId) {
            showAlert('Virhe', 'Jäsenen tunniste puuttuu')
            return
        }

        showConfirm({
            title: 'Poista jäsen',
            message: `Haluatko varmasti poistaa jäsenen ${memberName} perheestä?`,
            confirmText: 'Poista',
            destructive: true,
            onConfirm: async () => {
                try {
                    const token = await storage.getItem('userToken')
                    const response = await axios.delete(
                        getServerUrl(`/household/members/${memberId}`),
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (response.data.success) {
                        showAlert('Onnistui', 'Jäsen poistettu')
                        fetchHousehold()
                    }
                } catch (error) {
                    console.error('Error removing member:', error)
                    showAlert(
                        'Virhe',
                        error.response?.data?.message ||
                            'Jäsenen poistaminen epäonnistui'
                    )
                }
            },
        })
    }

    const handleCancelInvitation = (invitationId, email) => {
        showConfirm({
            title: 'Peru kutsu',
            message: `Haluatko varmasti perua kutsun osoitteeseen ${email}?`,
            confirmText: 'Peru kutsu',
            destructive: true,
            onConfirm: async () => {
                try {
                    const token = await storage.getItem('userToken')
                    const response = await axios.delete(
                        getServerUrl(`/household/invitations/${invitationId}`),
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (response.data.success) {
                        showAlert('Onnistui', 'Kutsu peruttu')
                        fetchHousehold()
                    }
                } catch (error) {
                    console.error('Error cancelling invitation:', error)
                    showAlert(
                        'Virhe',
                        error.response?.data?.message ||
                            'Kutsun peruminen epäonnistui'
                    )
                }
            },
        })
    }

    const profileId = getRefId(profile)
    const isOwner = getRefId(household?.owner) === profileId
    const userRole = household?.members?.find(
        (m) => getRefId(m.userId) === profileId
    )?.role
    const canManageMembers = isOwner || userRole === 'admin'
    const pendingInvitations =
        household?.invitations?.filter((inv) => inv.status === 'pending') || []

    const getContainerStyle = () => [
        styles.container,
        isTablet && styles.tabletContainer,
        isDesktop && styles.desktopContainer,
    ]

    const getContentStyle = () => [
        styles.content,
        isTablet && !isDesktop && styles.wideContent,
        isDesktop && styles.desktopContent,
    ]

    const inviteModal = (
        <ResponsiveModal
            visible={showInviteModal}
            onClose={() => {
                setShowInviteModal(false)
                setInviteEmail('')
            }}
            title="Kutsu perheenjäsen"
        >
            <View style={styles.modalContent}>
                <CustomText style={styles.modalDescription}>
                    Syötä kutsuttavan henkilön sähköpostiosoite. Hänelle
                    lähetetään kutsulinkki, jolla voi liittyä perheeseen.
                </CustomText>
                <TextInput
                    style={styles.input}
                    placeholder="Sähköpostiosoite"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Button
                    title="Lähetä kutsu"
                    onPress={handleInviteMember}
                    fullWidth
                    style={authFormStyles.primaryButton}
                    textStyle={authFormStyles.buttonText}
                />
            </View>
        </ResponsiveModal>
    )

    if (loading) {
        return (
            <ResponsiveLayout
                activeRoute="ProfileStack"
                contentBackgroundColor="#f9fafb"
            >
                <View style={styles.loadingContainer}>
                    <CustomText>Ladataan...</CustomText>
                </View>
            </ResponsiveLayout>
        )
    }

    if (!household) {
        return (
            <ResponsiveLayout
                activeRoute="ProfileStack"
                contentBackgroundColor="#f9fafb"
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={getContainerStyle()}>
                        <ContentContainer maxWidth={760}>
                        <View style={getContentStyle()}>
                            <View
                                style={[
                                    isDesktop && styles.profileCard,
                                    isDesktop && styles.desktopProfileCard,
                                ]}
                            >
                            <View
                                style={[
                                    styles.emptyState,
                                    isDesktop && styles.desktopEmptyState,
                                ]}
                            >
                                <View style={styles.emptyHeader}>
                                    <View style={styles.emptyIconCircle}>
                                        <MaterialIcons
                                            name="people-outline"
                                            size={56}
                                            color="#5844BB"
                                        />
                                    </View>
                                    <View style={styles.emptyText}>
                                        <CustomText
                                            style={[
                                                styles.emptyTitle,
                                                isDesktop &&
                                                    styles.desktopEmptyTitle,
                                            ]}
                                        >
                                            Et ole vielä osa perhettä
                                        </CustomText>
                                        <CustomText
                                            style={[
                                                styles.emptySubtitle,
                                                isDesktop &&
                                                    styles.desktopEmptySubtitle,
                                            ]}
                                        >
                                            Luo oma perhe tai liity
                                            olemassa olevaan perheeseen
                                            kutsulinkin kautta
                                        </CustomText>
                                    </View>
                                </View>
                                <View
                                    style={[
                                        authFormStyles.buttonSection,
                                        isDesktop && styles.desktopActions,
                                    ]}
                                >
                                    <Button
                                        title="Luo perhe"
                                        onPress={handleCreateHousehold}
                                        fullWidth={!isDesktop}
                                        style={
                                            isDesktop
                                                ? styles.compactButton
                                                : authFormStyles.primaryButton
                                        }
                                        textStyle={
                                            isDesktop
                                                ? undefined
                                                : authFormStyles.buttonText
                                        }
                                    />
                                </View>
                            </View>
                            </View>
                        </View>
                        </ContentContainer>
                    </View>
                </ScrollView>
            </ResponsiveLayout>
        )
    }

    return (
        <ResponsiveLayout
            activeRoute="ProfileStack"
            contentBackgroundColor="#f9fafb"
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={getContainerStyle()}>
                    <ContentContainer maxWidth={760}>
                    <View style={getContentStyle()}>
                        <View
                            style={[
                                isDesktop && styles.profileCard,
                                isDesktop && styles.desktopProfileCard,
                            ]}
                        >
                        <View
                            style={[
                                styles.header,
                                isDesktop && styles.desktopHeader,
                            ]}
                        >
                            <CustomText
                                style={[
                                    styles.title,
                                    isDesktop && styles.desktopTitle,
                                ]}
                            >
                                {household.name}
                            </CustomText>
                            {isOwner && (
                                <CustomText
                                    style={[
                                        styles.subtitle,
                                        isDesktop && styles.desktopSubtitle,
                                    ]}
                                >
                                    Omistaja
                                </CustomText>
                            )}
                        </View>
                        </View>

                        <View style={styles.section}>
                            <CustomText style={styles.sectionTitle}>
                                Perheenjäsenet (
                                {household.members?.length || 0})
                            </CustomText>
                            {household.members?.map((member) => {
                                const memberUserId = getMemberId(member)
                                const isCurrentUser =
                                    Boolean(memberUserId) &&
                                    memberUserId === profileId
                                const isMemberOwner =
                                    Boolean(memberUserId) &&
                                    getRefId(household.owner) === memberUserId
                                const hasUserProfile = Boolean(
                                    member.userId?.username ||
                                        member.userId?.email
                                )
                                const displayName = hasUserProfile
                                    ? member.userId?.username ||
                                      member.userId?.email
                                    : 'Tuntematon käyttäjä'
                                const canRemove =
                                    canManageMembers &&
                                    !isMemberOwner &&
                                    !isCurrentUser &&
                                    Boolean(memberUserId)

                                return (
                                    <ListItem
                                        key={member._id || memberUserId}
                                        image={getProfileImageSource(
                                            member.userId
                                        )}
                                        imageShape="circle"
                                        title={
                                            isCurrentUser
                                                ? `${displayName} (Sinä)`
                                                : displayName
                                        }
                                        subtitle={
                                            member.userId?.email ||
                                            (hasUserProfile
                                                ? undefined
                                                : 'Jäsenen tiedot puuttuvat')
                                        }
                                        details={getRoleLabel(member.role)}
                                        onDelete={
                                            canRemove
                                                ? () =>
                                                      handleRemoveMember(
                                                          memberUserId,
                                                          displayName
                                                      )
                                                : undefined
                                        }
                                        deleteAccessibilityLabel={`Poista ${displayName}`}
                                        style={styles.listCard}
                                    />
                                )
                            })}
                            {canManageMembers && (
                                <View
                                    style={
                                        isDesktop
                                            ? styles.desktopActions
                                            : undefined
                                    }
                                >
                                <Button
                                    title="Kutsu perheenjäsen"
                                    type="TERTIARY"
                                    fullWidth={!isDesktop}
                                    onPress={() => setShowInviteModal(true)}
                                    style={
                                        isDesktop
                                            ? styles.compactButton
                                            : authFormStyles.tertiaryButton
                                    }
                                    textStyle={
                                        isDesktop
                                            ? undefined
                                            : authFormStyles.buttonText
                                    }
                                />
                                </View>
                            )}
                        </View>

                        {pendingInvitations.length > 0 && (
                            <View style={styles.section}>
                                <CustomText style={styles.sectionTitle}>
                                    Odottavat kutsut
                                </CustomText>
                                {pendingInvitations.map((invitation) => (
                                    <ListItem
                                        key={invitation._id}
                                        icon="mail-outline"
                                        title={invitation.email}
                                        subtitle={`Lähetetty ${new Date(
                                            invitation.createdAt
                                        ).toLocaleDateString('fi-FI')}`}
                                        onDelete={
                                            canManageMembers
                                                ? () =>
                                                      handleCancelInvitation(
                                                          invitation._id,
                                                          invitation.email
                                                      )
                                                : undefined
                                        }
                                        deleteAccessibilityLabel={`Peru kutsu osoitteeseen ${invitation.email}`}
                                        style={styles.listCard}
                                    />
                                ))}
                            </View>
                        )}

                        {!isOwner && (
                            <View
                                style={[
                                    authFormStyles.buttonSection,
                                    isDesktop && styles.desktopActions,
                                ]}
                            >
                                <Button
                                    title="Poistu perheestä"
                                    type="TERTIARY"
                                    fullWidth={!isDesktop}
                                    onPress={handleLeaveHousehold}
                                    style={
                                        isDesktop
                                            ? styles.compactButton
                                            : authFormStyles.tertiaryButton
                                    }
                                    textStyle={
                                        isDesktop
                                            ? undefined
                                            : authFormStyles.buttonText
                                    }
                                />
                            </View>
                        )}
                    </View>
                    </ContentContainer>
                </View>
            </ScrollView>
            {inviteModal}
        </ResponsiveLayout>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 40,
        backgroundColor: '#f9fafb',
    },
    desktopContainer: {
        paddingHorizontal: 0,
        paddingTop: 32,
        paddingBottom: 48,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        backgroundColor: '#f9fafb',
        width: '100%',
    },
    tabletContainer: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 48,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#f9fafb',
        width: '100%',
    },
    content: {
        width: '100%',
        maxWidth: AUTH_FORM_MAX_WIDTH,
        alignItems: 'center',
    },
    wideContent: {
        maxWidth: AUTH_FORM_MAX_WIDTH,
        width: '100%',
        alignItems: 'center',
        padding: 0,
    },
    desktopContent: {
        maxWidth: '100%',
        width: '100%',
        alignItems: 'stretch',
        padding: 0,
    },
    profileCard: {
        width: '100%',
        backgroundColor: '#F4F0FF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D8CEF8',
        padding: 16,
        marginBottom: 20,
    },
    desktopProfileCard: {
        paddingHorizontal: 32,
        paddingVertical: 28,
    },
    desktopHeader: {
        alignItems: 'flex-start',
        marginBottom: 0,
    },
    desktopEmptyState: {
        alignItems: 'flex-start',
    },
    desktopEmptyTitle: {
        textAlign: 'left',
    },
    desktopEmptySubtitle: {
        textAlign: 'left',
    },
    desktopActions: {
        width: '100%',
        alignItems: 'flex-start',
    },
    compactButton: {
        width: 'auto',
        alignSelf: 'flex-start',
        flexGrow: 0,
        flexShrink: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    listCard: {
        backgroundColor: '#ffffff',
    },
    emptyState: {
        width: '100%',
        alignItems: 'center',
    },
    emptyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 16,
    },
    emptyIconCircle: {
        width: 112,
        height: 112,
        borderRadius: 56,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        flexShrink: 0,
    },
    emptyText: {
        flex: 1,
        minWidth: 0,
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingLeft: 8,
        transform: [{ translateY: 8 }],
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'left',
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'left',
        lineHeight: 22,
        marginBottom: 8,
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    desktopTitle: {
        fontSize: 28,
        marginBottom: 8,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    desktopSubtitle: {
        fontSize: 18,
        textAlign: 'left',
    },
    section: {
        width: '100%',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
    },
    modalContent: {
        padding: 20,
        gap: 16,
    },
    modalDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    input: {
        backgroundColor: '#ffffff',
        borderColor: '#d1d5db',
        borderWidth: 1,
        height: 48,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        color: '#1f2937',
        width: '100%',
    },
})

export default FamilyManagementScreen
