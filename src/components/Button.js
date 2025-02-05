import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import CustomText from './CustomText'

export default function Button(props) {
    const { onPress, title = 'Tallenna', style, textStyle } = props
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
                style,
            ]}
            onPress={onPress}
            android_ripple={{ color: 'transparent' }}
        >
            <CustomText style={[styles.text, textStyle]}>{title}</CustomText>
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
})
