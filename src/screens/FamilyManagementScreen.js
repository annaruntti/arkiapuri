import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import React, { useState } from 'react'
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

const FamilyManagementScreen = ({ navigation }) => {
    const { profile } = useLogin()
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const [household, setHousehold] = useState(null)
    const [loading, setLoading] = useState(true)
    const [inviteEmail, setInviteEmail] = useState('')
    const [invitationCode, setInvitationCode] = useState('')
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [generatedCode, setGeneratedCode] = useState(null)

    const defaultImage = {
        uri: 'https://images.ctfassets.net/hef5a6s5axrs/2wzxlzyydJLVr8T7k67cOO/90074490ee64362fe6f0e384d2b3daf8/arkiapuri-removebg-preview.png',
    }

    // Fetch household data when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            fetchHousehold()
        }, [])
    )

    const fetchHousehold = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/household'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success && response.data.household) {
                setHousehold(response.data.household)
            }
        } catch (error) {
            console.error('Error fetching household:', error)
            Alert.alert('Virhe', 'Perheen tietojen haku epäonnistui')
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
                Alert.alert('Onnistui', 'Perhe luotu onnistuneesti')
                // Refresh to show the new household
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
                setGeneratedCode(response.data.invitationCode)
                setInviteEmail('')
                Alert.alert(
                    'Kutsu lähetetty',
                    `Kutsukoodi: ${response.data.invitationCode}\n\nJaa tämä koodi kutsuttavalle henkilölle.`,
                    [
                        {
                            text: 'Kopioi koodi',
                            onPress: () => {
                                // In a real app, you'd copy to clipboard
                                console.log('Copy code:', response.data.invitationCode)
                            },
                        },
                        { text: 'OK' },
                    ]
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

    const handleJoinHousehold = async () => {
        if (!invitationCode.trim()) {
            Alert.alert('Virhe', 'Syötä kutsukoodi')
            return
        }

        try {
            const token = await storage.getItem('userToken')
            const response = await axios.post(
                getServerUrl('/household/join'),
                {
                    invitationCode: invitationCode.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                Alert.alert('Onnistui', 'Liityit perheeseen onnistuneesti')
                setInvitationCode('')
                setShowJoinModal(false)
                fetchHousehold()
            }
        } catch (error) {
            console.error('Error joining household:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Perheeseen liittyminen epäonnistui'
            )
        }
    }

    const handleLeaveHousehold = () => {
        Alert.alert(
            'Poistu perheestä',
            'Haluatko varmasti poistua perheestä? Et voi enää nähdä perheen jaettuja tietoja.',
            [
                { text: 'Peruuta', style: 'cancel' },
                {
                    text: 'Poistu',
                    style: 'destructive',
                    onPress: async () => {
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
                                Alert.alert('Onnistui', 'Poistuit perheestä')
                                navigation.goBack()
                            }
                        } catch (error) {
                            console.error('Error leaving household:', error)
                            Alert.alert(
                                'Virhe',
                                error.response?.data?.message ||
                                    'Perheestä poistuminen epäonnistui'
                            )
                        }
                    },
                },
            ]
        )
    }

    const handleRemoveMember = (memberId, memberName) => {
        Alert.alert(
            'Poista jäsen',
            `Haluatko varmasti poistaa jäsenen ${memberName} perheestä?`,
            [
                { text: 'Peruuta', style: 'cancel' },
                {
                    text: 'Poista',
                    style: 'destructive',
                    onPress: async () => {
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
                                Alert.alert('Onnistui', 'Jäsen poistettu')
                                fetchHousehold()
                            }
                        } catch (error) {
                            console.error('Error removing member:', error)
                            Alert.alert(
                                'Virhe',
                                error.response?.data?.message ||
                                    'Jäsenen poistaminen epäonnistui'
                            )
                        }
                    },
                },
            ]
        )
    }

    const isOwner = household?.owner?.toString() === profile?._id || household?.owner?._id === profile?._id
    const userRole = household?.members?.find(
        (m) => m.userId?._id === profile?._id
    )?.role

    if (loading) {
        return (
            <ResponsiveLayout activeRoute="ProfileStack">
                <View style={styles.loadingContainer}>
                    <CustomText>Ladataan...</CustomText>
                </View>
            </ResponsiveLayout>
        )
    }

    if (!household) {
        return (
            <ResponsiveLayout activeRoute="ProfileStack">
                <ScrollView style={styles.container}>
                    <View style={styles.emptyState}>
                        <MaterialIcons
                            name="people-outline"
                            size={80}
                            color="#9C86FC"
                        />
                        <CustomText style={styles.emptyTitle}>
                            Et ole vielä osa perhettä
                        </CustomText>
                        <CustomText style={styles.emptySubtitle}>
                            Luo oma perhe tai liity olemassa olevaan perheeseen
                            kutsukoodilla
                        </CustomText>

                        <View style={styles.actionButtons}>
                            <Button
                                title="Luo perhe"
                                onPress={handleCreateHousehold}
                                style={styles.primaryButton}
                                textStyle={styles.buttonText}
                            />
                            <Button
                                title="Liity perheeseen"
                                onPress={() => setShowJoinModal(true)}
                                style={styles.secondaryButton}
                                textStyle={styles.buttonText}
                            />
                        </View>
                    </View>
                </ScrollView>

                {/* Join Household Modal */}
                <ResponsiveModal
                    visible={showJoinModal}
                    onClose={() => setShowJoinModal(false)}
                    title="Liity perheeseen"
                >
                    <View style={styles.modalContent}>
                        <CustomText style={styles.modalDescription}>
                            Syötä perheenjäsenen sinulle lähettämä kutsukoodi
                        </CustomText>
                        <TextInput
                            style={styles.input}
                            placeholder="Kutsukoodi"
                            value={invitationCode}
                            onChangeText={setInvitationCode}
                            autoCapitalize="none"
                        />
                        <Button
                            title="Liity"
                            onPress={handleJoinHousehold}
                            style={styles.primaryButton}
                            textStyle={styles.buttonText}
                        />
                    </View>
                </ResponsiveModal>
            </ResponsiveLayout>
        )
    }

    return (
        <ResponsiveLayout activeRoute="ProfileStack">
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <CustomText style={styles.title}>{household.name}</CustomText>
                    {isOwner && (
                        <CustomText style={styles.ownerBadge}>Omistaja</CustomText>
                    )}
                </View>

                {/* Members Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <CustomText style={styles.sectionTitle}>
                            Perheenjäsenet ({household.members?.length || 0})
                        </CustomText>
                        {(isOwner || userRole === 'admin') && (
                            <TouchableOpacity
                                onPress={() => setShowInviteModal(true)}
                                style={styles.inviteButton}
                            >
                                <MaterialIcons
                                    name="person-add"
                                    size={20}
                                    color="#9C86FC"
                                />
                                <CustomText style={styles.inviteButtonText}>
                                    Kutsu
                                </CustomText>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.membersList}>
                        {household.members?.map((member) => {
                            const isCurrentUser = member.userId?._id === profile?._id
                            const isMemberOwner =
                                household.owner?.toString() === member.userId?._id ||
                                household.owner?._id === member.userId?._id

                            return (
                                <View key={member._id} style={styles.memberCard}>
                                    <Image
                                        source={
                                            member.userId?.profileImage
                                                ? { uri: member.userId.profileImage }
                                                : defaultImage
                                        }
                                        style={styles.memberAvatar}
                                    />
                                    <View style={styles.memberInfo}>
                                        <CustomText style={styles.memberName}>
                                            {member.userId?.username}
                                            {isCurrentUser && (
                                                <CustomText style={styles.youBadge}>
                                                    {' '}
                                                    (Sinä)
                                                </CustomText>
                                            )}
                                        </CustomText>
                                        <CustomText style={styles.memberEmail}>
                                            {member.userId?.email}
                                        </CustomText>
                                        <CustomText style={styles.memberRole}>
                                            {member.role === 'owner'
                                                ? 'Omistaja'
                                                : member.role === 'admin'
                                                ? 'Ylläpitäjä'
                                                : 'Jäsen'}
                                        </CustomText>
                                    </View>
                                    {!isMemberOwner &&
                                        !isCurrentUser &&
                                        (isOwner || userRole === 'admin') && (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleRemoveMember(
                                                        member.userId?._id,
                                                        member.userId?.username
                                                    )
                                                }
                                                style={styles.removeButton}
                                            >
                                                <MaterialIcons
                                                    name="remove-circle-outline"
                                                    size={24}
                                                    color="#ef4444"
                                                />
                                            </TouchableOpacity>
                                        )}
                                </View>
                            )
                        })}
                    </View>
                </View>

                {/* Pending Invitations */}
                {household.invitations?.filter((inv) => inv.status === 'pending')
                    .length > 0 && (
                    <View style={styles.section}>
                        <CustomText style={styles.sectionTitle}>
                            Odottavat kutsut
                        </CustomText>
                        {household.invitations
                            .filter((inv) => inv.status === 'pending')
                            .map((invitation) => (
                                <View key={invitation._id} style={styles.invitationCard}>
                                    <MaterialIcons
                                        name="mail-outline"
                                        size={24}
                                        color="#9C86FC"
                                    />
                                    <View style={styles.invitationInfo}>
                                        <CustomText style={styles.invitationEmail}>
                                            {invitation.email}
                                        </CustomText>
                                        <CustomText style={styles.invitationDate}>
                                            Lähetetty{' '}
                                            {new Date(
                                                invitation.createdAt
                                            ).toLocaleDateString('fi-FI')}
                                        </CustomText>
                                    </View>
                                </View>
                            ))}
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actionsSection}>
                    {!isOwner && (
                        <Button
                            title="Poistu perheestä"
                            onPress={handleLeaveHousehold}
                            style={styles.dangerButton}
                            textStyle={styles.buttonText}
                        />
                    )}
                </View>
            </ScrollView>

            {/* Invite Modal */}
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
                        Syötä kutsuttavan henkilön sähköpostiosoite. Hän saa
                        kutsukoodin, jolla voi liittyä perheeseen.
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
                        style={styles.primaryButton}
                        textStyle={styles.buttonText}
                    />
                </View>
            </ResponsiveModal>
        </ResponsiveLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        minHeight: 400,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    actionButtons: {
        width: '100%',
        gap: 16,
        maxWidth: 300,
    },
    header: {
        padding: 20,
        backgroundColor: '#f9fafb',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    ownerBadge: {
        fontSize: 14,
        color: '#9C86FC',
        fontWeight: '600',
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    inviteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#f3f0ff',
        borderRadius: 8,
    },
    inviteButtonText: {
        color: '#9C86FC',
        fontWeight: '600',
        fontSize: 14,
    },
    membersList: {
        gap: 12,
    },
    memberCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    memberAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 16,
        borderWidth: 2,
        borderColor: '#9C86FC',
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    youBadge: {
        fontSize: 14,
        fontWeight: '400',
        color: '#9C86FC',
    },
    memberEmail: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    memberRole: {
        fontSize: 12,
        color: '#9C86FC',
        fontWeight: '500',
    },
    removeButton: {
        padding: 8,
    },
    invitationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 12,
    },
    invitationInfo: {
        marginLeft: 12,
        flex: 1,
    },
    invitationEmail: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: 4,
    },
    invitationDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    actionsSection: {
        padding: 20,
        gap: 12,
    },
    primaryButton: {
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 24,
        elevation: 2,
        backgroundColor: '#9C86FC',
        width: '100%',
    },
    secondaryButton: {
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 24,
        elevation: 2,
        backgroundColor: '#fff',
        width: '100%',
        borderWidth: 2,
        borderColor: '#9C86FC',
    },
    dangerButton: {
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 24,
        elevation: 2,
        backgroundColor: '#ef4444',
        width: '100%',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
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
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
})

export default FamilyManagementScreen

