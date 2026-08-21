const DEFAULT_PROFILE_IMAGE = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/2wzxlzyydJLVr8T7k67cOO/90074490ee64362fe6f0e384d2b3daf8/arkiapuri-removebg-preview.png',
}

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
