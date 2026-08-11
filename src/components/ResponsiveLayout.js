import { StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import DesktopNavigation from './DesktopNavigation'
import MainTabBar from './MainTabBar'

/**
 * App chrome around screen content.
 * - Desktop: left sidebar (when showDesktopNav)
 * - Mobile/tablet: optional bottom tab bar (when showMobileTabs)
 */
const ResponsiveLayout = ({
    children,
    activeRoute,
    showMobileTabs = false,
    showDesktopNav = true,
}) => {
    const { isDesktop } = useResponsiveDimensions()

    if (isDesktop) {
        if (!showDesktopNav) {
            return <View style={styles.mobileContainer}>{children}</View>
        }

        return (
            <View style={styles.desktopContainer}>
                <DesktopNavigation activeRoute={activeRoute} />
                <View style={styles.contentArea}>{children}</View>
            </View>
        )
    }

    if (showMobileTabs) {
        return (
            <View style={styles.mobileContainer}>
                <View style={styles.contentArea}>{children}</View>
                <MainTabBar activeRoute={activeRoute} />
            </View>
        )
    }

    return <View style={styles.mobileContainer}>{children}</View>
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
