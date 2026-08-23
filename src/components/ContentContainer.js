import { StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'

/**
 * Keeps list, form, and button widths readable on tablet and desktop.
 * Mobile stays full width of the screen.
 */
const ContentContainer = ({ children, style, maxWidth }) => {
    const { isDesktop, isTablet, containerMaxWidth } = useResponsiveDimensions()
    const constrain = isDesktop || isTablet

    return (
        <View
            style={[
                styles.root,
                constrain && styles.constrained,
                constrain && { maxWidth: maxWidth ?? containerMaxWidth },
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
        alignSelf: 'center',
    },
})

export default ContentContainer
