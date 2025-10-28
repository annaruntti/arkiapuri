import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import {
    addDays,
    addMonths,
    endOfMonth,
    format,
    getDate,
    getDaysInMonth,
    startOfMonth,
    subMonths,
} from 'date-fns'
import { fi } from 'date-fns/locale'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
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

const TableMonth = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [monthDates, setMonthDates] = useState([])
    const [mealsByDate, setMealsByDate] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedDates, setSelectedDates] = useState([])
    const [availableMeals, setAvailableMeals] = useState([])
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)

    // Generate calendar dates for the current month
    useEffect(() => {
        generateMonthDates(currentMonth)
    }, [currentMonth])

    const generateMonthDates = (month) => {
        const startDate = startOfMonth(month)
        const endDate = endOfMonth(month)
        const daysInMonth = getDaysInMonth(month)
        const dates = []

        for (let i = 0; i < daysInMonth; i++) {
            const date = addDays(startDate, i)
            dates.push(date)
        }

        setMonthDates(dates)
        fetchMealData(dates)
    }

    // Fetch meal data for the month dates
    const fetchMealData = async (datesToFetch, debugMealId = null) => {
        try {
            setIsLoading(true)
            const token = await storage.getItem('userToken')

            // Fetch all meals and filter by planned dates on frontend
            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                const allMeals = response.data.meals || []
                const mealsByDateObj = {}

                // Initialize all dates with empty arrays
                datesToFetch.forEach((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    mealsByDateObj[dateStr] = []
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
                            if (mealsByDateObj.hasOwnProperty(mealDate)) {
                                mealsByDateObj[mealDate].push(meal)
                            }
                        }
                    })
                })

                setMealsByDate(mealsByDateObj)
            }
        } catch (error) {
            console.error('Error fetching meal data:', error)
            Alert.alert('Virhe', 'Aterioiden haku epäonnistui')
        } finally {
            setIsLoading(false)
        }
    }

    const navigateMonth = (direction) => {
        const newMonth =
            direction === 'prev'
                ? subMonths(currentMonth, 1)
                : addMonths(currentMonth, 1)
        setCurrentMonth(newMonth)
    }

    const handleDatePress = async (date) => {
        try {
            setSelectedDate(date)
            setSelectedDates([date]) // Initialize with the clicked date
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                setAvailableMeals(response.data.meals || [])
                setIsModalVisible(true)
            }
        } catch (error) {
            console.error('Error fetching available meals:', error)
            Alert.alert('Virhe', 'Aterioiden haku epäonnistui')
        }
    }

    const handleMealSelection = async (meal) => {
        if (selectedDates.length === 0) return

        try {
            const token = await storage.getItem('userToken')
            const formattedDates = selectedDates.map(
                (date) =>
                    new Date(date).toISOString().split('T')[0] +
                    'T00:00:00.000Z'
            )

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

            if (response.data.success) {
                // Refresh the meal data for the current month
                generateMonthDates(currentMonth)
                setIsModalVisible(false)
                const dateText =
                    selectedDates.length === 1
                        ? format(selectedDates[0], 'd.M.yyyy')
                        : `${selectedDates.length} päivälle`
                Alert.alert('Onnistui', `Ateria lisätty ${dateText}`)
            }
        } catch (error) {
            console.error('Error adding meal to date:', error)
            Alert.alert('Virhe', 'Aterian lisääminen epäonnistui')
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
            await fetchMealData(monthDates, mealId)
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
            generateMonthDates(currentMonth)
        } catch (error) {
            console.error('Error deleting meal:', error)
            Alert.alert('Virhe', 'Aterian poistaminen epäonnistui')
        }
    }

    const handleCloseDetail = () => {
        setDetailModalVisible(false)
        setSelectedMeal(null)
    }

    const renderMealItemWithRemove = (meal, date) => (
        <View style={styles.mealItemContainer}>
            <View style={styles.imageAndButtonRow}>
                <Image
                    source={{
                        uri: meal.image?.url || PLACEHOLDER_IMAGE_URL,
                    }}
                    style={styles.mealImage}
                    resizeMode="cover"
                />
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                        e.stopPropagation()
                        removeMealFromDate(meal, date)
                    }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="delete" size={14} color="#666" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.mealNameContainer}
                onPress={() => handleMealPress(meal)}
            >
                <CustomText style={styles.mealText} numberOfLines={2}>
                    {meal.name}
                </CustomText>
            </TouchableOpacity>
        </View>
    )

    const handleMealUpdate = async (mealId, updatedMeal) => {
        try {
            if (!mealId) {
                Alert.alert('Virhe', 'Aterian ID puuttuu')
                return
            }

            const token = await storage.getItem('userToken')

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
                foodItems:
                    updatedMeal.foodItems?.map((item) => item._id || item) ||
                    [],
            }

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
                generateMonthDates(currentMonth)
                setDetailModalVisible(false)
                Alert.alert('Onnistui', 'Ateria päivitetty')
            }
        } catch (error) {
            console.error('Error updating meal:', error)
            Alert.alert('Virhe', 'Aterian päivittäminen epäonnistui')
        }
    }

    const renderCalendarDay = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const meals = mealsByDate[dateStr] || []
        const dayNumber = getDate(date)
        const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr

        return (
            <TouchableOpacity
                key={dateStr}
                style={[styles.dayContainer, isToday && styles.todayContainer]}
                onPress={() => handleDatePress(date)}
            >
                <View style={styles.dayHeader}>
                    <CustomText
                        style={[styles.dayNumber, isToday && styles.todayText]}
                    >
                        {dayNumber}
                    </CustomText>
                </View>
                <View style={styles.mealsContainer}>
                    {meals.slice(0, 2).map((meal, index) => (
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
            </TouchableOpacity>
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
            {/* Month Navigation */}
            <View style={styles.monthHeader}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigateMonth('prev')}
                >
                    <CustomText style={styles.navButtonText}>‹</CustomText>
                </TouchableOpacity>

                <CustomText style={styles.monthTitle}>
                    {format(currentMonth, 'MMMM yyyy', { locale: fi })}
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

            {/* Add Meal Modal */}
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
                        {monthDates.map((date) => {
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

                {(() => {
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
                                    key={item._id}
                                    style={[
                                        styles.mealOption,
                                        selectedDates.length === 0 &&
                                            styles.disabledMealItem,
                                    ]}
                                    onPress={() =>
                                        selectedDates.length > 0
                                            ? handleMealSelection(item)
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
                                        style={styles.mealOptionImage}
                                        resizeMode="cover"
                                    />
                                    <View
                                        style={styles.mealOptionTextContainer}
                                    >
                                        <CustomText
                                            style={styles.mealOptionName}
                                        >
                                            {item.name}
                                        </CustomText>
                                        <CustomText
                                            style={styles.mealOptionDetails}
                                        >
                                            {item.defaultRoles
                                                ?.map(
                                                    (role) =>
                                                        mealTypeTranslations[
                                                            role
                                                        ] || role
                                                )
                                                .join(', ')}
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
                            style={styles.mealsList}
                        />
                    )
                })()}
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
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    navButton: {
        padding: 10,
        minWidth: 40,
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#9C86FC',
    },
    monthTitle: {
        fontSize: 20,
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
        borderColor: '#9C86FC',
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
        color: '#9C86FC',
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
    mealsList: {
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
    mealOption: {
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
    mealOptionImage: {
        width: 50,
        height: 50,
        borderRadius: 6,
        marginRight: 12,
    },
    mealOptionTextContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    mealOptionName: {
        fontSize: 16,
        fontWeight: '500',
    },
    mealOptionDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    mealItemContainer: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 8,
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
    imageAndButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    mealNameContainer: {
        width: '100%',
    },
    deleteButton: {
        backgroundColor: '#e0e0e0',
        width: 24,
        height: 24,
        borderRadius: 12,
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
})

export default TableMonth
