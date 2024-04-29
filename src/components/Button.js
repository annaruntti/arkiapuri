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

// const styles = StyleSheet.create({
//     button: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 12,
//         paddingHorizontal: 32,
//         borderRadius: 4,
//         elevation: 3,
//         backgroundColor: 'black',
//         marginBottom: 20,
//     },
//     text: {
//         fontSize: 16,
//         lineHeight: 21,
//         fontWeight: 'bold',
//         letterSpacing: 0.25,
//         color: 'white',
//     },
// })
