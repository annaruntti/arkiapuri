import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'

const FullWidthLayout = ({ children }) => {
    const { isDesktop } = useResponsiveDimensions()

    if (!isDesktop) {
        // Mobile layout - just render children as-is
        return <View style={styles.mobileContainer}>{children}</View>
    }

    // Desktop layout - full width without sidebar, no padding/border radius
    return <View style={styles.desktopContainer}>{children}</View>
}

const styles = StyleSheet.create({
    mobileContainer: {
        flex: 1,
    },
    desktopContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
})

export default FullWidthLayout
