import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

const CustomRadioButton = ({
    value,
    status,
    onPress,
    color = '#9C86FC',
    size = 20,
}) => {
    const isChecked = status === 'checked'

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.container, { width: size, height: size }]}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.outer,
                    {
                        width: size,
                        height: size,
                        borderColor: color,
                        borderWidth: isChecked ? 2 : 1.5,
                    },
                ]}
            >
                {isChecked && (
                    <View
                        style={[
                            styles.inner,
                            {
                                backgroundColor: color,
                                width: size * 0.5,
                                height: size * 0.5,
                                borderRadius: size * 0.25,
                            },
                        ]}
                    />
                )}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    outer: {
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    inner: {
        // Dynamically sized in component
    },
})

export default CustomRadioButton
