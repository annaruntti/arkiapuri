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
    primaryButton: {
        width: '100%',
        alignSelf: 'stretch',
        minWidth: 0,
        minHeight: 44,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 25,
        backgroundColor: '#AE9CFC',
        elevation: 0,
    },
    tertiaryButton: {
        width: '100%',
        alignSelf: 'stretch',
        minWidth: 0,
        minHeight: 44,
        paddingVertical: 10,
        paddingHorizontal: 16,
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
        fontSize: 15,
    },
    tertiaryButtonText: {
        color: '#000000',
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 15,
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
})
