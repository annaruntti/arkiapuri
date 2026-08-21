import { Alert, Platform } from 'react-native'

/**
 * Cross-platform alert. React Native Alert.alert is unreliable on web.
 */
export const showAlert = (title, message = '') => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(message ? `${title}\n\n${message}` : title)
        return
    }

    Alert.alert(title, message)
}

export const showConfirm = ({
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Peruuta',
    destructive = false,
    onConfirm,
}) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const confirmed = window.confirm(
            message ? `${title}\n\n${message}` : title
        )
        if (confirmed) onConfirm?.()
        return
    }

    Alert.alert(title, message, [
        { text: cancelText, style: 'cancel' },
        {
            text: confirmText,
            style: destructive ? 'destructive' : 'default',
            onPress: onConfirm,
        },
    ])
}
