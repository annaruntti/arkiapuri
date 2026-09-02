import axios from 'axios'
import * as ImageManipulator from 'expo-image-manipulator'
import { Platform } from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import { isHeicScanImage } from '../utils/scanImage'
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

const getAssetBlob = async (asset) => {
    if (asset?.file instanceof Blob) return asset.file
    if (asset?.uri) {
        const response = await fetch(asset.uri)
        return response.blob()
    }
    return null
}

const jpegFileNameFromAsset = (asset = {}) => {
    const raw = String(asset.fileName || asset.file?.name || 'meal.jpg')
    return raw.replace(/\.(heic|heif)$/i, '.jpg')
}

const convertHeicToJpegAsset = async (blob, asset = {}) => {
    const { heicTo } = await import('heic-to')
    const jpegBlob = await heicTo({
        blob,
        type: 'image/jpeg',
        quality: 0.8,
    })
    const fileName = jpegFileNameFromAsset(asset)
    const file =
        typeof File !== 'undefined'
            ? new File([jpegBlob], fileName, { type: 'image/jpeg' })
            : jpegBlob
    return {
        uri: URL.createObjectURL(file),
        width: asset.width || 0,
        height: asset.height || 0,
        fileName,
        mimeType: 'image/jpeg',
        fileSize: file.size,
        file,
    }
}

export const compressPantryScanImage = async (asset) => {
    let source =
        asset.uri ||
        (asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null)
    let previewAsset = asset

    if (Platform.OS === 'web' && isHeicScanImage(asset)) {
        const blob = await getAssetBlob(asset)
        if (!blob) {
            throw new Error('Kuva puuttuu')
        }
        try {
            previewAsset = await convertHeicToJpegAsset(blob, asset)
            source = previewAsset.uri
        } catch (error) {
            console.error('HEIC conversion failed', error)
            throw new Error(
                'HEIC-kuvan käsittely epäonnistui. Kokeile tallentaa kuva JPEG-muodossa.'
            )
        }
    }

    if (!source) {
        throw new Error('Kuva puuttuu')
    }

    try {
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
            previewAsset,
        }
    } catch (error) {
        if (isHeicScanImage(asset)) {
            throw new Error(
                'HEIC-kuvan käsittely epäonnistui. Kokeile tallentaa kuva JPEG-muodossa.'
            )
        }
        throw error
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

export const scanDishImage = async (image) => {
    try {
        const response = await axios.post(
            getServerUrl('/ai/dish-from-photo'),
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
