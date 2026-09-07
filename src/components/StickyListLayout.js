import { ScrollView, StyleSheet, View } from 'react-native'

/**
 * Optional intro/header scrolls away. When `sticky` is provided it stays
 * pinned while the list below continues to scroll.
 */
const StickyListLayout = ({
    header,
    sticky,
    children,
    style,
    contentContainerStyle,
    refreshControl,
    showsVerticalScrollIndicator = false,
    keyboardShouldPersistTaps = 'handled',
}) => {
    const hasHeader = header != null
    const hasSticky = sticky != null

    return (
        <ScrollView
            style={[styles.scrollView, style]}
            contentContainerStyle={contentContainerStyle}
            stickyHeaderIndices={hasSticky ? [hasHeader ? 1 : 0] : []}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            refreshControl={refreshControl}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
            {hasHeader ? (
                <View style={styles.headerSection}>{header}</View>
            ) : null}
            {hasSticky ? (
                <View style={styles.stickySection}>{sticky}</View>
            ) : null}
            <View style={styles.body}>{children}</View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        width: '100%',
    },
    headerSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 5,
        paddingTop: 10,
        paddingBottom: 10,
    },
    stickySection: {
        backgroundColor: '#fff',
        zIndex: 100,
        elevation: 4,
    },
    body: {
        flexGrow: 1,
        zIndex: 0,
        elevation: 0,
    },
})

export default StickyListLayout
