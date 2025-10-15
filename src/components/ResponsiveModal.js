import { AntDesign } from '@expo/vector-icons'
import React from 'react'
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import CustomText from './CustomText'

const ResponsiveModal = ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    contentStyle,
    headerStyle,
    modalStyle,
    maxWidth = 600, // Desktop max width
}) => {
    const { isDesktop, isTablet } = useResponsiveDimensions()

    const getModalViewStyle = () => {
        if (isDesktop) {
            return [styles.modalView, styles.desktopModalView, modalStyle]
        } else if (isTablet) {
            return [styles.modalView, styles.tabletModalView, modalStyle]
        }
        return [styles.modalView, modalStyle]
    }

    const getModalContentStyle = () => {
        const baseStyle = [styles.modalContent, contentStyle]

        if (isDesktop) {
            return [
                ...baseStyle,
                styles.desktopModalContent,
                { maxWidth },
                Platform.OS === 'web' && {
                    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.2)',
                },
            ]
        } else if (isTablet) {
            return [...baseStyle, styles.tabletModalContent]
        }

        return baseStyle
    }

    return (
        <Modal
            animationType={isDesktop ? 'fade' : 'slide'}
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={getModalViewStyle()}>
                <View style={getModalContentStyle()}>
                    {showCloseButton && (
                        <Pressable
                            onPress={onClose}
                            style={[
                                styles.closeButton,
                                isDesktop && styles.desktopCloseButton,
                            ]}
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                            }}
                        >
                            <AntDesign
                                name="close"
                                size={isDesktop ? 28 : 24}
                                color={isDesktop ? '#666' : 'black'}
                            />
                        </Pressable>
                    )}
                    {title && (
                        <View
                            style={[
                                styles.modalHeader,
                                headerStyle,
                                isDesktop && styles.desktopModalHeader,
                            ]}
                        >
                            <CustomText
                                style={[
                                    styles.modalTitle,
                                    isDesktop && styles.desktopModalTitle,
                                ]}
                            >
                                {title}
                            </CustomText>
                        </View>
                    )}
                    <View
                        style={[
                            styles.modalBody,
                            isDesktop && styles.desktopModalBody,
                        ]}
                    >
                        {children}
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    // Mobile styles (existing)
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
        paddingHorizontal: 10,
        alignItems: 'center',
        marginBottom: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: 10,
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 5,
        zIndex: 1,
    },

    // Tablet styles
    tabletModalView: {
        justifyContent: 'center',
        paddingHorizontal: 40,
        paddingVertical: 40,
    },
    tabletModalContent: {
        borderRadius: 16,
        height: 'auto',
        maxHeight: '85%',
        width: '100%',
        paddingTop: 25,
    },

    // Desktop styles
    desktopModalView: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 40,
    },
    desktopModalContent: {
        borderRadius: 12,
        height: 'auto',
        maxHeight: '90%',
        minHeight: '60%',
        width: '100%',
        paddingTop: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
    },
    desktopModalHeader: {
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    desktopModalTitle: {
        fontSize: 24,
        marginBottom: 15,
        color: '#333',
    },
    desktopModalBody: {
        paddingHorizontal: 10,
        paddingBottom: 30,
    },
    desktopCloseButton: {
        right: 15,
        top: 15,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
})

export default ResponsiveModal
