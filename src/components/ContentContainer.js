import { StyleSheet, View } from 'react-native'
import { DESKTOP_SIDEBAR_WIDTH } from './DesktopNavigation'
import { useResponsiveDimensions } from '../utils/responsive'

/**
 * Keeps list, form, and button widths readable on tablet and desktop.
 * Mobile stays full width. Tablet stays centered. Desktop sits on the left
 * with the same inset from the content area in every view.
 */
const DESKTOP_CONTENT_PADDING_TOP = 24

const ContentContainer = ({ children, style, maxWidth, insetTop = true }) => {
    const {
        width,
        isDesktop,
        isTablet,
        containerMaxWidth,
        responsivePadding,
    } = useResponsiveDimensions()
    const constrain = isDesktop || isTablet
    const contentMaxWidth = maxWidth ?? containerMaxWidth
    const inset = isDesktop ? responsivePadding : 0
    const contentAreaWidth = isDesktop
        ? Math.max(0, width - DESKTOP_SIDEBAR_WIDTH)
        : width
    const desktopWidth = Math.min(
        contentMaxWidth,
        Math.max(0, contentAreaWidth - inset * 2)
    )

    return (
        <View
            style={[
                styles.root,
                constrain && !isDesktop && styles.constrained,
                isTablet &&
                    !isDesktop && {
                        maxWidth: contentMaxWidth,
                        alignSelf: 'center',
                    },
                isDesktop && {
                    width: desktopWidth,
                    maxWidth: desktopWidth,
                    marginLeft: inset,
                    paddingTop: insetTop ? DESKTOP_CONTENT_PADDING_TOP : 0,
                    alignSelf: 'flex-start',
                },
                style,
            ]}
        >
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        width: '100%',
    },
    constrained: {
        width: '100%',
    },
})

export default ContentContainer
