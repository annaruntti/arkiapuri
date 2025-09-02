import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import CustomText from './CustomText'

export default function Button(props) {
    const { onPress, title = 'Tallenna', style, textStyle } = props
    const { isDesktop } = useResponsiveDimensions()

    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                isDesktop && styles.desktopButton,
                pressed && styles.pressed,
                style,
            ]}
            onPress={onPress}
            android_ripple={{ color: 'transparent' }}
        >
            <CustomText
                style={[
                    styles.text,
                    isDesktop && styles.desktopText,
                    textStyle,
                ]}
            >
                {title}
            </CustomText>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#9C86FC', //default color
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    pressed: {
        opacity: 0.75,
    },
    text: {
        color: '#000', // default color
        fontWeight: 'bold',
        padding: 7,
    },
    desktopButton: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 8,
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    desktopText: {
        fontSize: 16,
        fontWeight: '600',
        padding: 0,
    },
})
