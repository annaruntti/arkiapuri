import React from 'react'
import { Platform, Pressable, StyleSheet } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import CustomText from './CustomText'

export default function Button(props) {
    const {
        onPress,
        title = 'Tallenna',
        style,
        textStyle,
        type = 'PRIMARY',
        disabled = false,
        variant = 'filled',
        size = 'medium',
    } = props
    const { isDesktop, isTablet } = useResponsiveDimensions()

    const getButtonStyle = ({ pressed }) => [
        styles.button,
        styles[`${type.toLowerCase()}Button`],
        styles[`${variant}Button`],
        styles[`${size}Button`],
        isDesktop && styles.desktopButton,
        isDesktop && styles[`desktop${type}Button`],
        isTablet && styles.tabletButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
        style,
    ]

    const getTextStyle = () => [
        styles.text,
        styles[`${type.toLowerCase()}Text`],
        styles[`${variant}Text`],
        styles[`${size}Text`],
        isDesktop && styles.desktopText,
        isDesktop && styles[`desktop${type}Text`],
        disabled && styles.disabledText,
        textStyle,
    ]

    return (
        <Pressable
            style={getButtonStyle}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            android_ripple={{ color: 'transparent' }}
        >
            <CustomText style={getTextStyle()}>{title}</CustomText>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    // Base button styles
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        minHeight: 48,
        flexDirection: 'row',
        ...(Platform.OS === 'web' && {
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
        }),
    },

    // Size variants
    smallButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36,
    },
    mediumButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        minHeight: 48,
    },
    largeButton: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        minHeight: 56,
    },

    // Type variants - PRIMARY
    primaryButton: {
        backgroundColor: '#9C86FC',
        borderWidth: 0,
    },
    desktopPrimaryButton: {
        backgroundColor: '#9C86FC',
        ...(Platform.OS === 'web' && {
            boxShadow: '0 2px 8px rgba(156, 134, 252, 0.3)',
            '&:hover': {
                backgroundColor: '#8B75FA',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(156, 134, 252, 0.4)',
            },
            '&:active': {
                transform: 'translateY(0px)',
            },
        }),
    },

    // Type variants - SECONDARY
    secondaryButton: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    desktopSecondaryButton: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        ...(Platform.OS === 'web' && {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                backgroundColor: '#f9fafb',
                borderColor: '#9ca3af',
            },
        }),
    },

    // Type variants - TERTIARY
    tertiaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#9C86FC',
    },
    desktopTertiaryButton: {
        backgroundColor: 'transparent',
        borderColor: '#9C86FC',
        ...(Platform.OS === 'web' && {
            '&:hover': {
                backgroundColor: 'rgba(156, 134, 252, 0.05)',
                borderColor: '#8B75FA',
            },
        }),
    },

    // Variant styles
    filledButton: {},
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
    },

    // Responsive styles
    desktopButton: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 10,
        minHeight: 52,
        minWidth: 120,
        ...(Platform.OS === 'web' && {
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }),
    },
    tabletButton: {
        paddingVertical: 13,
        paddingHorizontal: 26,
        borderRadius: 9,
        minHeight: 50,
    },

    // State styles
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    disabledButton: {
        backgroundColor: '#e5e7eb',
        borderColor: '#d1d5db',
        ...(Platform.OS === 'web' && {
            cursor: 'not-allowed',
            boxShadow: 'none',
        }),
    },

    // Text styles
    text: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },

    // Size text variants
    smallText: {
        fontSize: 14,
        fontWeight: '500',
    },
    mediumText: {
        fontSize: 16,
        fontWeight: '600',
    },
    largeText: {
        fontSize: 18,
        fontWeight: '600',
    },

    // Type text variants
    primaryText: {
        color: '#000000',
    },
    secondaryText: {
        color: '#000000',
    },
    tertiaryText: {
        color: '#000000',
    },

    // Desktop text variants
    desktopText: {
        fontSize: 16,
        fontWeight: '600',
    },
    desktopPrimaryText: {
        color: '#000000',
    },
    desktopSecondaryText: {
        color: '#000000',
    },
    desktopTertiaryText: {
        color: '#000000',
    },

    // Variant text styles
    filledText: {},
    outlineText: {},

    // State text styles
    disabledText: {
        color: '#9ca3af',
    },
})
