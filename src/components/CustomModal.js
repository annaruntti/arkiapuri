import React from 'react'
import { View, StyleSheet, Modal, Pressable } from 'react-native'
import CustomText from './CustomText'
import { AntDesign } from '@expo/vector-icons'

const CustomModal = ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    contentStyle,
    headerStyle,
    modalStyle,
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={[styles.modalView, modalStyle]}>
                <View style={[styles.modalContent, contentStyle]}>
                    {showCloseButton && (
                        <Pressable
                            onPress={onClose}
                            style={styles.closeButton}
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                            }}
                        >
                            <AntDesign name="close" size={24} color="black" />
                        </Pressable>
                    )}
                    {title && (
                        <View style={[styles.modalHeader, headerStyle]}>
                            <CustomText style={styles.modalTitle}>
                                {title}
                            </CustomText>
                        </View>
                    )}
                    {children}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        width: '100%',
        paddingTop: 35,
    },
    modalHeader: {
        width: '100%',
        paddingTop: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 5,
        zIndex: 1,
    },
})

export default CustomModal
