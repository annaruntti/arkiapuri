import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import { addDays, format } from 'date-fns'
import { fi } from 'date-fns/locale'
import React, { useEffect, useRef, useState } from 'react'
import {
    Alert,
    FlatList,
    Image,
    Platform,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import Button from './Button'
import CustomText from './CustomText'
import MealItemDetail from './MealItemDetail'
import ResponsiveModal from './ResponsiveModal'

const PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/3b9imD6TDC4i68V4uHVgL1/1ac1194dccb086bb52ebd674c59983e3/undraw_breakfast_rgx5.png'

const mealTypeTranslations = {
    breakfast: 'Aamiainen',
    lunch: 'Lounas',
    snack: 'Välipala',
    dinner: 'Päivällinen',
    supper: 'Iltapala',
    dessert: 'Jälkiruoka',
    other: 'Muu',
}

// Group meals by their default roles
const groupMealsByCategory = (meals) => {
    const grouped = {}

    meals.forEach((meal) => {
        const roles = meal.defaultRoles || ['other']
        roles.forEach((role) => {
            if (!grouped[role]) {
                grouped[role] = []
            }
            grouped[role].push(meal)
        })
    })

    // Sort categories by predefined order
    const categoryOrder = [
        'breakfast',
        'lunch',
        'snack',
        'dinner',
        'supper',
        'dessert',
        'other',
    ]
    const sortedGrouped = {}

    categoryOrder.forEach((category) => {
        if (grouped[category] && grouped[category].length > 0) {
            sortedGrouped[category] = grouped[category]
        }
    })

    return sortedGrouped
}

// Custom Draggable Component
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

    // Create the callbacks outside the gesture to properly capture meal and date
    const handleStart = () => {
        console.log(
            'handleStart called with meal:',
            meal?.name,
            'date:',
            format(date, 'yyyy-MM-dd')
        )
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
            console.log('Gesture begin')
        })
        .onStart((event) => {
            'worklet'
            console.log('Gesture start')
            try {
                isDraggingValue.value = true
                scale.value = withSpring(1.05)
                startX.value = event.absoluteX
                startY.value = event.absoluteY
                runOnJS(handleStart)()
                runOnJS(handlePosition)(event.absoluteX, event.absoluteY)
            } catch (error) {
                console.log('Error in onStart:', error)
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
                console.log('Error in onUpdate:', error)
            }
        })
        .onEnd(() => {
            'worklet'
            console.log('Gesture end, lastAbsoluteY:', lastAbsoluteY.value)
            try {
                const finalY = lastAbsoluteY.value
                isDraggingValue.value = false
                translateX.value = withSpring(0)
                translateY.value = withSpring(0)
                scale.value = withSpring(1)
                runOnJS(handleEnd)(finalY)
            } catch (error) {
                console.log('Error in onEnd:', error)
            }
        })

    const animatedStyle = useAnimatedStyle(() => {
        const isDragging = isDraggingValue.value
        return {
            opacity: isDragging ? 0.3 : 1, // Make original very transparent when dragging
        }
    })

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={animatedStyle}>{children}</Animated.View>
        </GestureDetector>
    )
}

