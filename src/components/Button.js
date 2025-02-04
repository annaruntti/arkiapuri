import React from 'react'
import { Text, Pressable } from 'react-native'
import CustomText from './CustomText'

export default function Button(props) {
    const { onPress, title = 'Tallenna', style } = props
    return (
        <Pressable style={style} onPress={onPress}>
            <CustomText style={style}>{title}</CustomText>
        </Pressable>
    )
}
