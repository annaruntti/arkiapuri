import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'
import CustomText from './CustomText'

const VARIANT_STYLES = {
    info: {
        banner: {
            backgroundColor: '#EEF2FF',
            borderColor: '#5844BB',
        },
        text: {
            color: '#312E81',
        },
        iconColor: '#5844BB',
        defaultIcon: 'info-outline',
    },
    warning: {
        banner: {
            backgroundColor: '#FFF3CD',
            borderColor: '#FFC107',
        },
        text: {
            color: '#856404',
        },
        iconColor: '#F59E0B',
        defaultIcon: 'warning',
    },
    success: {
        banner: {
            backgroundColor: '#f0fdf4',
            borderColor: '#86efac',
        },
        text: {
            color: '#166534',
        },
        iconColor: '#15803d',
        defaultIcon: 'check-circle',
    },
    error: {
        banner: {
            backgroundColor: '#fef2f2',
            borderColor: '#fecaca',
        },
        text: {
            color: '#b91c1c',
        },
        iconColor: '#b91c1c',
        defaultIcon: 'error-outline',
    },
}

const resolveIconName = (icon, variantStyle) => {
    if (icon === true) return variantStyle.defaultIcon
    if (typeof icon === 'string' && icon) return icon
    return null
}

const hasRawText = (node) => {
    if (typeof node === 'number') return true
    if (typeof node === 'string') return node.trim().length > 0
    if (Array.isArray(node)) return node.some(hasRawText)
    return false
}

/**
 * Generic inline notice for info, warning, success and error messages.
 *
 *   <NoticeBanner variant="info">AI:n ehdotus…</NoticeBanner>
 *   <NoticeBanner variant="warning">Kirjaudu sisään…</NoticeBanner>
 *   <NoticeBanner variant="info" icon="info-outline">…</NoticeBanner>
 */
const NoticeBanner = ({
    children,
    variant = 'info',
    icon,
    style,
    textStyle,
}) => {
    const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.info
    const iconName = resolveIconName(icon, variantStyle)
    const textStyles = [
        styles.text,
        variantStyle.text,
        iconName && styles.textWithIcon,
        textStyle,
    ]

    return (
        <View
            style={[
                styles.banner,
                variantStyle.banner,
                iconName && styles.bannerWithIcon,
                style,
            ]}
        >
            {iconName ? (
                <MaterialIcons
                    name={iconName}
                    size={20}
                    color={variantStyle.iconColor}
                />
            ) : null}
            {hasRawText(children) ? (
                <CustomText style={textStyles}>{children}</CustomText>
            ) : (
                <View style={iconName && styles.textWithIcon}>{children}</View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    banner: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    bannerWithIcon: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
    },
    textWithIcon: {
        flex: 1,
    },
})

export default NoticeBanner
