import { useEffect } from 'react'
import {
    Dimensions,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated'
import { useResponsiveDimensions } from '../utils/responsive'
import CustomText from './CustomText'

const DISMISS_DISTANCE = 120
const DISMISS_VELOCITY = 900

const ResponsiveModal = ({
    visible,
    onClose,
    title,
    children,
    showCloseButton = true,
    showBackButton = false,
    backButtonLabel = 'Takaisin',
    contentStyle,
    headerStyle,
    titleStyle,
    modalStyle,
    maxWidth = 640,
}) => {
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const isMobileSheet = !isDesktop && !isTablet
    const translateY = useSharedValue(0)
    const dragStartY = useSharedValue(0)
    const screenHeight = Dimensions.get('window').height

    useEffect(() => {
        if (visible) {
            translateY.value = 0
        }
    }, [visible, translateY])

    const closeSheet = () => {
        onClose?.()
    }

    const panGesture = Gesture.Pan()
        .onStart(() => {
            dragStartY.value = translateY.value
        })
        .onUpdate((event) => {
            translateY.value = Math.max(0, dragStartY.value + event.translationY)
        })
        .onEnd((event) => {
            const shouldDismiss =
                translateY.value > DISMISS_DISTANCE ||
                event.velocityY > DISMISS_VELOCITY

            if (shouldDismiss) {
                translateY.value = withTiming(
                    screenHeight,
                    { duration: 220 },
                    (finished) => {
                        if (finished) {
                            runOnJS(closeSheet)()
                        }
                    }
                )
            } else {
                translateY.value = withSpring(0, {
                    damping: 20,
                    stiffness: 200,
                })
            }
        })

    const sheetAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }))

    const backdropAnimatedStyle = useAnimatedStyle(() => {
        const progress = Math.min(translateY.value / (screenHeight * 0.5), 1)
        return {
            opacity: 1 - progress * 0.7,
        }
    })

    const getModalViewStyle = () => {
        if (isDesktop) {
            return [styles.modalView, styles.desktopModalView, modalStyle]
        }
        if (isTablet) {
            return [styles.modalView, styles.tabletModalView, modalStyle]
        }
        return [styles.modalView, styles.mobileModalView, modalStyle]
    }

    const getModalContentStyle = () => {
        const baseStyle = [
            styles.modalContent,
            isMobileSheet && styles.mobileSheetContent,
            contentStyle,
        ]

        if (isDesktop) {
            return [
                ...baseStyle,
                styles.desktopModalContent,
                { maxWidth },
                Platform.OS === 'web' && {
                    boxShadow: '0px 10px 40px rgba(0, 0, 0, 0.2)',
                },
            ]
        }
        if (isTablet) {
            return [...baseStyle, styles.tabletModalContent, { maxWidth }]
        }
        return baseStyle
    }

    const showDesktopClose = showCloseButton && !showBackButton && !isMobileSheet

    const sheetBody = (
        <>
            {isMobileSheet ? (
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={styles.dragZone}>
                        <View
                            style={styles.handleArea}
                            accessibilityRole="adjustable"
                            accessibilityLabel="Vedä alas sulkeaksesi"
                        >
                            <View style={styles.handle} />
                        </View>
                        {title ? (
                            <View
                                style={[
                                    styles.modalHeader,
                                    styles.mobileModalHeader,
                                    showBackButton && styles.modalHeaderWithBack,
                                    headerStyle,
                                ]}
                            >
                                <CustomText
                                    style={[styles.modalTitle, titleStyle]}
                                >
                                    {title}
                                </CustomText>
                            </View>
                        ) : null}
                    </Animated.View>
                </GestureDetector>
            ) : (
                title && (
                    <View
                        style={[
                            styles.modalHeader,
                            isTablet && styles.tabletModalHeader,
                            isDesktop && styles.desktopModalHeader,
                            showBackButton && styles.modalHeaderWithBack,
                            showBackButton &&
                                isDesktop &&
                                styles.desktopModalHeaderWithBack,
                            headerStyle,
                        ]}
                    >
                        <CustomText
                            style={[
                                styles.modalTitle,
                                isDesktop && styles.desktopModalTitle,
                                titleStyle,
                            ]}
                        >
                            {title}
                        </CustomText>
                    </View>
                )
            )}
            {showBackButton && (
                <Pressable
                    onPress={onClose}
                    style={[
                        styles.backButton,
                        isMobileSheet && styles.mobileBackButton,
                        isDesktop && styles.desktopBackButton,
                    ]}
                    hitSlop={{
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10,
                    }}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={isDesktop ? 22 : 20}
                        color="#5844BB"
                    />
                    <CustomText style={styles.backButtonText}>
                        {backButtonLabel}
                    </CustomText>
                </Pressable>
            )}
            {showDesktopClose && (
                <Pressable
                    onPress={onClose}
                    style={[
                        styles.closeButton,
                        (isDesktop || isTablet) && styles.desktopCloseButton,
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
                        size={isDesktop || isTablet ? 28 : 24}
                        color={isDesktop || isTablet ? '#666' : 'black'}
                    />
                </Pressable>
            )}
            <View
                style={[
                    styles.modalBody,
                    isTablet && styles.tabletModalBody,
                    isDesktop && styles.desktopModalBody,
                ]}
            >
                {children}
            </View>
        </>
    )

    return (
        <Modal
            animationType={isDesktop ? 'fade' : 'slide'}
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={styles.gestureRoot}>
                <View style={getModalViewStyle()}>
                    {isMobileSheet ? (
                        <>
                            <Animated.View
                                style={[
                                    styles.backdropFill,
                                    backdropAnimatedStyle,
                                ]}
                            >
                                <Pressable
                                    style={StyleSheet.absoluteFillObject}
                                    onPress={onClose}
                                    accessibilityRole="button"
                                    accessibilityLabel="Sulje"
                                />
                            </Animated.View>
                            <Animated.View
                                style={[
                                    getModalContentStyle(),
                                    sheetAnimatedStyle,
                                ]}
                            >
                                {sheetBody}
                            </Animated.View>
                        </>
                    ) : (
                        <View style={getModalContentStyle()}>{sheetBody}</View>
                    )}
                </View>
            </GestureHandlerRootView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    gestureRoot: {
        flex: 1,
    },
    backdropFill: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    mobileModalView: {
        backgroundColor: 'transparent',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        width: '100%',
        paddingTop: 35,
    },
    mobileSheetContent: {
        paddingTop: 4,
    },
    dragZone: {
        width: '100%',
    },
    handleArea: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        minHeight: 28,
    },
    handle: {
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#D1D5DB',
    },
    mobileModalHeader: {
        paddingTop: 2,
    },
    mobileBackButton: {
        top: 36,
    },
    modalHeader: {
        width: '100%',
        paddingTop: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 5,
    },
    modalHeaderWithBack: {
        paddingTop: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalBody: {
        flex: 1,
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute',
        left: 8,
        top: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        zIndex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    backButtonText: {
        color: '#5844BB',
        fontSize: 15,
        fontWeight: '500',
        marginLeft: 2,
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 5,
        zIndex: 1,
    },

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
        alignSelf: 'center',
        paddingTop: 32,
        paddingBottom: 8,
    },
    tabletModalHeader: {
        paddingHorizontal: 40,
        paddingTop: 16,
        marginBottom: 8,
    },
    tabletModalBody: {
        paddingHorizontal: 40,
        paddingBottom: 36,
    },

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
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    desktopModalHeaderWithBack: {
        paddingTop: 40,
    },
    desktopModalTitle: {
        fontSize: 24,
        marginBottom: 15,
        color: '#333',
    },
    desktopModalBody: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    desktopBackButton: {
        left: 12,
        top: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
