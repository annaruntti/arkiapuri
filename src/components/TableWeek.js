import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Alert,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { addDays, format } from 'date-fns'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import {
    EATING_BEFORE_COOKING_MESSAGE,
    isAnyDateBeforeCooking,
} from '../utils/mealDates'
import {
    isSameCalendarDay,
    rebuildEatingDatesAfterMove,
} from '../utils/weekMealMove'
import useWeekMealAssign from '../hooks/useWeekMealAssign'
import { useMealCalendar } from '../hooks/useMealCalendar'
import useWeekMealDrag from '../hooks/useWeekMealDrag'
import { useLogin } from '../context/LoginProvider'
import { 
    removeMealFromDate as removeMealUtil,
    toggleDateSelection as toggleDateUtil,
    clearDateSelection as clearDateUtil,
} from '../utils/mealCalendarUtils'

import { getMealTypeText } from '../utils/mealUtils'
import Button from './Button'
import CustomText from './CustomText'
import { DESKTOP_SIDEBAR_WIDTH } from './DesktopNavigation'
import MealItemDetail from './MealItemDetail'
import WeekBottomNavigation from './WeekBottomNavigation'
import WeekDaySection from './WeekDaySection'
import WeekMealSelectModal from './WeekMealSelectModal'
import WeekMoveMealModal from './WeekMoveMealModal'
import { MEAL_PLACEHOLDER_IMAGE_URL } from '../constants/images'

