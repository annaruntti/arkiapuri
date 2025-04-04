import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialIcons as Icon } from '@expo/vector-icons'

const ModalHeader = ({ onClose }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Peruuta"
            >
                <Icon name="close" size={28} color="#000" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
        zIndex: 999,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
})

export default ModalHeader
