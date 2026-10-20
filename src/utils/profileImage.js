import { DEFAULT_PROFILE_IMAGE } from '../constants/images'

export const getProfileImageUrl = (userOrImage) => {
    if (!userOrImage) return null

    const image =
        userOrImage.profileImage !== undefined
            ? userOrImage.profileImage
            : userOrImage

    if (typeof image === 'string' && image) return image
    if (image?.url) return image.url
    return null
}

export const getProfileImageSource = (userOrImage) => {
    const url = getProfileImageUrl(userOrImage)
    return url ? { uri: url } : DEFAULT_PROFILE_IMAGE
}

export { DEFAULT_PROFILE_IMAGE }
