import { useEffect } from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated'

import Button from '../components/Button'
import CustomText from '../components/CustomText'
import FullWidthLayout from '../components/FullWidthLayout'
import { useLogin } from '../context/LoginProvider'
import { useResponsiveDimensions } from '../utils/responsive'

const image = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/4GwuSgvoXA0VX6cv5ix521/8545dbed4f7a510976eb78f8dcf4b91e/pexels-katerina-holmes-5907832.jpg',
}

const LandingScreen = ({ navigation }) => {
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const { isLoggedIn } = useLogin()
    const opacity = useSharedValue(0)
    const translateY = useSharedValue(36)

    useEffect(() => {
        if (isLoggedIn) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            })
        }
    }, [isLoggedIn, navigation])

    useEffect(() => {
        const motion = {
            duration: 900,
            easing: Easing.out(Easing.cubic),
        }
        opacity.value = withDelay(180, withTiming(1, motion))
        translateY.value = withDelay(180, withTiming(0, motion))
    }, [opacity, translateY])

    const panelStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }))

    return (
        <FullWidthLayout>
            <View style={styles.loginView}>
                <ImageBackground
                    imageStyle={{
                        resizeMode: 'cover',
                    }}
                    style={styles.image}
                    source={image}
                >
                    <Animated.View
                        style={[
                            styles.bottomBox,
                            isTablet && styles.tabletBottomBox,
                            isDesktop && styles.desktopBottomBox,
                            panelStyle,
                        ]}
                    >
                        <View
                            style={[
                                styles.bottomBoxContent,
                                isDesktop && styles.desktopBottomBoxContent,
                                isTablet && styles.tabletBottomBoxContent,
                            ]}
                        >
                            {!isDesktop && !isTablet && (
                                <Svg
                                    height={90}
                                    width="100%"
                                    viewBox="0 0 1440 320"
                                    preserveAspectRatio="none"
                                    style={styles.bottomWavy}
                                >
                                    <Path
                                        fill="#fff"
                                        d="M0,320L40,288C80,256,160,192,240,165.3C320,139,400,149,480,165.3C560,181,640,203,720,213.3C800,224,880,224,960,192C1040,160,1120,96,1200,64C1280,32,1360,32,1400,32L1440,32L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
                                    />
                                </Svg>
                            )}
                            <View style={styles.contentPadding}>
                                <CustomText
                                    style={[
                                        styles.introTextTitle,
                                        isTablet && styles.tabletIntroTextTitle,
                                        isDesktop &&
                                            styles.desktopIntroTextTitle,
                                    ]}
                                >
                                    Tervetuloa Arkiapuriin!
                                </CustomText>
                                <CustomText
                                    style={[
                                        styles.introText,
                                        isTablet && styles.tabletIntroText,
                                        isDesktop && styles.desktopIntroText,
                                    ]}
                                >
                                    Arkiapuri tekee arjen ruokahuollon
                                    suunnittelusta helppoa ja nopeaa.
                                </CustomText>
                                <View style={styles.actions}>
                                    <Button
                                        title="Aloitetaan"
                                        onPress={() =>
                                            navigation.navigate('Tutustu')
                                        }
                                        fullWidth
                                    />
                                    <Button
                                        title="Minulla on jo tili"
                                        type="TERTIARY"
                                        onPress={() =>
                                            navigation.navigate(
                                                'Kirjaudu sisään'
                                            )
                                        }
                                        fullWidth
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </ImageBackground>
            </View>
        </FullWidthLayout>
    )
}

export default LandingScreen

const styles = StyleSheet.create({
    loginView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    introTextTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 10,
    },
    introText: {
        textAlign: 'center',
        fontSize: 19,
        marginBottom: 24,
        color: '#333',
        lineHeight: 26,
    },
    bottomBox: {
        marginTop: 'auto',
        alignItems: 'center',
        width: '100%',
    },
    bottomBoxContent: {
        paddingTop: 25,
        paddingRight: 0,
        paddingBottom: 20,
        paddingLeft: 0,
        backgroundColor: '#fff',
        width: '100%',
        alignItems: 'center',
        alignSelf: 'center',
        position: 'relative',
        overflow: 'visible',
    },
    actions: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
        gap: 12,
        marginBottom: 12,
    },
    bottomWavy: {
        position: 'absolute',
        top: -90,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1,
    },
    contentPadding: {
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
    },
    tabletBottomBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    tabletBottomBoxContent: {
        paddingHorizontal: 40,
        paddingVertical: 30,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        width: '100%',
        maxWidth: 560,
    },
    tabletIntroTextTitle: {
        fontSize: 30,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
        paddingTop: 20,
    },
    tabletIntroText: {
        fontSize: 20,
        lineHeight: 28,
        marginBottom: 28,
        color: '#555',
        fontWeight: '400',
        paddingHorizontal: 20,
    },
    desktopBottomBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 60,
    },
    desktopBottomBoxContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        paddingHorizontal: 60,
        paddingVertical: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: 640,
    },
    desktopIntroTextTitle: {
        fontSize: 36,
        fontWeight: '700',
        marginBottom: 0,
        color: '#333',
        textAlign: 'center',
        paddingTop: 20,
    },
    desktopIntroText: {
        fontSize: 21,
        lineHeight: 32,
        marginBottom: 28,
        color: '#555',
        textAlign: 'center',
        fontWeight: '400',
        paddingVertical: 16,
    },
})
