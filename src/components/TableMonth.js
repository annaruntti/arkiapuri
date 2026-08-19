import { useEffect, useState } from 'react'
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import {
    addDays,
    addMonths,
    format,
    getDate,
    getDaysInMonth,
    startOfMonth,
    subMonths,
} from 'date-fns'
import { fi } from 'date-fns/locale'
import CustomText from './CustomText'
import DateSelector from './DateSelector'
import FormAddMeal from './FormAddMeal'
import MealItemDetail from './MealItemDetail'
import MealSelectionList, { PLACEHOLDER_IMAGE_URL } from './MealSelectionList'
import ResponsiveModal from './ResponsiveModal'
import { useMealCalendar } from '../hooks/useMealCalendar'
import { 
    removeMealFromDate as removeMealUtil,
    toggleDateSelection as toggleDateUtil,
    clearDateSelection as clearDateUtil,
} from '../utils/mealCalendarUtils'

const TableMonth = ({ onRequireLogin }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [monthDates, setMonthDates] = useState([])
    const [mealSelectView, setMealSelectView] = useState('select') // 'select' | 'create'

    const {
        mealsByDate,
        isLoading,
        isModalVisible,
        selectedDates,
        availableMeals,
        selectedMeal,
        detailModalVisible,
        setIsModalVisible,
        setSelectedDates,
        setDetailModalVisible,
        fetchMealData: fetchMealsBase,
        handleDatePress: handleDatePressBase,
        handleMealPress,
        handleMealSelection: handleMealSelectionBase,
        updateMealDates: updateMealDatesBase,
        handleMealUpdate: handleMealUpdateBase,
    } = useMealCalendar({ onRequireLogin })

    // Generate calendar dates for the current month
    useEffect(() => {
        generateMonthDates(currentMonth)
    }, [currentMonth])

    const generateMonthDates = (month) => {
        const startDate = startOfMonth(month)
        const daysInMonth = getDaysInMonth(month)
        const dates = []

        for (let i = 0; i < daysInMonth; i++) {
            const date = addDays(startDate, i)
            dates.push(date)
        }

        setMonthDates(dates)
        fetchMealsBase(dates)
    }

    const navigateMonth = (direction) => {
        const newMonth =
            direction === 'prev'
                ? subMonths(currentMonth, 1)
                : addMonths(currentMonth, 1)
        setCurrentMonth(newMonth)
    }

    const handleDatePress = (date) => {
        handleDatePressBase(date)
    }

    const handleMealSelection = (meal) => {
        handleMealSelectionBase(meal, () => generateMonthDates(currentMonth))
    }

    const updateMealDates = (mealId, newDates) => {
        updateMealDatesBase(mealId, newDates, () => generateMonthDates(currentMonth))
    }

    const handleMealUpdate = (mealId, updatedMeal) => {
        return handleMealUpdateBase(mealId, updatedMeal, () => generateMonthDates(currentMonth))
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

    const renderMealItemWithRemove = (meal, date) => (
        <View style={styles.mealItemContainer}>
            <View style={styles.closeButtonRow}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                        e.stopPropagation()
                        removeMealFromDate(meal, date)
                    }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="close" size={12} color="#666" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.imageAndNameRow}
                onPress={(e) => {
                    e.stopPropagation()
                    handleMealPress(meal)
                }}
                activeOpacity={0.7}
            >
                <Image
                    source={{
                        uri: meal.image?.url || PLACEHOLDER_IMAGE_URL,
                    }}
                    style={styles.mealImage}
                    resizeMode="cover"
                />
                <View style={styles.mealNameContainer}>
                    <CustomText style={styles.mealText} numberOfLines={2}>
                        {meal.name}
                    </CustomText>
                </View>
            </TouchableOpacity>
        </View>
    )

    const renderCalendarDay = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const meals = mealsByDate[dateStr] || []
        const dayNumber = getDate(date)
        const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr

        return (
            <View
                key={dateStr}
                style={[styles.dayContainer, isToday && styles.todayContainer]}
            >
                <TouchableOpacity
                    style={styles.dayHeader}
                    onPress={() => handleDatePress(date)}
                    activeOpacity={0.7}
                >
                    <CustomText
                        style={[styles.dayNumber, isToday && styles.todayText]}
                    >
                        {dayNumber}
                    </CustomText>
                </TouchableOpacity>
                <View style={styles.mealsContainer}>
                    {meals.slice(0, 2).map((meal) => (
                        <View key={meal._id}>
                            {renderMealItemWithRemove(meal, date)}
                        </View>
                    ))}
                    {meals.length > 2 && (
                        <TouchableOpacity
                            style={styles.moreMealsButton}
                            onPress={() => handleDatePress(date)}
                        >
                            <CustomText style={styles.moreMeals}>
                                +{meals.length - 2} lisää
                            </CustomText>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }

    const renderWeekDays = () => {
        const weekDays = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']
        return (
            <View style={styles.weekDaysContainer}>
                {weekDays.map((day) => (
                    <View key={day} style={styles.weekDayHeader}>
                        <CustomText style={styles.weekDayText}>
                            {day}
                        </CustomText>
                    </View>
                ))}
            </View>
        )
    }

    const renderCalendarGrid = () => {
        const weeks = []
        let currentWeek = []

        // Add empty cells for days before the first day of the month
        const firstDayOfMonth = startOfMonth(currentMonth)
        const startDay = (firstDayOfMonth.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0

        for (let i = 0; i < startDay; i++) {
            currentWeek.push(
                <View key={`empty-${i}`} style={styles.emptyDay} />
            )
        }

        // Add all days of the month
        monthDates.forEach((date, index) => {
            currentWeek.push(renderCalendarDay(date))

            // If we have 7 days or it's the last day, start a new week
            if (currentWeek.length === 7 || index === monthDates.length - 1) {
                // Fill remaining empty cells if needed
                while (currentWeek.length < 7) {
                    currentWeek.push(
                        <View
                            key={`empty-end-${currentWeek.length}`}
                            style={styles.emptyDay}
                        />
                    )
                }

                weeks.push(
                    <View key={weeks.length} style={styles.weekRow}>
                        {currentWeek}
                    </View>
                )
                currentWeek = []
            }
        })

        return weeks
    }

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#5844BB" />
                </View>
            )}
            {/* Month Navigation */}
            <View style={styles.monthHeader}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateMonth('prev')}
                >
                    <CustomText style={styles.navButtonText}>‹</CustomText>
                </TouchableOpacity>

                <CustomText style={styles.monthTitle}>
                    {format(currentMonth, 'LLLL yyyy', { locale: fi })
                        .charAt(0)
                        .toUpperCase() +
                        format(currentMonth, 'LLLL yyyy', { locale: fi }).slice(
                            1
                        )}
                </CustomText>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateMonth('next')}
                >
                    <CustomText style={styles.navButtonText}>›</CustomText>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.calendarContainer}>
                {renderWeekDays()}
                <View style={styles.calendarGrid}>{renderCalendarGrid()}</View>
            </ScrollView>

            {/* Meal select / create modal */}
            <ResponsiveModal
                visible={isModalVisible}
                onClose={() => {
                    if (mealSelectView === 'create') {
                        setMealSelectView('select')
                        return
                    }
                    setIsModalVisible(false)
                    setSelectedDates([])
                    setMealSelectView('select')
                }}
                title={
                    mealSelectView === 'create'
                        ? 'Luo uusi ateria'
                        : 'Valitse ateria ja päivät'
                }
                showBackButton={mealSelectView === 'create'}
                maxWidth={640}
            >
                {mealSelectView === 'create' ? (
                    <FormAddMeal
                        onSubmit={() => {
                            setMealSelectView('select')
                            generateMonthDates(currentMonth)
                        }}
                    />
                ) : (
                    <>
                        <DateSelector
                            dates={monthDates}
                            selectedDates={selectedDates}
                            onToggleDateSelection={toggleDateSelection}
                            onClearSelection={clearDateSelection}
                        />

                        <MealSelectionList
                            availableMeals={availableMeals}
                            selectedDates={selectedDates}
                            onMealSelect={handleMealSelection}
                            onCreateMeal={() => setMealSelectView('create')}
                            showAllRoles={true}
                        />
                    </>
                )}
            </ResponsiveModal>

            {/* Meal Detail Modal */}
            <MealItemDetail
                meal={selectedMeal}
                visible={detailModalVisible}
                onClose={handleCloseDetail}
                onUpdate={handleMealUpdate}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    navButton: {
        padding: 6,
        minWidth: 40,
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5844BB',
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    calendarContainer: {
        flex: 1,
    },
    weekDaysContainer: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        paddingVertical: 10,
    },
    weekDayHeader: {
        flex: 1,
        alignItems: 'center',
    },
    weekDayText: {
        fontWeight: 'bold',
        color: '#666',
    },
    calendarGrid: {
        flex: 1,
    },
    weekRow: {
        flexDirection: 'row',
        minHeight: 100,
    },
    dayContainer: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: '#eee',
        padding: 5,
        minHeight: 100,
    },
    todayContainer: {
        backgroundColor: '#f0f8ff',
        borderColor: '#5844BB',
    },
    emptyDay: {
        flex: 1,
        borderWidth: 0.5,
        borderColor: '#eee',
        backgroundColor: '#f8f9fa',
    },
    dayHeader: {
        marginBottom: 5,
    },
    dayNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    todayText: {
        color: '#5844BB',
    },
    mealsContainer: {
        flex: 1,
    },
    mealItem: {
        backgroundColor: '#e3f2fd',
        borderRadius: 4,
        padding: 6,
        marginBottom: 3,
        minHeight: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealImage: {
        width: 20,
        height: 20,
        borderRadius: 2,
        marginRight: 6,
    },
    mealText: {
        fontSize: 11,
        color: '#1976d2',
        fontWeight: '500',
        lineHeight: 13,
    },
    moreMealsButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        padding: 4,
        marginTop: 2,
    },
    moreMeals: {
        fontSize: 10,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    mealItemContainer: {
        backgroundColor: '#fff',
        padding: 4,
        borderRadius: 6,
        marginBottom: 4,
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    closeButtonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 2,
        minHeight: 16,
    },
    imageAndNameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 4,
        paddingBottom: 4,
    },
    mealNameContainer: {
        flex: 1,
        marginLeft: 6,
    },
    deleteButton: {
        backgroundColor: 'transparent',
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
})

export default TableMonth
