import React, { useEffect } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

const AnimatedSplashScreen = () => {
    const scale = useSharedValue(1)
    const opacity = useSharedValue(0)

    useEffect(() => {
        // Start with a slight delay to ensure smooth transition from Expo splash
        const timer = setTimeout(() => {
            opacity.value = withTiming(1, {
                duration: 800,
                easing: Easing.out(Easing.ease),
            })
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.2, {
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                    }),
                    withTiming(1, {
                        duration: 1500,
                        easing: Easing.inOut(Easing.ease),
                    })
                ),
                -1,
                true
            )
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
        }
    })

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, animatedStyle]}>
                <Image
                    source={require('../../assets/arkiapuri-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#DCD4FC',
    },
    logoContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    logo: {
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent',
    },
})

export default AnimatedSplashScreen
