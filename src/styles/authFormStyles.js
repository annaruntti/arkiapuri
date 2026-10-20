import { StyleSheet } from 'react-native'

/**
 * Shared desktop/mobile styles for Auth screens (sign-in, sign-up, password).
 * Form column is ~400px; inputs and actions share the same width.
 */
export const authFormStyles = StyleSheet.create({
    form: {
        width: '100%',
    },
    buttonSection: {
        marginTop: 8,
        gap: 12,
        width: '100%',
    },
    fullWidthButton: {
        width: '100%',
        alignSelf: 'stretch',
        minWidth: 0,
        minHeight: 45,
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 25,
        elevation: 0,
    },
    primaryButton: {
        width: '100%',
        alignSelf: 'stretch',
        minWidth: 0,
        minHeight: 45,
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 25,
        backgroundColor: '#AE9CFC',
        elevation: 0,
    },
    tertiaryButton: {
        width: '100%',
        alignSelf: 'stretch',
        minWidth: 0,
        minHeight: 45,
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 25,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#5844BB',
        elevation: 0,
    },
    buttonText: {
        color: '#000000',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
    },
    tertiaryButtonText: {
        color: '#000000',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 14,
    },
    secondarySection: {
        alignItems: 'stretch',
        gap: 10,
        width: '100%',
        marginTop: 4,
    },
    secondaryText: {
        color: '#6b7280',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    linkRow: {
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    link: {
        color: '#5844BB',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    termsText: {
        color: '#6b7280',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        marginTop: 8,
    },
    termsLink: {
        color: '#5844BB',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    desktopFieldRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        width: '100%',
        alignItems: 'flex-start',
    },
    desktopFieldCell: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 0,
        minWidth: 180,
    },
    desktopButtonRow: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 12,
        marginTop: 8,
    },
    signupButtons: {
        marginBottom: 16,
    },
    desktopCompactButton: {
        width: 'auto',
        alignSelf: 'flex-start',
        flexGrow: 0,
        flexShrink: 0,
    },
    desktopSecondarySection: {
        alignItems: 'flex-start',
        gap: 10,
        width: '100%',
        marginTop: 4,
    },
    desktopSecondaryText: {
        textAlign: 'left',
    },
    desktopTermsText: {
        textAlign: 'left',
    },
})
