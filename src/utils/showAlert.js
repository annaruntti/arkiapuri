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