const Table = () => {
    const [dates, setDates] = useState([])
    const [mealsByDate, setMealsByDate] = useState({})
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedDates, setSelectedDates] = useState([])
    const [availableMeals, setAvailableMeals] = useState([])
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, -1 = previous, +1 = next
    const [moveMealModalVisible, setMoveMealModalVisible] = useState(false)
    const [mealToMove, setMealToMove] = useState(null)
    const [moveFromDate, setMoveFromDate] = useState(null)

    // Drag and drop state
    const [draggingMeal, setDraggingMeal] = useState(null)
    const [draggingFromDate, setDraggingFromDate] = useState(null)
    const [dropTargetDate, setDropTargetDate] = useState(null)
    const [isScrollEnabled, setIsScrollEnabled] = useState(true)
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
    const dayRefs = useRef(new Map())
    const scrollViewRef = useRef(null)
    const flatListRef = useRef(null)
    const draggingMealRef = useRef(null)
    const draggingFromDateRef = useRef(null)
    const scrollOffsetRef = useRef(0)

    // Generate 7 days based on week offset
    useEffect(() => {
        const today = new Date()
        // Calculate the start of the week based on offset
        const startDate = addDays(today, weekOffset * 7)
        const weekDays = []

        console.log('📅 Generating week dates:')
        for (let i = 0; i < 7; i++) {
            const date = addDays(startDate, i)
            weekDays.push(date)
            console.log(
                `  [${i}]: ${format(date, 'yyyy-MM-dd EEEE', { locale: fi })}`
            )
        }

        setDates(weekDays)
        fetchMealData(weekDays)
    }, [weekOffset])

    // Fetch meal data for the dates
    const fetchMealData = async (datesToFetch, debugMealId = null) => {
        try {
            const token = await storage.getItem('userToken')

            // Format dates for filtering
            const formattedDates = datesToFetch.map((date) =>
                format(date, 'yyyy-MM-dd')
            )

            // Fetch all meals and filter by planned dates on frontend
            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                const allMeals = response.data.meals || []
                const mealsByDate = {}

                // Initialize empty arrays for each date
                formattedDates.forEach((date) => {
                    mealsByDate[date] = []
                })

                // Group meals by their planned eating dates (or cooking date if no eating dates)
                allMeals.forEach((meal) => {
                    // Use plannedEatingDates if available and not empty, otherwise fall back to plannedCookingDate
                    let datesToDisplay = []

                    if (
                        meal.plannedEatingDates &&
                        Array.isArray(meal.plannedEatingDates) &&
                        meal.plannedEatingDates.length > 0
                    ) {
                        // Use eating dates
                        datesToDisplay = meal.plannedEatingDates
                    } else if (meal.plannedCookingDate) {
                        // Fall back to cooking date
                        datesToDisplay = [meal.plannedCookingDate]
                    }

                    datesToDisplay.forEach((dateValue) => {
                        if (dateValue) {
                            const mealDate = format(
                                new Date(dateValue),
                                'yyyy-MM-dd'
                            )
                            if (mealsByDate.hasOwnProperty(mealDate)) {
                                mealsByDate[mealDate].push(meal)
                            }
                        }
                    })
                })

                setMealsByDate(mealsByDate)
            }
        } catch (error) {
            console.error('Error fetching meal data:', error)
        }
    }

    const handleAddMeal = async (date) => {
        console.log(
            '🔵 handleAddMeal called with date:',
            format(date, 'yyyy-MM-dd EEEE', { locale: fi })
        )
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data && response.data.meals) {
                // Show all meals for now, remove the filter temporarily
                const availableMeals = response.data.meals
                setAvailableMeals(availableMeals)
                setSelectedDate(date)
                // Always start fresh with the clicked date
                setSelectedDates([date])
                setIsModalVisible(true)
            }
        } catch (error) {
            console.error('Error fetching meals:', error)
            Alert.alert('Virhe', 'Aterioiden hakeminen epäonnistui')
        }
    }

    const handleSelectMeal = async (meal) => {
        console.log(
            '🟢 handleSelectMeal - selectedDates:',
            selectedDates.map((d) =>
                format(d, 'yyyy-MM-dd EEEE', { locale: fi })
            )
        )
        try {
            const token = await storage.getItem('userToken')
            const formattedDates = selectedDates.map(
                (date) =>
                    new Date(date).toISOString().split('T')[0] +
                    'T00:00:00.000Z'
            )
            console.log('🟢 Formatted dates being saved:', formattedDates)

            // Use PUT with the meal._id
            const response = await axios.put(
                getServerUrl(`/meals/${meal._id}`),
                {
                    plannedEatingDates: formattedDates,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            // Refresh the meal data
            fetchMealData(dates)
            setIsModalVisible(false)

            // Show success message
            const dateText =
                selectedDates.length === 1
                    ? format(selectedDates[0], 'd.M.yyyy')
                    : `${selectedDates.length} päivälle`
            Alert.alert('Onnistui', `Ateria lisätty ${dateText}`)
        } catch (error) {
            console.error('Error updating meal:', error.response?.data || error)
            if (error.response?.status === 404) {
                Alert.alert(
                    'Virhe',
                    'Ateriaa ei löytynyt tai sinulla ei ole oikeuksia muokata sitä.'
                )
            } else {
                Alert.alert(
                    'Virhe',
                    'Aterian päivämäärän päivitys epäonnistui: ' +
                        (error.response?.data?.message || error.message)
                )
            }
        }
    }

    const handleMealPress = (meal) => {
        setSelectedMeal(meal)
        setDetailModalVisible(true)
    }

    const toggleDateSelection = (date) => {
        setSelectedDates((prev) => {
            const isSelected = prev.some((d) => d.getTime() === date.getTime())
            if (isSelected) {
                return prev.filter((d) => d.getTime() !== date.getTime())
            } else {
                return [...prev, date]
            }
        })
    }

    const clearDateSelection = () => {
        setSelectedDates([])
    }

    const removeMealFromDate = async (meal, date) => {
        try {
            // Get current plannedEatingDates
            const currentDates = meal.plannedEatingDates || []

            // If meal has no plannedEatingDates, it's using plannedCookingDate
            if (currentDates.length === 0 && meal.plannedCookingDate) {
                const cookingDate = format(
                    new Date(meal.plannedCookingDate),
                    'yyyy-MM-dd'
                )
                const targetDate = format(date, 'yyyy-MM-dd')

                // If trying to remove the cooking date, set plannedEatingDates to empty array
                if (cookingDate === targetDate) {
                    await updateMealDates(meal._id, [])
                    return
                } else {
                    // Date doesn't match cooking date, nothing to remove
                    return
                }
            }

            // Remove the specific date from the array
            const updatedDates = currentDates.filter((dateStr) => {
                const mealDate = format(new Date(dateStr), 'yyyy-MM-dd')
                const targetDate = format(date, 'yyyy-MM-dd')
                return mealDate !== targetDate
            })

            // Update with remaining dates (or empty array if no dates left)
            await updateMealDates(meal._id, updatedDates)
        } catch (error) {
            console.error('Error removing meal from date:', error)
        }
    }

    const updateMealDates = async (mealId, newDates) => {
        try {
            const token = await storage.getItem('userToken')

            await axios.put(
                getServerUrl(`/meals/${mealId}`),
                {
                    plannedEatingDates: newDates,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            // Refresh the meal data
            await fetchMealData(dates, mealId)
        } catch (error) {
            console.error('Error updating meal dates:', error)
            if (Platform.OS === 'web') {
                alert('Virhe: Aterian päivitys epäonnistui')
            } else {
                Alert.alert('Virhe', 'Aterian päivitys epäonnistui')
            }
        }
    }

    const deleteMealCompletely = async (mealId) => {
        try {
            const token = await storage.getItem('userToken')

            await axios.delete(getServerUrl(`/meals/${mealId}`), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            // Refresh the meal data
            fetchMealData(dates)
        } catch (error) {
            console.error('Error deleting meal:', error)
            Alert.alert('Virhe', 'Aterian poistaminen epäonnistui')
        }
    }

    const handleCloseDetail = () => {
        setDetailModalVisible(false)
        setSelectedMeal(null)
    }

    const goToPreviousWeek = () => {
        setWeekOffset((prev) => prev - 1)
    }

    const goToNextWeek = () => {
        setWeekOffset((prev) => prev + 1)
    }

    const goToCurrentWeek = () => {
        setWeekOffset(0)
    }

    const handleLongPress = (meal, date) => {
        console.log('Opening move meal modal for:', meal.name)
        // Open modal to select target day
        setMealToMove(meal)
        setMoveFromDate(date)
        setMoveMealModalVisible(true)
    }

    const handleMoveMealToDay = async (targetDate) => {
        if (!mealToMove || !moveFromDate || !targetDate) {
            setMoveMealModalVisible(false)
            return
        }

        const fromDateStr = format(moveFromDate, 'yyyy-MM-dd')
        const toDateStr = format(targetDate, 'yyyy-MM-dd')

        // Don't do anything if same date
        if (fromDateStr === toDateStr) {
            setMoveMealModalVisible(false)
            setMealToMove(null)
            setMoveFromDate(null)
            return
        }

        try {
            // Get current planned eating dates
            const currentDates = mealToMove.plannedEatingDates || []

            // Remove the old date and add the new date
            const updatedDates = currentDates
                .filter((dateStr) => {
                    const mealDate = format(new Date(dateStr), 'yyyy-MM-dd')
                    return mealDate !== fromDateStr
                })
                .concat([
                    new Date(targetDate).toISOString().split('T')[0] +
                        'T00:00:00.000Z',
                ])

            const token = await storage.getItem('userToken')

            await axios.put(
                getServerUrl(`/meals/${mealToMove._id}`),
                {
                    plannedEatingDates: updatedDates,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            // Refresh the meal data
            await fetchMealData(dates)

            if (Platform.OS !== 'web') {
                Alert.alert('Valmis!', 'Ateria siirretty')
            }
        } catch (error) {
            console.error('Error moving meal:', error)
            if (Platform.OS === 'web') {
                alert('Virhe: Aterian siirtäminen epäonnistui')
            } else {
                Alert.alert('Virhe', 'Aterian siirtäminen epäonnistui')
            }
        } finally {
            setMoveMealModalVisible(false)
            setMealToMove(null)
            setMoveFromDate(null)
        }
    }

    // Handler for when a meal is dropped on a new day
    const handleMealDrop = async (meal, fromDate, toDate) => {
        console.log('🎯 handleMealDrop called:')
        console.log('  Meal:', meal.name)
        console.log('  From Date (Date object):', fromDate)
        console.log('  To Date (Date object):', toDate)

        const fromDateStr = format(fromDate, 'yyyy-MM-dd')
        const toDateStr = format(toDate, 'yyyy-MM-dd')

        console.log(
            '  From Date (formatted):',
            fromDateStr,
            format(fromDate, 'EEEE', { locale: fi })
        )
        console.log(
            '  To Date (formatted):',
            toDateStr,
            format(toDate, 'EEEE', { locale: fi })
        )

        // Don't do anything if dropped on the same date
        if (fromDateStr === toDateStr) {
            console.log('  ⚠️ Same date, canceling')
            return
        }
        console.log('  ✅ Different dates, proceeding with drop')

        try {
            // Get current planned eating dates
            const currentDates = meal.plannedEatingDates || []

            // Remove the old date and add the new date
            const updatedDates = currentDates
                .filter((dateStr) => {
                    const mealDate = format(new Date(dateStr), 'yyyy-MM-dd')
                    return mealDate !== fromDateStr
                })
                .concat([
                    new Date(toDate).toISOString().split('T')[0] +
                        'T00:00:00.000Z',
                ])

            const token = await storage.getItem('userToken')

            await axios.put(
                getServerUrl(`/meals/${meal._id}`),
                {
                    plannedEatingDates: updatedDates,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            // Refresh the meal data
            await fetchMealData(dates)
        } catch (error) {
            console.error('Error moving meal:', error)
            if (Platform.OS === 'web') {
                alert('Virhe: Aterian siirtäminen epäonnistui')
            } else {
                Alert.alert('Virhe', 'Aterian siirtäminen epäonnistui')
            }
        }
    }

    // Store day layouts with cumulative positions
    const [dayLayouts, setDayLayouts] = useState(new Map())
    const dayHeightsRef = useRef(new Map())

    const handleDayLayout = (dateKey, layout) => {
        // Store the height if provided
        if (dateKey && layout.height) {
            dayHeightsRef.current.set(dateKey, layout.height)
        }

        // Calculate cumulative Y position based on date order
        // onLayout positions are relative to FlatList content (after header)
        let cumulativeY = 0
        const updatedLayouts = new Map()

        dates.forEach((date) => {
            const key = format(date, 'yyyy-MM-dd')
            const height = dayHeightsRef.current.get(key) || 0

            if (height > 0) {
                updatedLayouts.set(key, {
                    y: cumulativeY,
                    height: height,
                })
                cumulativeY += height
            }
        })

        setDayLayouts(updatedLayouts)

        // Log when complete
        if (
            updatedLayouts.size === dates.length &&
            dateKey &&
            !dayLayouts.has(dateKey)
        ) {
            console.log(`📐 Day layouts calculated:`)
            updatedLayouts.forEach((val, key) => {
                console.log(
                    `  ${key}: y=${val.y}, h=${val.height}, end=${val.y + val.height}`
                )
            })
        }
    }

    // Drag gesture handlers
    const screenPositionsRef = useRef(new Map())

    const handleDragStart = (meal, date) => {
        console.log(
            'handleDragStart called for meal:',
            meal?.name,
            'on date:',
            format(date, 'yyyy-MM-dd')
        )

        // Measure screen positions of all days using refs
        screenPositionsRef.current = new Map()
        console.log('📍 Measuring screen positions at drag start:')

        dates.forEach((d, index) => {
            const dateKey = format(d, 'yyyy-MM-dd')
            const ref = dayRefs.current.get(dateKey)
            if (ref) {
                ref.measureInWindow((x, y, width, height) => {
                    screenPositionsRef.current.set(dateKey, {
                        y,
                        height,
                        index,
                    })
                    console.log(
                        `  [${index}] ${dateKey}: screen Y ${y} to ${y + height}`
                    )
                })
            }
        })

        try {
            // Store in both state (for UI) and ref (for reliable access)
            draggingMealRef.current = meal
            draggingFromDateRef.current = date
            setDraggingMeal(meal)
            setDraggingFromDate(date)
            setIsScrollEnabled(false) // Disable scrolling during drag
        } catch (error) {
            console.log('Error in handleDragStart:', error)
        }
    }

    const handleDragging = (absoluteY) => {
        try {
            if (screenPositionsRef.current.size === 0) {
                return
            }

            let targetDate = null
            let prevTargetDate = dropTargetDate

            // Use screen positions measured at drag start
            screenPositionsRef.current.forEach((position, dateKey) => {
                const { y, height } = position
                // Check if finger is within this day's screen bounds
                if (absoluteY >= y && absoluteY <= y + height) {
                    const foundDate = dates.find(
                        (d) => format(d, 'yyyy-MM-dd') === dateKey
                    )
                    if (foundDate) {
                        targetDate = foundDate
                    }
                }
            })

            // Only log when target changes
            if (
                targetDate &&
                (!prevTargetDate ||
                    format(targetDate, 'yyyy-MM-dd') !==
                        format(prevTargetDate, 'yyyy-MM-dd'))
            ) {
                const position = screenPositionsRef.current.get(
                    format(targetDate, 'yyyy-MM-dd')
                )
                console.log(
                    `✓ Over ${format(targetDate, 'yyyy-MM-dd')} (finger: ${absoluteY}, day: ${position.y}-${position.y + position.height})`
                )
            }

            setDropTargetDate(targetDate || null)
        } catch (error) {
            console.log('Error in handleDragging:', error)
        }
    }

    const handleDragPosition = (absoluteX, absoluteY) => {
        setDragPosition({ x: absoluteX, y: absoluteY })
    }

    const findDropTargetAtPosition = (absoluteY) => {
        console.log('=== DROP DETECTION ===')
        console.log('Finger at screen Y:', absoluteY)

        let targetDate = null

        // Use screen positions measured at drag start
        screenPositionsRef.current.forEach((position, dateKey) => {
            const { y, height, index } = position
            const matches = absoluteY >= y && absoluteY <= y + height

            console.log(
                `  [${index}] ${dateKey}: ${Math.round(y)}-${Math.round(y + height)} ${matches ? '✅' : '❌'}`
            )

            if (matches) {
                const foundDate = dates.find(
                    (d) => format(d, 'yyyy-MM-dd') === dateKey
                )
                if (foundDate) {
                    targetDate = foundDate
                }
            }
        })

        if (targetDate) {
            console.log(
                `\n✅ DETECTED: ${format(targetDate, 'yyyy-MM-dd EEEE', { locale: fi })}`
            )
            console.log(`❓ Was this the day you VISUALLY saw?`)

            // Find the index in the dates array
            const dateIndex = dates.findIndex(
                (d) =>
                    format(d, 'yyyy-MM-dd') === format(targetDate, 'yyyy-MM-dd')
            )
            console.log(`📍 Date index in array: ${dateIndex}`)
        } else {
            console.log(`\n❌ NO MATCH at screen Y=${absoluteY}`)
        }

        return targetDate
    }

    const handleDragEnd = (finalAbsoluteY) => {
        console.log('=== DROP STARTED ===')
        console.log('finalAbsoluteY:', finalAbsoluteY)
        try {
            // Use refs for reliable access to drag data
            const meal = draggingMealRef.current
            const fromDate = draggingFromDateRef.current

            // Find the drop target at the final position
            const finalDropTarget = finalAbsoluteY
                ? findDropTargetAtPosition(finalAbsoluteY)
                : dropTargetDate

            console.log('Drop data:', {
                mealName: meal?.name,
                fromDate: fromDate ? format(fromDate, 'yyyy-MM-dd') : null,
                toDate: finalDropTarget
                    ? format(finalDropTarget, 'yyyy-MM-dd')
                    : null,
                hasMeal: !!meal,
                hasFromDate: !!fromDate,
                hasToDate: !!finalDropTarget,
            })

            if (meal && finalDropTarget && fromDate) {
                const fromDateStr = format(fromDate, 'yyyy-MM-dd')
                const toDateStr = format(finalDropTarget, 'yyyy-MM-dd')

                if (fromDateStr === toDateStr) {
                    console.log('Same date, no move needed')
                } else {
                    console.log(
                        `Moving meal from ${fromDateStr} to ${toDateStr}`
                    )
                    handleMealDrop(meal, fromDate, finalDropTarget)
                }
            } else {
                console.log('Drop cancelled - missing required data')
            }

            // Clear refs and state
            draggingMealRef.current = null
            draggingFromDateRef.current = null
            screenPositionsRef.current.clear() // Clear screen positions
            setDraggingMeal(null)
            setDraggingFromDate(null)
            setDropTargetDate(null)
            setDragPosition({ x: 0, y: 0 })
            setIsScrollEnabled(true) // Re-enable scrolling
            console.log('🔓 Cleared drag state')
        } catch (error) {
            console.log('Error in handleDragEnd:', error)
            screenPositionsRef.current.clear() // Clear on error too
            setIsScrollEnabled(true) // Re-enable scrolling even on error
        }
    }

    const handleMealUpdate = async (mealId, updatedMeal) => {
        try {
            if (!mealId) {
                Alert.alert('Virhe', 'Aterian ID puuttuu')
                return
            }

            const token = await storage.getItem('userToken')

            // Prepare the meal data for API call
            const cleanedMeal = {
                name: updatedMeal.name,
                cookingTime: parseInt(updatedMeal.cookingTime) || 0,
                difficultyLevel:
                    updatedMeal.difficultyLevel?.toString() || 'easy',
                defaultRoles: Array.isArray(updatedMeal.defaultRoles)
                    ? updatedMeal.defaultRoles
                    : [updatedMeal.defaultRoles?.toString() || 'dinner'],
                plannedCookingDate: updatedMeal.plannedCookingDate,
                plannedEatingDates: updatedMeal.plannedEatingDates || [],
                recipe: updatedMeal.recipe || '',
                // Keep existing food items unchanged for now
                foodItems:
                    updatedMeal.foodItems?.map((item) => item._id || item) ||
                    [],
            }

            // Send API call to update the meal
            const response = await axios.put(
                getServerUrl(`/meals/${mealId}`),
                cleanedMeal,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (response.data.success) {
                // Update the meal in the local state with the response data
                setMealsByDate((prev) => {
                    const updated = { ...prev }
                    Object.keys(updated).forEach((dateKey) => {
                        updated[dateKey] = updated[dateKey].map((meal) =>
                            meal._id === mealId ? response.data.meal : meal
                        )
                    })
                    return updated
                })

                // Close the detail modal
                setDetailModalVisible(false)
                setSelectedMeal(null)
            } else {
                console.error('Failed to update meal:', response.data.message)
                Alert.alert('Virhe', 'Aterian päivittäminen epäonnistui')
            }
        } catch (error) {
            console.error('Error updating meal:', error)
            Alert.alert('Virhe', 'Aterian päivittäminen epäonnistui')
        }
    }

    const renderMealItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleMealPress(item)}
            style={styles.mealItem}
        >
            <Image
                source={{
                    uri: item.image?.url || PLACEHOLDER_IMAGE_URL,
                }}
                style={styles.mealImage}
                resizeMode="cover"
            />
            <View style={styles.mealTextContainer}>
                <CustomText style={styles.mealName}>{item.name}</CustomText>
                <CustomText style={styles.mealType}>
                    {item.defaultRoles?.[0]
                        ? mealTypeTranslations[item.defaultRoles[0]] ||
                          item.defaultRoles[0]
                        : 'Ateria'}
                </CustomText>
            </View>
        </TouchableOpacity>
    )

    const renderMealItemWithRemove = (meal, date) => {
        const isDraggingThis = draggingMeal && draggingMeal._id === meal._id
        return (
            <DraggableMealItem
                meal={meal}
                date={date}
                onDragStart={handleDragStart}
                onDragging={handleDragging}
                onDragEnd={handleDragEnd}
                onDragPosition={handleDragPosition}
            >
                <View style={styles.mealItemContainer}>
                    <View style={styles.mealItemInfo}>
                        <TouchableOpacity
                            onPress={() => handleMealPress(meal)}
                            style={styles.mealContentTouchable}
                            activeOpacity={0.7}
                        >
                            <Image
                                source={{
                                    uri:
                                        meal.image?.url ||
                                        PLACEHOLDER_IMAGE_URL,
                                }}
                                style={styles.mealImage}
                                resizeMode="cover"
                            />
                            <View style={styles.mealTextContainer}>
                                <CustomText style={styles.mealName}>
                                    {meal.name}
                                </CustomText>
                                <CustomText style={styles.mealType}>
                                    {meal.defaultRoles?.[0]
                                        ? mealTypeTranslations[
                                              meal.defaultRoles[0]
                                          ] || meal.defaultRoles[0]
                                        : 'Ateria'}
                                </CustomText>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.dragHandle}>
                            <MaterialIcons
                                name="drag-indicator"
                                size={24}
                                color="#999"
                            />
                        </View>
                    </View>
                    <View style={styles.mealItemActions}>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={(e) => {
                                e.stopPropagation()
                                removeMealFromDate(meal, date)
                            }}
                            activeOpacity={0.7}
                            hitSlop={{
                                top: 10,
                                bottom: 10,
                                left: 10,
                                right: 10,
                            }}
                        >
                            <MaterialIcons
                                name="delete"
                                size={20}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </DraggableMealItem>
        )
    }

    const renderDateSection = ({ item: date }) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const meals = mealsByDate[dateKey] || []
        const isToday =
            format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
        const isDropTarget =
            dropTargetDate && format(dropTargetDate, 'yyyy-MM-dd') === dateKey

        // Format the date with capitalized day name
        const formattedDate = format(date, 'EEEE d.M.yyyy', {
            locale: fi,
        })
        const capitalizedDate =
            formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

        return (
            <View
                ref={(ref) => {
                    if (ref) {
                        dayRefs.current.set(dateKey, ref)
                    }
                }}
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout
                    // Just pass the height, Y will be calculated cumulatively
                    handleDayLayout(dateKey, {
                        height: height,
                    })
                }}
                style={[
                    styles.dateSection,
                    isDropTarget && styles.dateSectionDropTarget,
                ]}
            >
                <View style={styles.dateHeaderContainer}>
                    <CustomText style={styles.dateHeader}>
                        {capitalizedDate}
                        {isToday ? ' (Tänään)' : ''}
                    </CustomText>
                    <Button
                        title="Lisää ateria"
                        onPress={() => handleAddMeal(date)}
                        style={styles.primaryButton}
                        textStyle={styles.buttonText}
                    />
                </View>

                {meals.length > 0 ? (
                    <View style={styles.mealsContainer}>
                        {meals.map((meal) => (
                            <View key={meal._id || meal.id}>
                                {renderMealItemWithRemove(meal, date)}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.noMealsContainer}>
                        <CustomText style={styles.noMealsText}>
                            Ei aterioita
                        </CustomText>
                    </View>
                )}
                {isDropTarget && draggingMeal && (
                    <View style={styles.dropIndicator}>
                        <MaterialIcons
                            name="arrow-downward"
                            size={32}
                            color="#fff"
                        />
                        <CustomText style={styles.dropIndicatorText}>
                            Pudota tänne
                        </CustomText>
                    </View>
                )}
            </View>
        )
    }

    const renderMealSelectModal = () => (
        <ResponsiveModal
            visible={isModalVisible}
            onClose={() => {
                setIsModalVisible(false)
                setSelectedDates([]) // Clear selected dates when modal closes
            }}
            title={`Valitse ateria ja päivät`}
            maxWidth={700}
        >
            {/* Date Selection Section */}
            <View style={styles.dateSelectionContainer}>
                <CustomText style={styles.dateSelectionTitle}>
                    Valitse päivät ({selectedDates.length} valittu)
                </CustomText>
                <View style={styles.dateGrid}>
                    {dates.map((date) => {
                        const isSelected = selectedDates.some(
                            (d) => d.getTime() === date.getTime()
                        )
                        return (
                            <TouchableOpacity
                                key={date.toISOString()}
                                style={[
                                    styles.dateButton,
                                    isSelected && styles.selectedDateButton,
                                ]}
                                onPress={() => toggleDateSelection(date)}
                            >
                                <CustomText
                                    style={[
                                        styles.dateButtonText,
                                        isSelected &&
                                            styles.selectedDateButtonText,
                                    ]}
                                >
                                    {format(date, 'd.M')}
                                </CustomText>
                            </TouchableOpacity>
                        )
                    })}
                </View>
                {selectedDates.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearDatesButton}
                        onPress={clearDateSelection}
                    >
                        <CustomText style={styles.clearDatesButtonText}>
                            Tyhjennä valinnat
                        </CustomText>
                    </TouchableOpacity>
                )}
            </View>

            {availableMeals.length === 0 ? (
                <View style={styles.noMealsContainer}>
                    <CustomText style={styles.noMealsText}>
                        Ei vapaita aterioita
                    </CustomText>
                </View>
            ) : (
                (() => {
                    const groupedMeals = groupMealsByCategory(availableMeals)
                    const sections = Object.entries(groupedMeals).map(
                        ([category, meals]) => ({
                            title: mealTypeTranslations[category] || category,
                            data: meals,
                        })
                    )

                    return (
                        <SectionList
                            sections={sections}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalMealItem,
                                        selectedDates.length === 0 &&
                                            styles.disabledMealItem,
                                    ]}
                                    onPress={() =>
                                        selectedDates.length > 0
                                            ? handleSelectMeal(item)
                                            : null
                                    }
                                    disabled={selectedDates.length === 0}
                                >
                                    <Image
                                        source={{
                                            uri:
                                                item.image?.url ||
                                                PLACEHOLDER_IMAGE_URL,
                                        }}
                                        style={styles.modalMealImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.modalMealTextContainer}>
                                        <CustomText
                                            style={styles.modalMealName}
                                        >
                                            {item.name}
                                        </CustomText>
                                        <CustomText
                                            style={styles.modalMealType}
                                        >
                                            {item.defaultRoles?.[0]
                                                ? mealTypeTranslations[
                                                      item.defaultRoles[0]
                                                  ] || item.defaultRoles[0]
                                                : 'Ateria'}
                                        </CustomText>
                                    </View>
                                </TouchableOpacity>
                            )}
                            renderSectionHeader={({ section: { title } }) => (
                                <View style={styles.sectionHeader}>
                                    <CustomText style={styles.sectionTitle}>
                                        {title}
                                    </CustomText>
                                </View>
                            )}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.modalList}
                        />
                    )
                })()
            )}
        </ResponsiveModal>
    )

    const renderMoveMealModal = () => (
        <ResponsiveModal
            visible={moveMealModalVisible}
            onClose={() => {
                setMoveMealModalVisible(false)
                setMealToMove(null)
                setMoveFromDate(null)
            }}
        >
            <View style={styles.modalContent}>
                <CustomText style={styles.modalTitle}>
                    Siirrä ateria toiselle päivälle
                </CustomText>
                {mealToMove && (
                    <View style={styles.moveFromInfo}>
                        <CustomText style={styles.moveFromText}>
                            Siirretään:{' '}
                            <CustomText style={styles.mealNameBold}>
                                {mealToMove.name}
                            </CustomText>
                        </CustomText>
                        {moveFromDate && (
                            <CustomText style={styles.moveFromText}>
                                Nykyinen päivä:{' '}
                                {format(moveFromDate, 'EEEE d.M.', {
                                    locale: fi,
                                })}
                            </CustomText>
                        )}
                    </View>
                )}
                <CustomText style={styles.selectDayTitle}>
                    Valitse uusi päivä:
                </CustomText>
                <View style={styles.daysList}>
                    {dates.map((date) => {
                        const isCurrentDay =
                            moveFromDate &&
                            format(date, 'yyyy-MM-dd') ===
                                format(moveFromDate, 'yyyy-MM-dd')
                        const dayName = format(date, 'EEEE d.M.', {
                            locale: fi,
                        })
                        const capitalizedDayName =
                            dayName.charAt(0).toUpperCase() + dayName.slice(1)

                        return (
                            <TouchableOpacity
                                key={format(date, 'yyyy-MM-dd')}
                                style={[
                                    styles.dayButton,
                                    isCurrentDay && styles.currentDayButton,
                                ]}
                                onPress={() => handleMoveMealToDay(date)}
                                disabled={isCurrentDay}
                            >
                                <CustomText
                                    style={[
                                        styles.dayButtonText,
                                        isCurrentDay &&
                                            styles.currentDayButtonText,
                                    ]}
                                >
                                    {capitalizedDayName}
                                </CustomText>
                                {isCurrentDay && (
                                    <CustomText style={styles.currentDayLabel}>
                                        (Nykyinen)
                                    </CustomText>
                                )}
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>
        </ResponsiveModal>
    )

    const renderHeader = () => {
        const isCurrentWeek = weekOffset === 0
        const weekLabel = isCurrentWeek
            ? 'Tämä viikko'
            : weekOffset < 0
              ? `${Math.abs(weekOffset)} viikko${Math.abs(weekOffset) > 1 ? 'a' : ''} sitten`
              : `${weekOffset} viikko${weekOffset > 1 ? 'n' : ''} päästä`

        return (
            <View style={styles.headerContainer}>
                <CustomText style={styles.introText}>
                    Täältä löydät viikon lukujärjestyksesi
                </CustomText>
                <CustomText style={styles.infoText}>
                    Luo lukujärjestys ja suunnittele viikon ohjelma ja ateriat.
                    Lisää ateriat lukujärjestykseen helpottaaksesi arkea.
                </CustomText>

                {/* Week Navigation */}
                <View style={styles.weekNavigationContainer}>
                    <TouchableOpacity
                        onPress={goToPreviousWeek}
                        style={styles.navButton}
                    >
                        <MaterialIcons
                            name="chevron-left"
                            size={28}
                            color="#333"
                        />
                    </TouchableOpacity>

                    <View style={styles.weekLabelContainer}>
                        <CustomText style={styles.weekLabel}>
                            {weekLabel}
                        </CustomText>
                        {!isCurrentWeek && (
                            <TouchableOpacity onPress={goToCurrentWeek}>
                                <CustomText style={styles.currentWeekLink}>
                                    Palaa nykyiseen viikkoon
                                </CustomText>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={goToNextWeek}
                        style={styles.navButton}
                    >
                        <MaterialIcons
                            name="chevron-right"
                            size={28}
                            color="#333"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const content = (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={dates}
                renderItem={renderDateSection}
                keyExtractor={(date) => format(date, 'yyyy-MM-dd')}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={true}
                scrollEnabled={isScrollEnabled}
                removeClippedSubviews={false}
                keyboardShouldPersistTaps="handled"
                onScroll={(event) => {
                    scrollOffsetRef.current = event.nativeEvent.contentOffset.y
                }}
                scrollEventThrottle={16}
            />
            {renderMealSelectModal()}
            {renderMoveMealModal()}
            <MealItemDetail
                meal={selectedMeal}
                visible={detailModalVisible}
                onClose={handleCloseDetail}
                onUpdate={handleMealUpdate}
            />
        </View>
    )

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {content}
            {draggingMeal && (
                <View
                    style={[
                        styles.dragOverlay,
                        {
                            left: dragPosition.x - 140,
                            top: dragPosition.y - 140,
                        },
                    ]}
                    pointerEvents="none"
                >
                    <View style={styles.mealItemContainer}>
                        <View style={styles.mealItemInfo}>
                            <Image
                                source={{
                                    uri:
                                        draggingMeal.image?.url ||
                                        PLACEHOLDER_IMAGE_URL,
                                }}
                                style={styles.mealImage}
                                resizeMode="cover"
                            />
                            <View style={styles.mealTextContainer}>
                                <CustomText style={styles.mealName}>
                                    {draggingMeal.name}
                                </CustomText>
                                <CustomText style={styles.mealType}>
                                    {draggingMeal.defaultRoles?.[0]
                                        ? mealTypeTranslations[
                                              draggingMeal.defaultRoles[0]
                                          ] || draggingMeal.defaultRoles[0]
                                        : 'Ateria'}
                                </CustomText>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        width: '100%',
        padding: 10,
    },
    list: {
        width: '100%',
        zIndex: 1,
        overflow: 'visible',
    },
    listContent: {
        paddingBottom: 20,
        overflow: 'visible',
    },
    headerContainer: {
        alignItems: 'flex-start',
        paddingTop: 20,
        paddingBottom: 10,
        paddingHorizontal: 15,
    },
    introText: {
        fontSize: 19,
        textAlign: 'left',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 17,
        textAlign: 'left',
        marginBottom: 20,
    },
    weekNavigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 10,
        marginBottom: 20,
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    navButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    weekLabelContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
    },
    weekLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    currentWeekLink: {
        fontSize: 14,
        color: '#9C86FC',
        marginTop: 4,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    dateSection: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 0,
        overflow: 'visible',
        position: 'relative',
    },
    dateHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        zIndex: 0,
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        flexWrap: 'wrap',
        color: '#333',
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 0,
        backgroundColor: '#9C86FC',
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    mealItem: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 8,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    mealImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12,
    },
    mealTextContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    mealName: {
        fontSize: 16,
        fontWeight: '500',
        flexWrap: 'wrap',
    },
    mealType: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        flexWrap: 'wrap',
    },
    noMealsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noMealsText: {
        fontSize: 16,
        color: '#666',
    },
    modalView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        width: '100%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    modalList: {
        padding: 15,
        flexGrow: 1,
    },
    sectionHeader: {
        backgroundColor: '#F0EBFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#9C86FC',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 0.5,
    },
    dateSelectionContainer: {
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 15,
    },
    dateSelectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    dateGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    dateButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    selectedDateButton: {
        backgroundColor: '#9C86FC',
        borderColor: '#9C86FC',
    },
    dateButtonText: {
        fontSize: 14,
        color: '#333',
    },
    selectedDateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    clearDatesButton: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    clearDatesButtonText: {
        fontSize: 12,
        color: '#9C86FC',
        textDecorationLine: 'underline',
    },
    disabledMealItem: {
        opacity: 0.5,
    },
    modalMealItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modalMealImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12,
    },
    modalMealTextContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    modalMealName: {
        fontSize: 16,
        fontWeight: '500',
    },
    modalMealType: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    mealItemContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 0,
        overflow: 'visible',
        position: 'relative',
    },
    mealItemInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealContentTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dragHandle: {
        padding: 10,
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        minWidth: 40,
        minHeight: 40,
    },
    mealItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    deleteButton: {
        backgroundColor: '#e0e0e0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    mealItemDragging: {
        opacity: 0.5,
        backgroundColor: '#e3f2fd',
        borderWidth: 2,
        borderColor: '#9C86FC',
        borderStyle: 'dashed',
    },
    dateSectionDropTarget: {
        backgroundColor: '#f0f8ff',
        borderWidth: 2,
        borderColor: '#9C86FC',
        borderStyle: 'dashed',
    },
    dropIndicator: {
        backgroundColor: '#9C86FC',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        zIndex: 1,
    },
    dropIndicatorText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 8,
    },
    dragModeHeader: {
        backgroundColor: '#9C86FC',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dragModeHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    dragModeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        flex: 1,
    },
    cancelDragButton: {
        padding: 5,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    moveFromInfo: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    moveFromText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    mealNameBold: {
        fontWeight: 'bold',
        color: '#333',
    },
    selectDayTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    daysList: {
        gap: 10,
    },
    dayButton: {
        backgroundColor: '#9C86FC',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    currentDayButton: {
        backgroundColor: '#e0e0e0',
        opacity: 0.6,
    },
    dayButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    currentDayButtonText: {
        color: '#999',
    },
    currentDayLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    mealsContainer: {
        overflow: 'visible',
        zIndex: 100,
        position: 'relative',
    },
    dragOverlay: {
        position: 'absolute',
        zIndex: 999999,
        elevation: 999,
        opacity: 0.9,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        width: 300,
    },
})

export default Table
