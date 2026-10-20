import { ScrollView, StyleSheet, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import ContentContainer from './ContentContainer'
import CustomText from './CustomText'
import FullWidthLayout from './FullWidthLayout'

/** Typical desktop auth form column width (inputs + actions share this). */
export const AUTH_FORM_MAX_WIDTH = 360

const AuthLayout = ({
    children,
    title,
    subtitle,
    showHeader = true,
    headerStyle,
    contentStyle,
    centerContent = true,
    profileCard = false,
}) => {
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const isWide = isDesktop || isTablet
    const useProfileCard = profileCard && isDesktop

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

    const header = showHeader ? (
        <View style={getHeaderStyle()}>
            {title && (
                <CustomText
                    style={[styles.title, isWide && styles.wideTitle]}
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
    ) : null

    if (useProfileCard) {
        return (
            <View style={styles.profilePage}>
                <ScrollView
                    style={styles.profileScroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <ContentContainer>
                        <View style={styles.profileInner}>
                            <View style={styles.profileCard}>
                                {header}
                                {children}
                            </View>
                        </View>
                    </ContentContainer>
                </ScrollView>
            </View>
        )
    }

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
                        {header}
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
    profilePage: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    profileScroll: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    profileInner: {
        width: '100%',
        paddingTop: 8,
        paddingBottom: 48,
    },
    profileCard: {
        width: '100%',
        backgroundColor: '#F4F0FF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D8CEF8',
        paddingHorizontal: 32,
        paddingVertical: 28,
    },
})

export default AuthLayout