const Table = ({ onRequireLogin }) => {
    const {
        width: windowWidth,
        isDesktop,
        containerMaxWidth,
        responsivePadding,
    } = useResponsiveDimensions()
    const contentPadding = isDesktop ? responsivePadding : 0
    const contentAreaWidth = isDesktop
        ? Math.max(0, windowWidth - DESKTOP_SIDEBAR_WIDTH)
        : windowWidth
    const weekColumnWidth = isDesktop
        ? Math.min(
              containerMaxWidth,
              Math.max(0, contentAreaWidth - contentPadding * 2)
          )
        : Math.min(containerMaxWidth, contentAreaWidth)
    const weekBarLeftBleed = contentPadding
    const weekBarRightBleed = isDesktop
        ? Math.max(0, contentAreaWidth - contentPadding - weekColumnWidth)
        : 0
    const { continueWithoutLogin } = useLogin()
    const [dates, setDates] = useState([])
    const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, -1 = previous, +1 = next
    const [moveMealModalVisible, setMoveMealModalVisible] = useState(false)
    const [mealToMove, setMealToMove] = useState(null)
    const [moveFromDate, setMoveFromDate] = useState(null)
    const [mealSelectView, setMealSelectView] = useState('select') // 'select' | 'create' | 'details'
    const [selectDetailMeal, setSelectDetailMeal] = useState(null)
    const [selectDetailsTitle, setSelectDetailsTitle] = useState('')
    const [createMealNestedTitle, setCreateMealNestedTitle] = useState(null)
    const mealDetailBackRef = useRef(null)
    const createMealBackRef = useRef(null)

    const {
        mealsByDate,
        isModalVisible,
        selectedDates,
        availableMeals,
        selectedMeal,
        detailModalVisible,
        setIsModalVisible,
        setSelectedDates,
        setDetailModalVisible,
        setAvailableMeals,
        fetchMealData: fetchMealsBase,
        updateMealDates: updateMealDatesBase,
        handleMealPress: handleMealPressBase,
        handleMealUpdate: handleMealUpdateBase,
    } = useMealCalendar({ onRequireLogin })

    const dayRefs = useRef(new Map())
    const flatListRef = useRef(null)
    const scrollOffsetRef = useRef(0)

    const handleSelectDetailsHeaderChange = useCallback(({ title }) => {
        setSelectDetailsTitle(title || '')
    }, [])

    const handleCreateMealHeaderChange = useCallback(({ title, isNested }) => {
        setCreateMealNestedTitle(
            isNested ? title || 'Valitse ostoslista' : null
        )
    }, [])

    const openSelectMealDetails = (meal) => {
        setSelectDetailMeal(meal)
        setSelectDetailsTitle(meal?.name || '')
        setMealSelectView('details')
    }

    const closeSelectMealDetails = () => {
        setMealSelectView('select')
        setSelectDetailMeal(null)
        setSelectDetailsTitle('')
    }

    // Wrapper functions that pass refresh callback to hook functions
    const fetchMealData = (datesToFetch) => {
        fetchMealsBase(datesToFetch)
    }

    const updateMealDates = (mealId, newDates) => {
        updateMealDatesBase(mealId, newDates, () => fetchMealData(dates))
    }

    const handleMealPress = (meal) => {
        handleMealPressBase(meal)
    }

    const handleMealUpdate = (mealId, updatedMeal) => {
        return handleMealUpdateBase(mealId, updatedMeal, () => fetchMealData(dates))
    }

    const removeMealFromDate = (meal, date) => {
        removeMealUtil(meal, date, updateMealDates)
    }

    const toggleDateSelection = (date) => {
        toggleDateUtil(date, selectedDates, setSelectedDates)
    }

    const clearDateSelection = () => {
        clearDateUtil(setSelectedDates)
    }

    const handleCloseDetail = () => {
        setDetailModalVisible(false)
    }

    const getAuthTokenOrPrompt = async (trigger = 'sync', action = null) => {
        const token = await storage.getItem('userToken')
        if (!token) {
            if (continueWithoutLogin) {
                return 'guest'
            }
            if (onRequireLogin) {
                onRequireLogin(trigger, action)
            }
            return null
        }
        return token
    }

    // Generate 7 days based on week offset
    useEffect(() => {
        const today = new Date()
        // Calculate the start of the week based on offset
        const startDate = addDays(today, weekOffset * 7)
        const weekDays = []

        for (let i = 0; i < 7; i++) {
            const date = addDays(startDate, i)
            weekDays.push(date)
        }

        setDates(weekDays)
        fetchMealData(weekDays)
    }, [weekOffset])

    // Opens the add-meal modal for a given date, optionally fetching available meals.
    // Called directly as the retry action when user chooses "Jatka ilman kirjautumista",
    const openAddMealModal = async (date, token = null) => {
        try {
            if (token && token !== 'guest') {
                const response = await axios.get(getServerUrl('/meals'), {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (response.data && response.data.meals) {
                    setAvailableMeals(response.data.meals)
                }
            } else {
                // Guest mode or no token: open with empty list
                setAvailableMeals([])
            }
            setSelectedDates([date])
            setIsModalVisible(true)
        } catch (error) {
            console.error('Error fetching meals:', error)
            Alert.alert('Virhe', 'Aterioiden hakeminen epäonnistui')
        }
    }

    const handleAddMeal = async (date) => {
        const token = await storage.getItem('userToken')
        if (!token) {
            if (onRequireLogin) {
                // Pass openAddMealModal as retry — it bypasses auth check entirely
                onRequireLogin('sync', () => openAddMealModal(date))
            }
            return
        }
        openAddMealModal(date, token)
    }

    const { handleSelectMeal } = useWeekMealAssign({
        selectedDates,
        dates,
        fetchMealData,
        setIsModalVisible,
        getAuthTokenOrPrompt,
    })

    const goToPreviousWeek = () => {
        setWeekOffset((prev) => prev - 1)
    }

    const goToNextWeek = () => {
        setWeekOffset((prev) => prev + 1)
    }

    const goToCurrentWeek = () => {
        setWeekOffset(0)
    }

    const handleMoveMealToDay = async (targetDate) => {
        if (!mealToMove || !moveFromDate || !targetDate) {
            setMoveMealModalVisible(false)
            return
        }

        if (isSameCalendarDay(moveFromDate, targetDate)) {
            setMoveMealModalVisible(false)
            setMealToMove(null)
            setMoveFromDate(null)
            return
        }

        if (
            isAnyDateBeforeCooking([targetDate], mealToMove.plannedCookingDate)
        ) {
            Alert.alert('Virhe', EATING_BEFORE_COOKING_MESSAGE)
            setMoveMealModalVisible(false)
            setMealToMove(null)
            setMoveFromDate(null)
            return
        }

        try {
            const updatedDates = rebuildEatingDatesAfterMove(
                mealToMove.plannedEatingDates,
                moveFromDate,
                targetDate
            )

            const token = await getAuthTokenOrPrompt('sync')
            if (!token) return

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
        if (isSameCalendarDay(fromDate, toDate)) {
            return
        }

        if (isAnyDateBeforeCooking([toDate], meal.plannedCookingDate)) {
            Alert.alert('Virhe', EATING_BEFORE_COOKING_MESSAGE)
            return
        }

        try {
            const updatedDates = rebuildEatingDatesAfterMove(
                meal.plannedEatingDates,
                fromDate,
                toDate
            )

            const token = await getAuthTokenOrPrompt('sync')
            if (!token) return

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

    const {
        draggingMeal,
        dropTargetDate,
        dragPosition,
        isScrollEnabled,
        handleDayLayout,
        handleDragStart,
        handleDragging,
        handleDragPosition,
        handleDragEnd,
    } = useWeekMealDrag({
        dates,
        dayRefs,
        onDrop: handleMealDrop,
    })

    const renderMealItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleMealPress(item)}
            style={styles.mealItem}
        >
            <Image
                source={{
                    uri: item.image?.url || MEAL_PLACEHOLDER_IMAGE_URL,
                }}
                style={styles.mealImage}
                resizeMode="cover"
            />
            <View style={styles.mealTextContainer}>
                <CustomText
                    style={styles.mealName}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {item.name}
                </CustomText>
                <CustomText
                    style={styles.mealType}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {getMealTypeText(item.defaultRoles)}
                </CustomText>
            </View>
        </TouchableOpacity>
    )

    const renderDateSection = ({ item: date }) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const isDropTarget =
            dropTargetDate && format(dropTargetDate, 'yyyy-MM-dd') === dateKey

        return (
            <WeekDaySection
                date={date}
                meals={mealsByDate[dateKey] || []}
                isDropTarget={Boolean(isDropTarget)}
                draggingMeal={draggingMeal}
                dayRefs={dayRefs}
                onDayLayout={handleDayLayout}
                onAddMeal={handleAddMeal}
                onMealPress={handleMealPress}
                onRemoveMeal={removeMealFromDate}
                onDragStart={handleDragStart}
                onDragging={handleDragging}
                onDragEnd={handleDragEnd}
                onDragPosition={handleDragPosition}
            />
        )
    }

    const handleMealSelectModalClose = () => {
        if (mealSelectView === 'details') {
            mealDetailBackRef.current?.()
            return
        }
        if (mealSelectView === 'create') {
            if (createMealBackRef.current?.()) return
            setCreateMealNestedTitle(null)
            setMealSelectView('select')
            return
        }
        setIsModalVisible(false)
        setSelectedDates([])
        setMealSelectView('select')
        setSelectDetailMeal(null)
        setSelectDetailsTitle('')
    }

    const renderHeader = () => {
        return (
            <View
                style={[
                    styles.headerContainer,
                    isDesktop && styles.headerContainerDesktop,
                ]}
            >
                <CustomText style={styles.introText}>
                    Lisää ateriat viikon päiville.
                </CustomText>
            </View>
        )
    }

    const renderWeekNavigation = () => (
        <WeekBottomNavigation
            weekOffset={weekOffset}
            onPrevious={goToPreviousWeek}
            onNext={goToNextWeek}
            onGoCurrent={goToCurrentWeek}
            leftBleed={weekBarLeftBleed}
            rightBleed={weekBarRightBleed}
            innerStyle={
                isDesktop
                    ? {
                          width: weekColumnWidth,
                          maxWidth: weekColumnWidth,
                          marginLeft: contentPadding,
                          alignSelf: 'flex-start',
                      }
                    : undefined
            }
        />
    )

    const content = (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={dates}
                renderItem={renderDateSection}
                keyExtractor={(date) => format(date, 'yyyy-MM-dd')}
                style={[styles.list, isDesktop && styles.listDesktop]}
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
            <WeekMealSelectModal
                visible={isModalVisible}
                view={mealSelectView}
                dates={dates}
                selectedDates={selectedDates}
                availableMeals={availableMeals}
                selectDetailMeal={selectDetailMeal}
                selectDetailsTitle={selectDetailsTitle}
                mealDetailBackRef={mealDetailBackRef}
                createMealBackRef={createMealBackRef}
                createMealNestedTitle={createMealNestedTitle}
                onCreateHeaderChange={handleCreateMealHeaderChange}
                onClose={handleMealSelectModalClose}
                onToggleDateSelection={toggleDateSelection}
                onClearSelection={clearDateSelection}
                onMealSelect={handleSelectMeal}
                onMealDetails={openSelectMealDetails}
                onCreateMeal={() => setMealSelectView('create')}
                onCreateSubmit={() => {
                    setCreateMealNestedTitle(null)
                    setMealSelectView('select')
                    fetchMealData(dates)
                }}
                onCloseDetails={closeSelectMealDetails}
                onMealUpdate={handleMealUpdate}
                onDetailsHeaderChange={handleSelectDetailsHeaderChange}
            />
            <WeekMoveMealModal
                visible={moveMealModalVisible}
                meal={mealToMove}
                fromDate={moveFromDate}
                dates={dates}
                onClose={() => {
                    setMoveMealModalVisible(false)
                    setMealToMove(null)
                    setMoveFromDate(null)
                }}
                onSelectDay={handleMoveMealToDay}
            />
            <MealItemDetail
                meal={selectedMeal}
                visible={detailModalVisible}
                onClose={handleCloseDetail}
                onUpdate={handleMealUpdate}
            />
        </View>
    )

    return (
        <GestureHandlerRootView style={styles.gestureRoot}>
            {content}
            {renderWeekNavigation()}
            {draggingMeal && (
                <View
                    style={[
                        styles.dragOverlay,
                        {
                            left: dragPosition.x - 140,
                            top: dragPosition.y - 140,
                            pointerEvents: 'none',
                        },
                    ]}
                >
                    <View style={styles.mealItemContainer}>
                        <View style={styles.mealItemInfo}>
                            <Image
                                source={{
                                    uri:
                                        draggingMeal.image?.url ||
                                        MEAL_PLACEHOLDER_IMAGE_URL,
                                }}
                                style={styles.mealImage}
                                resizeMode="cover"
                            />
                            <View style={styles.mealTextContainer}>
                                <CustomText
                                    style={styles.mealName}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {draggingMeal.name}
                                </CustomText>
                                <CustomText
                                    style={styles.mealType}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {getMealTypeText(draggingMeal.defaultRoles)}
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
    gestureRoot: {
        flex: 1,
        overflow: 'visible',
    },
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        width: '100%',
    },
    list: {
        width: '100%',
        zIndex: 1,
        overflow: 'visible',
        paddingHorizontal: 10,
    },
    listDesktop: {
        paddingHorizontal: 0,
    },
    listContent: {
        paddingBottom: 80,
        overflow: 'visible',
    },
    headerContainer: {
        alignItems: 'flex-start',
        paddingTop: 20,
        paddingBottom: 10,
        paddingHorizontal: 10,
    },
    headerContainerDesktop: {
        paddingHorizontal: 0,
    },
    introText: {
        fontSize: 21,
        textAlign: 'left',
        paddingTop: 5,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 19,
        textAlign: 'left',
        marginBottom: 20,
    },
    infoTextDesktop: {
        fontSize: 21,
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
        backgroundColor: '#ffffff',
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
        color: '#5844BB',
        marginTop: 4,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    dateSection: {
        backgroundColor: '#F4F0FF',
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
        width: 44,
        height: 44,
        borderRadius: 6,
        marginRight: 10,
        flexShrink: 0,
    },
    mealTextContainer: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        flexDirection: 'column',
    },
    mealName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
        ...(Platform.OS === 'web'
            ? {
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  hyphens: 'auto',
              }
            : {}),
    },
    mealType: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    mealItemContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
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
        minWidth: 0,
    },
    mealContentTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
        marginRight: 4,
    },
    dragHandle: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        minWidth: 40,
        minHeight: 40,
        flexShrink: 0,
    },
    mealItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        gap: 2,
    },
    deleteButton: {
        backgroundColor: '#e0e0e0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
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
        borderColor: '#5844BB',
        borderStyle: 'dashed',
    },
    dateSectionDropTarget: {
        backgroundColor: '#E8E0FF',
        borderWidth: 2,
        borderColor: '#5844BB',
        borderStyle: 'dashed',
    },
    dropIndicator: {
        backgroundColor: '#AE9CFC',
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
        backgroundColor: '#AE9CFC',
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
    mealsContainer: {
        overflow: 'visible',
        zIndex: 100,
        position: 'relative',
    },
    dragOverlay: {
        position: 'absolute',
        zIndex: 100,
        elevation: 100,
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
