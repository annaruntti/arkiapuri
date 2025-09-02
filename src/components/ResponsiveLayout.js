import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import DesktopNavigation from './DesktopNavigation'

const ResponsiveLayout = ({ children, activeRoute }) => {
    const { isDesktop } = useResponsiveDimensions()

    if (!isDesktop) {
        // Mobile layout - just render children as-is
        return <View style={styles.mobileContainer}>{children}</View>
    }

    // Desktop layout - with sidebar navigation
    return (
        <View style={styles.desktopContainer}>
            <DesktopNavigation activeRoute={activeRoute} />
            <View style={styles.contentArea}>{children}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    mobileContainer: {
        flex: 1,
    },
    desktopContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    contentArea: {
        flex: 1,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
})

export default ResponsiveLayout
