import React from 'react'
import { Text, StyleSheet } from 'react-native'

const CustomText = ({ style, ...props }) => {
    return <Text style={[styles.text, style]} {...props} />
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'FiraSans-Regular',
    },
})

export default CustomText
