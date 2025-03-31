import { Platform } from 'react-native'
import * as Updates from 'expo-updates'
import getEnvVars from '../../environment'

export const getServerUrl = (path) => {
    const env = getEnvVars()
    return `${env.apiUrl}${path}`
}
