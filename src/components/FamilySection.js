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
                ))}
                <Button
                    title="Hallinnoi perhettä"
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
        marginTop: 8,
        marginBottom: 8,
        padding: 16,
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
        width: '100%',
    },
    memberItem: {
        backgroundColor: '#ffffff',
    },
    manageFamilyButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        width: '100%',
        marginTop: 4,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
})

export default FamilySection
