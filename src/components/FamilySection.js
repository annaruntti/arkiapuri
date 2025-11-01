import React from 'react'
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native'
import CustomText from './CustomText'
import Button from './Button'
import { useResponsiveDimensions } from '../utils/responsive'

const defaultImage = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/2wzxlzyydJLVr8T7k67cOO/90074490ee64362fe6f0e384d2b3daf8/arkiapuri-removebg-preview.png',
}

const FamilySection = ({ household, onManagePress }) => {
    const { isDesktop } = useResponsiveDimensions()

    if (!household) return null

    return (
        <View style={styles.familySection}>
            <View style={styles.familyHeader}>
                <CustomText
                    style={[
                        styles.familyTitle,
                        isDesktop && styles.desktopFamilyTitle,
                    ]}
                >
                    {household.name}
                </CustomText>
            </View>

            <View style={styles.familyMembers}>
                {household.members.map((member) => (
                    <View key={member._id} style={styles.memberRow}>
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
                                {household.owner.toString() ===
                                    member.userId?._id && (
                                    <CustomText style={styles.ownerBadge}>
                                        {' '}
                                        (Omistaja)
                                    </CustomText>
                                )}
                            </CustomText>
                            <CustomText style={styles.memberEmail}>
                                {member.userId?.email}
                            </CustomText>
                        </View>
                    </View>
                ))}
                <Button
                    title="Hallinnoi perhettä"
                    style={[styles.secondaryButton, styles.manageFamilyButton]}
                    textStyle={styles.buttonText}
                    onPress={onManagePress}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    familySection: {
        width: '100%',
        marginTop: 24,
        marginBottom: 24,
        padding: 20,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    familyHeader: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 12,
    },
    familyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    desktopFamilyTitle: {
        fontSize: 20,
    },
    familyMembers: {
        gap: 12,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
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
    ownerBadge: {
        fontSize: 14,
        fontWeight: '400',
        color: '#9C86FC',
    },
    memberEmail: {
        fontSize: 14,
        color: '#6b7280',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        width: '90%',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    manageFamilyButton: {
        width: '100%',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
})

export default FamilySection

