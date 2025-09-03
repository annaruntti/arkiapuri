import React from 'react'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import CustomText from './CustomText'
import FullWidthLayout from './FullWidthLayout'

const AuthLayout = ({
    children,
    title,
    subtitle,
    showHeader = true,
    headerStyle,
    contentStyle,
}) => {
    const { isDesktop, isTablet } = useResponsiveDimensions()

    const getContainerStyle = () => [
        styles.container,
        isDesktop && styles.desktopContainer,
        isTablet && styles.tabletContainer,
    ]

    const getContentStyle = () => [
        styles.content,
        isDesktop && styles.desktopContent,
        isTablet && styles.tabletContent,
        contentStyle,
    ]

    const getHeaderStyle = () => [
        styles.header,
        isDesktop && styles.desktopHeader,
        headerStyle,
    ]

    return (
        <FullWidthLayout>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={getContainerStyle()}>
                    <View style={getContentStyle()}>
                        {showHeader && (
                            <View style={getHeaderStyle()}>
                                {title && (
                                    <CustomText style={styles.title}>
                                        {title}
                                    </CustomText>
                                )}
                                {subtitle && (
                                    <CustomText style={styles.subtitle}>
                                        {subtitle}
                                    </CustomText>
                                )}
                            </View>
                        )}
                        {children}
                    </View>
                </View>
            </ScrollView>
        </FullWidthLayout>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 40,
        minHeight: '100%',
    },
    desktopContainer: {
        paddingHorizontal: 40,
        paddingVertical: 60,
        alignItems: 'center',
        backgroundColor: '#fafafa',
        minHeight: '100vh',
    },
    tabletContainer: {
        paddingHorizontal: 32,
        paddingVertical: 50,
        alignItems: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 400,
    },
    desktopContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 40,
        maxWidth: 480,
        width: '100%',
        ...(Platform.OS === 'web' && {
            boxShadow:
                '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        }),
    },
    tabletContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 32,
        maxWidth: 440,
        width: '100%',
        ...(Platform.OS === 'web' && {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }),
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    desktopHeader: {
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
    },
})

export default AuthLayout
