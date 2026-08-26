import axios from 'axios'
import * as ImageManipulator from 'expo-image-manipulator'
import { getServerUrl } from '../utils/getServerUrl'
import { getAuthHeaders } from './foodItemApi'

const authConfig = async (extra = {}) => ({
    headers: await getAuthHeaders(),
    ...extra,
})

export const getAiEntitlement = async () => {
    const response = await axios.get(
        getServerUrl('/ai/entitlement'),
        await authConfig()
    )
    const data = response.data
    if (!data.success) {
        throw new Error(data.message || 'AI-oikeuksien haku epäonnistui')
    }
    return data
}

const stripDataUri = (value) =>
    String(value || '').replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '')

export const compressPantryScanImage = async (asset) => {
    const source =
        asset.uri ||
        (asset.base64
            ? `data:image/jpeg;base64,${asset.base64}`
            : null)
    if (!source) {
        throw new Error('Kuva puuttuu')
    }

    const manipulated = await ImageManipulator.manipulateAsync(
        source,
        [{ resize: { width: 1280 } }],
        {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
        }
    )

    return {
        base64: stripDataUri(manipulated.base64),
        mimeType: 'image/jpeg',
    }
}

export const scanPantryImage = async (image) => {
    try {
        const response = await axios.post(
            getServerUrl('/ai/pantry-scan'),
            {
                image: image.base64,
                mimeType: image.mimeType || 'image/jpeg',
            },
            await authConfig({
                maxBodyLength: Infinity,
                timeout: 90000,
            })
        )

        const data = response.data
        if (!data.success) {
            const error = new Error(data.message || 'Skannaus epäonnistui')
            error.code = data.code
            error.entitlement = data.entitlement
            throw error
        }
        return data
    } catch (error) {
        if (error.response?.data) {
            const wrapped = new Error(
                error.response.data.message || 'Skannaus epäonnistui'
            )
            wrapped.code = error.response.data.code
            wrapped.entitlement = error.response.data.entitlement
            throw wrapped
        }
        throw error
    }
}
