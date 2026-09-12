import { StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import Button from './Button'
import CustomText from './CustomText'
import ListItem from './ListItem'
import { getProfileImageSource } from '../utils/profileImage'

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

const FamilySection = ({ household, onManagePress }) => {
    const { isDesktop } = useResponsiveDimensions()
    const members = household?.members || []

    return (
        <View style={styles.familySection}>
            <View style={styles.familyHeader}>
                <CustomText
                    style={[
                        styles.familyTitle,
                        isDesktop && styles.desktopFamilyTitle,
                    ]}
                >
                    {household?.name || 'Perhe'}
                </CustomText>
            </View>

            <View style={styles.familyMembers}>
                {members.length === 0 ? (
                    <CustomText style={styles.emptyText}>
                        Ei perheenjäseniä vielä.
                    </CustomText>
                ) : (
                    members.map((member) => (
                        <ListItem
                            key={member._id}
                            image={getProfileImageSource(member.userId)}
                            imageShape="circle"
                            imageSize={48}
                            title={member.userId?.username}
                            subtitle={member.userId?.email}
                            details={
                                getRefId(household.owner) ===
                                getRefId(member.userId)
                                    ? 'Omistaja'
                                    : undefined
                            }
                            style={styles.memberItem}
                        />
                    ))
                )}
                <Button
                    title="Hallinnoi perhettä"
                    type="SECONDARY"
                    fullWidth
                    style={styles.manageFamilyButton}
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
        backgroundColor: 'transparent',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 15,
        marginBottom: 8,
    },
    familyHeader: {
        marginBottom: 12,
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
        width: '100%',
    },
    memberItem: {
        backgroundColor: '#ffffff',
    },
    manageFamilyButton: {
        width: '100%',
        alignSelf: 'stretch',
        minHeight: 45,
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
})

export default FamilySection
