import React from 'react'
import { Text, Pressable } from 'react-native'

export default function Button(props) {
    const { onPress, title = 'Save', style } = props
    return (
        <Pressable style={style} onPress={onPress}>
            <Text style={style}>{title}</Text>
        </Pressable>
    )
}
