import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'
import { useResponsiveDimensions } from '../utils/responsive'

/**
 * Underline tab bar used at the top of a screen.
 * On a phone the tabs share the row. On wider screens they sit on the left.
 * Children render below the bar.
 */
const ScreenTabBar = ({ tabs, activeId, onChange, children }) => {
    const { isTablet } = useResponsiveDimensions()
    const isMobile = !isTablet

    return (
        <View style={styles.container}>
            <View style={styles.content}>{children}</View>
            <View
                style={[
                    styles.tabContainer,
                    isMobile && styles.tabContainerMobile,
                ]}
            >
                {tabs.map((tab) => {
                    const active = tab.id === activeId
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tabButton,
                                isMobile && styles.tabButtonMobile,
                                active && styles.activeTabButton,
                            ]}
                            onPress={() => onChange(tab.id)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            accessibilityLabel={tab.label}
                        >
                            <CustomText
                                style={[
                                    styles.tabButtonText,
                                    active && styles.activeTabButtonText,
                                ]}
                            >
                                {tab.label}
                            </CustomText>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        position: 'relative',
        overflow: 'visible',
    },
    content: {
        flex: 1,
        paddingTop: 52,
        overflow: 'visible',
    },
    tabContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        backgroundColor: '#fff',
        zIndex: 10000000,
        elevation: 10000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'stretch',
        borderBottomWidth: 0,
    },
    tabContainerMobile: {
        justifyContent: 'center',
    },
    tabButton: {
        paddingVertical: 15,
        paddingHorizontal: 36,
        alignItems: 'center',
        alignSelf: 'stretch',
        backgroundColor: '#f7f8fa',
        borderBottomWidth: 3,
        borderBottomColor: '#dee2e6',
    },
    tabButtonMobile: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTabButton: {
        backgroundColor: '#fff',
        borderBottomColor: '#5844BB',
        zIndex: 1,
        elevation: 3,
        boxShadow: '0 1px 6px rgba(88, 68, 187, 0.28)',
    },
    tabButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
    },
    activeTabButtonText: {
        color: '#5844BB',
        fontWeight: 'bold',
    },
})

export default ScreenTabBar
