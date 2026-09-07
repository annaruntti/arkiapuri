import { Platform, View } from 'react-native'
import { useEffect } from 'react'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

const PrimaryActionFadeNative = ({ children, style }) => {
    const opacity = useSharedValue(0)
    const translateY = useSharedValue(10)

    useEffect(() => {
        opacity.value = withTiming(1, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
        })
        translateY.value = withTiming(0, {
            duration: 400,
            easing: Easing.out(Easing.cubic),
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }))

    return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
}

const PrimaryActionFadeWeb = ({ children, style }) => (
    <View style={style}>{children}</View>
)

const PrimaryActionFade =
    Platform.OS === 'web' ? PrimaryActionFadeWeb : PrimaryActionFadeNative

export default PrimaryActionFade
