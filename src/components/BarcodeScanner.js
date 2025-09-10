import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Button from './Button'
import CustomText from './CustomText'

const BarcodeScanner = ({ onScanSuccess, onCancel, isVisible }) => {
    if (!isVisible) {
        return null
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
                <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            <CustomText style={styles.text}>
                Viivakoodin skannaus ei ole käytettävissä tässä versiossa
            </CustomText>
            <Button
                title="Sulje"
                onPress={onCancel}
                style={styles.closeButtonStyle}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        margin: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 10,
    },
    closeButtonStyle: {
        backgroundColor: '#9C86FC',
        marginTop: 20,
    },
})

export default BarcodeScanner
