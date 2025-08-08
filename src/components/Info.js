import React, { useState } from 'react'
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'

const Info = ({ title, content, iconSize = 20, iconColor = '#666' }) => {
    const [isVisible, setIsVisible] = useState(false)

    const showInfo = () => {
        setIsVisible(true)
    }

    const hideInfo = () => {
        setIsVisible(false)
    }

    return (
        <>
            <TouchableOpacity onPress={showInfo} style={styles.infoButton}>
                <MaterialIcons
                    name="info-outline"
                    size={iconSize}
                    color={iconColor}
                />
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={hideInfo}
            >
                <Pressable style={styles.overlay} onPress={hideInfo}>
                    <View style={styles.infoModal}>
                        <View style={styles.modalHeader}>
                            <CustomText style={styles.modalTitle}>
                                {title}
                            </CustomText>
                            <TouchableOpacity onPress={hideInfo}>
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                        <CustomText style={styles.modalContent}>
                            {content}
                        </CustomText>
                    </View>
                </Pressable>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    infoButton: {
        padding: 4,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    infoModal: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        maxWidth: 350,
        width: '100%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    modalContent: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
    },
})

export default Info
