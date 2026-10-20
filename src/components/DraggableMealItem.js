import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'

/**
 * Long-press pan wrapper for week-calendar meal rows.
 * Children stay in layout; opacity dims while a drag clone is shown elsewhere.
 */
const DraggableMealItem = ({
    meal,
    date,
    children,
    onDragStart,
    onDragEnd,
    onDragging,
    onDragPosition,
}) => {
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    const scale = useSharedValue(1)
    const isDraggingValue = useSharedValue(false)
    const lastAbsoluteY = useSharedValue(0)
    const startX = useSharedValue(0)
    const startY = useSharedValue(0)

    const handleStart = () => {
        onDragStart(meal, date)
    }

    const handleDragging = (absoluteY) => {
        if (onDragging) {
            onDragging(absoluteY)
        }
    }

    const handlePosition = (absoluteX, absoluteY) => {
        if (onDragPosition) {
            onDragPosition(absoluteX, absoluteY)
        }
    }

    const handleEnd = (finalY) => {
        onDragEnd(finalY)
    }

    const panGesture = Gesture.Pan()
        .activateAfterLongPress(150)
        .minDistance(5)
        .onBegin(() => {
            'worklet'
        })
        .onStart((event) => {
            'worklet'
            try {
                isDraggingValue.value = true
                scale.value = withSpring(1.05)
                startX.value = event.absoluteX
                startY.value = event.absoluteY
                runOnJS(handleStart)()
                runOnJS(handlePosition)(event.absoluteX, event.absoluteY)
            } catch (error) {
                // Silent fail for gesture start
            }
        })
        .onUpdate((event) => {
            'worklet'
            try {
                translateX.value = event.translationX
                translateY.value = event.translationY
                lastAbsoluteY.value = event.absoluteY
                runOnJS(handleDragging)(event.absoluteY)
                runOnJS(handlePosition)(event.absoluteX, event.absoluteY)
            } catch (error) {
                // Silent fail for gesture update
            }
        })
        .onEnd(() => {
            'worklet'
            try {
                const finalY = lastAbsoluteY.value
                isDraggingValue.value = false
                translateX.value = withSpring(0)
                translateY.value = withSpring(0)
                scale.value = withSpring(1)
                runOnJS(handleEnd)(finalY)
            } catch (error) {
                // Silent fail for gesture end
            }
        })

    const animatedStyle = useAnimatedStyle(() => {
        const isDragging = isDraggingValue.value
        return {
            opacity: isDragging ? 0.3 : 1,
        }
    })

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={animatedStyle}>{children}</Animated.View>
        </GestureDetector>
    )
}

export default DraggableMealItem
