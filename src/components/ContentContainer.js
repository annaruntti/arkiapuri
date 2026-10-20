import { StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'

/**
 * Keeps list, form, and button widths readable on tablet and desktop.
 * Mobile stays full width. Tablet stays centered; desktop sits on the left.
 */
const ContentContainer = ({ children, style, maxWidth }) => {
    const { isDesktop, isTablet, containerMaxWidth } = useResponsiveDimensions()
    const constrain = isDesktop || isTablet

    return (
        <View
            style={[
                styles.root,
                constrain && styles.constrained,
                constrain && {
                    maxWidth: maxWidth ?? containerMaxWidth,
                    alignSelf: isDesktop ? 'flex-start' : 'center',
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
