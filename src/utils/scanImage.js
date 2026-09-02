import { Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

export const UNSUPPORTED_SCAN_IMAGE_MESSAGE =
    'Tätä tiedostotyyppiä ei voi käyttää. Valitse JPEG-, PNG-, WebP- tai HEIC-kuva.'

export const SCAN_IMAGE_ACCEPT =
    'image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif,.HEIC,.HEIF'

const ALLOWED_EXTENSIONS = new Set([
    'jpg',
    'jpeg',
    'png',
    'webp',
    'heic',
    'heif',
])

const MIME_BY_EXTENSION = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
}

export const getScanImageExtension = ({
    fileName = '',
    name = '',
    uri = '',
    mimeType = '',
    type = '',
} = {}) => {
    const fromName = String(fileName || name || '').match(/\.([a-z0-9]+)$/i)
    if (fromName) return fromName[1].toLowerCase()
    const fromUri = String(uri || '').match(/\.([a-z0-9]+)(?:\?|#|$)/i)
    if (fromUri) return fromUri[1].toLowerCase()

    const mime = String(mimeType || type || '').toLowerCase()
    if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpeg'
    if (mime.includes('png')) return 'png'
    if (mime.includes('webp')) return 'webp'
    if (mime.includes('heic')) return 'heic'
    if (mime.includes('heif')) return 'heif'
    return ''
}

export const isHeicScanImage = (asset = {}) => {
    const ext = getScanImageExtension(asset)
    const mime = String(
        asset.mimeType || asset.type || asset.file?.type || ''
    ).toLowerCase()
    return (
        ext === 'heic' ||
        ext === 'heif' ||
        mime.includes('heic') ||
        mime.includes('heif')
    )
}

export const validateScanImage = (asset = {}) => {
    const ext = getScanImageExtension(asset)
    const mime = String(asset.mimeType || asset.type || '').toLowerCase()

    if (ext && ALLOWED_EXTENSIONS.has(ext)) {
        return { ok: true, mimeType: MIME_BY_EXTENSION[ext] || mime }
    }

    if (
        mime === 'image/jpeg' ||
        mime === 'image/jpg' ||
        mime === 'image/png' ||
        mime === 'image/webp' ||
        mime.includes('heic') ||
        mime.includes('heif')
    ) {
        return { ok: true, mimeType: mime }
    }

    return { ok: false, message: UNSUPPORTED_SCAN_IMAGE_MESSAGE }
}

const pickWebImageFile = () =>
    new Promise((resolve) => {
        if (typeof document === 'undefined') {
            resolve(null)
            return
        }

        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', SCAN_IMAGE_ACCEPT)
        input.style.display = 'none'
        document.body.appendChild(input)

        let settled = false
        const cleanup = (file) => {
            if (settled) return
            settled = true
            input.removeEventListener('change', onChange)
            input.removeEventListener('cancel', onCancel)
            if (input.parentNode) input.parentNode.removeChild(input)
            resolve(file)
        }

        const onChange = () => {
            cleanup(input.files?.[0] || null)
        }

        const onCancel = () => {
            cleanup(null)
        }

        input.addEventListener('change', onChange)
        input.addEventListener('cancel', onCancel)
        input.click()
    })

const assetFromWebFile = (file, mimeType) => ({
    uri: URL.createObjectURL(file),
    width: 0,
    height: 0,
    fileName: file.name,
    mimeType: mimeType || file.type || 'image/heic',
    fileSize: file.size,
    file,
})

export const pickScanImageFromLibrary = async () => {
    if (Platform.OS === 'web') {
        const file = await pickWebImageFile()
        if (!file) return { canceled: true }

        const check = validateScanImage({
            fileName: file.name,
            mimeType: file.type,
        })
        if (!check.ok) {
            return { canceled: true, error: check.message }
        }

        return {
            canceled: false,
            asset: assetFromWebFile(file, check.mimeType),
        }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
    })
    if (result.canceled || !result.assets?.[0]) {
        return { canceled: true }
    }

    const asset = result.assets[0]
    const check = validateScanImage({
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        uri: asset.uri,
    })
    if (!check.ok) {
        return { canceled: true, error: check.message }
    }

    return { canceled: false, asset }
}
