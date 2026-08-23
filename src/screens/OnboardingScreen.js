import { useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { AntDesign, Feather, FontAwesome6 } from '@expo/vector-icons'
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'

import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import { useLogin } from '../context/LoginProvider'
import { useResponsiveDimensions } from '../utils/responsive'

const SWIPE_DISTANCE = 56
const SWIPE_VELOCITY = 650

const STEPS = [
    {
        title: 'Helpompi arki',
        IconComponent: Feather,
        icon: 'home',
        body: 'Arkiapuri kokoaa ateriat, pentterin, ostoslistat ja lukujärjestyksen yhteen paikkaan. Näin arjen ruokahuolto sujuu helpommin ja ruokahävikki vähenee.',
    },
    {
        title: 'Ateriat',
        IconComponent: FontAwesome6,
        icon: 'bowl-food',
        body: 'Selaa ja luo aterioita ja reseptejä. Puuttuvat ainekset voit lisätä suoraan ostoslistalle. Aterioita luodessasi, voit lisätä niille suunnitellut valmistus- ja syöntipäivät, jolloin ne sirtyvät suoraa lukujärjestykseesi.',
    },
    {
        title: 'Pentteri',
        IconComponent: AntDesign,
        icon: 'database',
        body: 'Pentteri on virtuaalinen ruokavarastosi: jääkaappi, pakastin ja kuivakaappi. Skannaa pentteri ottamalla kuva kaapista, jolloin tekoäly ehdottaa näkemiään tuotteita. Voit myös lisätä tuotteita yksi kerrallaan.',
    },
    {
        title: 'Ostoslista',
        IconComponent: Feather,
        icon: 'shopping-cart',
        body: 'Luo ostoslistoja ateriasuunnitelmasi perusteella. Ostetut tuotteet voit siirtää suoraan pentteriin.',
    },
    {
        title: 'Lukujärjestys',
        IconComponent: AntDesign,
        icon: 'calendar',
        body: 'Lukujärjestyksessä näet viikko- ja kuukausikalenterin. Voit lisätä aterioita lukujärjestykseesi, jotta näet selkeän suunnitelman siitä, mitä aterioita olet suunnitellut valmistaa ja syödä.',
    },
    {
        title: 'Kokeile ilman tunnusta',
        IconComponent: Feather,
        icon: 'user',
        body: 'Voit kokeilla sovellusta kirjautumatta. Muutokset eivät tallennu pysyvästi ilman käyttäjätiliä.',
        isLast: true,
    },
]

const clampStep = (value) =>
    Math.min(STEPS.length - 1, Math.max(0, Number(value) || 0))

const OnboardingScreen = ({ navigation, route }) => {
    const { allowContinueWithoutLogin, completeOnboarding } = useLogin()
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const stepIndex = clampStep(route.params?.step)
    const isAnimating = useRef(false)
    const enterFrom = useRef(1)
    const opacity = useSharedValue(0)
    const translateX = useSharedValue(22)

    const step = STEPS[stepIndex]
    const isLast = Boolean(step.isLast)
    const Icon = step.IconComponent

    useEffect(() => {
        translateX.value = enterFrom.current * 22
        opacity.value = withTiming(1, {
            duration: 420,
            easing: Easing.out(Easing.cubic),
        })
        translateX.value = withTiming(0, {
            duration: 420,
            easing: Easing.out(Easing.cubic),
        })
        isAnimating.current = false
    }, [stepIndex, opacity, translateX])

    const contentStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }))

    const applyStep = (nextIndex) => {
        navigation.setParams({ step: clampStep(nextIndex) })
    }

    const goToStep = (nextIndex) => {
        if (nextIndex === stepIndex || isAnimating.current) {
            return
        }

        isAnimating.current = true
        const direction = nextIndex > stepIndex ? 1 : -1
        enterFrom.current = direction

        opacity.value = withTiming(
            0,
            {
                duration: 240,
                easing: Easing.in(Easing.cubic),
            },
            (finished) => {
                if (finished) {
                    runOnJS(applyStep)(nextIndex)
                } else {
                    isAnimating.current = false
                }
            }
        )
        translateX.value = withTiming(direction * -18, {
            duration: 240,
            easing: Easing.in(Easing.cubic),
        })
    }

    const handleBack = () => {
        if (stepIndex === 0) {
            navigation.goBack()
            return
        }
        goToStep(stepIndex - 1)
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (stepIndex <= 0) {
                return
            }
            const actionType = e.data.action.type
            if (actionType !== 'GO_BACK' && actionType !== 'POP') {
                return
            }
            e.preventDefault()
            goToStep(stepIndex - 1)
        })
        return unsubscribe
    }, [navigation, stepIndex])

    const handleSwipeNext = () => {
        if (stepIndex < STEPS.length - 1) {
            goToStep(stepIndex + 1)
        }
    }

    const handleSwipeBack = () => {
        handleBack()
    }

    const panGesture = Gesture.Pan()
        .activeOffsetX([-24, 24])
        .failOffsetY([-20, 20])
        .onEnd((event) => {
            const swipedLeft =
                event.translationX < -SWIPE_DISTANCE ||
                event.velocityX < -SWIPE_VELOCITY
            const swipedRight =
                event.translationX > SWIPE_DISTANCE ||
                event.velocityX > SWIPE_VELOCITY

            if (swipedLeft) {
                runOnJS(handleSwipeNext)()
            } else if (swipedRight) {
                runOnJS(handleSwipeBack)()
            }
        })

    const handleContinueAsGuest = async () => {
        await completeOnboarding()
        allowContinueWithoutLogin()
        navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
        })
    }

    const handleSignIn = async () => {
        await completeOnboarding()
        navigation.navigate('Kirjaudu sisään')
    }

    return (
        <AuthLayout showHeader={false} contentStyle={styles.layoutContent}>
            <GestureHandlerRootView>
                <GestureDetector gesture={panGesture}>
                    <View style={styles.swipeArea}>
                        <View style={styles.dots}>
                            {STEPS.map((item, index) => (
                                <View
                                    key={item.title}
                                    style={[
                                        styles.dot,
                                        index === stepIndex && styles.dotActive,
                                    ]}
                                />
                            ))}
                        </View>

                        <Animated.View style={[styles.step, contentStyle]}>
                            <View style={styles.iconCircle}>
                                <Icon
                                    name={step.icon}
                                    size={32}
                                    color="#5844BB"
                                />
                            </View>
                            <CustomText
                                style={[
                                    styles.title,
                                    (isDesktop || isTablet) && styles.wideTitle,
                                ]}
                            >
                                {step.title}
                            </CustomText>
                            <CustomText
                                style={[
                                    styles.body,
                                    (isDesktop || isTablet) && styles.wideBody,
                                ]}
                            >
                                {step.body}
                            </CustomText>
                        </Animated.View>
                    </View>
                </GestureDetector>
            </GestureHandlerRootView>

            <View style={styles.actions}>
                {isLast ? (
                    <>
                        <Button
                            title="Jatka ilman kirjautumista"
                            onPress={handleContinueAsGuest}
                            fullWidth
                        />
                        <Button
                            title="Kirjaudu sisään"
                            type="SECONDARY"
                            onPress={handleSignIn}
                            fullWidth
                        />
                        <Button
                            title="Takaisin"
                            type="TERTIARY"
                            onPress={handleBack}
                            fullWidth
                        />
                    </>
                ) : (
                    <>
                        <Button
                            title="Seuraava"
                            onPress={() => goToStep(stepIndex + 1)}
                            fullWidth
                        />
                        <Button
                            title="Takaisin"
                            type="TERTIARY"
                            onPress={handleBack}
                            fullWidth
                        />
                    </>
                )}
            </View>
        </AuthLayout>
    )
}

export default OnboardingScreen

const styles = StyleSheet.create({
    layoutContent: {
        paddingTop: 12,
    },
    swipeArea: {
        width: '100%',
        paddingBottom: 8,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 28,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d1d5db',
    },
    dotActive: {
        width: 22,
        backgroundColor: '#5844BB',
    },
    step: {
        alignItems: 'center',
        marginBottom: 28,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#f3f0ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 12,
    },
    wideTitle: {
        fontSize: 28,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: '#4b5563',
        textAlign: 'center',
    },
    wideBody: {
        fontSize: 17,
        lineHeight: 26,
    },
    actions: {
        width: '100%',
        gap: 12,
    },
})
