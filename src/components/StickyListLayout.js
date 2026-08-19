import { ScrollView, StyleSheet, View } from 'react-native'

/**
 * Intro/header scrolls away; search and action buttons stay pinned
 * while the list below continues to scroll.
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
}) => (
    <ScrollView
        style={[styles.scrollView, style]}
        contentContainerStyle={contentContainerStyle}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={refreshControl}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    >
        <View style={styles.headerSection}>{header}</View>
        <View style={styles.stickySection}>{sticky}</View>
        <View style={styles.body}>{children}</View>
    </ScrollView>
)

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        width: '100%',
        zIndex: 1,
    },
    headerSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 5,
        paddingTop: 10,
        paddingBottom: 10,
    },
    stickySection: {
        backgroundColor: '#fff',
        zIndex: 20,
        overflow: 'visible',
    },
    body: {
        flexGrow: 1,
    },
})

export default StickyListLayout
