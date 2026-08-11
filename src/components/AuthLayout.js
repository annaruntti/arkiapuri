import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import CustomText from './CustomText'
import FullWidthLayout from './FullWidthLayout'

/** Typical desktop auth form column width (inputs + actions share this). */
export const AUTH_FORM_MAX_WIDTH = 400

const AuthLayout = ({
    children,
    title,
    subtitle,
    showHeader = true,
    headerStyle,
    contentStyle,
    centerContent = true,
}) => {
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const isWide = isDesktop || isTablet

    const getContainerStyle = () => [
        styles.container,
        !centerContent && styles.topAlignedContainer,
        isWide && styles.wideContainer,
    ]

    const getContentStyle = () => [
        styles.content,
        isWide && styles.wideContent,
        contentStyle,
    ]

    const getHeaderStyle = () => [
        styles.header,
        isWide && styles.wideHeader,
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
                                    <CustomText
                                        style={[
                                            styles.title,
                                            isWide && styles.wideTitle,
                                        ]}
                                    >
                                        {title}
                                    </CustomText>
                                )}
                                {subtitle && (
                                    <CustomText
                                        style={[
                                            styles.subtitle,
                                            isWide && styles.wideSubtitle,
                                        ]}
                                    >
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
        backgroundColor: '#ffffff',
    },
    topAlignedContainer: {
        justifyContent: 'flex-start',
    },
    wideContainer: {
        paddingHorizontal: 24,
        paddingVertical: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        flexGrow: 1,
        width: '100%',
    },
    content: {
        width: '100%',
        maxWidth: AUTH_FORM_MAX_WIDTH,
    },
    wideContent: {
        maxWidth: AUTH_FORM_MAX_WIDTH,
        width: '100%',
        padding: 0,
    },
    header: {
        marginBottom: 28,
        alignItems: 'center',
        width: '100%',
    },
    wideHeader: {
        marginBottom: 28,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 8,
        width: '100%',
    },
    wideTitle: {
        fontSize: 28,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
        width: '100%',
    },
    wideSubtitle: {
        textAlign: 'left',
        fontSize: 15,
    },
})

export default AuthLayout
