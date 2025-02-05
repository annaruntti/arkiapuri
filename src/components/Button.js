import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import CustomText from './CustomText'

export default function Button(props) {
    const { onPress, title = 'Tallenna', style } = props
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                style,
                pressed && styles.pressed,
            ]}
            onPress={onPress}
            android_ripple={{ color: 'transparent' }}
        >
            <CustomText style={style}>{title}</CustomText>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.75,
    },
})
