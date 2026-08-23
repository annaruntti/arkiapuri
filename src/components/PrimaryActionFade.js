import { useEffect } from 'react'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

/** One-shot fade/slide-in for a screen's primary actions. */
const PrimaryActionFade = ({ children, style }) => {
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
    }, [opacity, translateY])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }))

    return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
}

export default PrimaryActionFade
