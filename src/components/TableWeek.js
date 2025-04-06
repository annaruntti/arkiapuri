import {
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    Platform,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomText from './CustomText'
import { format, addDays } from 'date-fns'
import { fi } from 'date-fns/locale'
import axios from 'axios'
import storage from '../utils/storage'
import { getServerUrl } from '../utils/getServerUrl'
import Button from './Button'

const Table = ({ navigation }) => {
    const [dates, setDates] = useState([])
    const [mealsByDate, setMealsByDate] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    // Generate 7 days starting from today
    useEffect(() => {
        const today = new Date()
        const nextDays = []

        for (let i = 0; i < 7; i++) {
            const date = addDays(today, i)
            nextDays.push(date)
        }

        setDates(nextDays)
        fetchMealData(nextDays)
    }, [])

    // Fetch meal data for the dates
    const fetchMealData = async (datesToFetch) => {
        try {
            setIsLoading(true)
            const token = await storage.getItem('userToken')

            // Format dates for API request
            const formattedDates = datesToFetch.map((date) =>
                format(date, 'yyyy-MM-dd')
            )

            console.log('Fetching meals for dates:', formattedDates)

            const response = await axios.get(
                getServerUrl(`/meals?dates=${formattedDates.join(',')}`),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            console.log('API Response:', response.data)

            // Organize data by date
            const mealsByDate = {}

            // Initialize empty arrays for each date
            formattedDates.forEach((date) => {
                mealsByDate[date] = []
            })

            // Fill with actual data
            if (response.data && response.data.meals) {
                response.data.meals.forEach((meal) => {
                    // Use plannedCookingDate if date is missing
                    if (meal.plannedCookingDate || meal.date) {
                        const dateField = meal.plannedCookingDate || meal.date
                        const date = dateField.split('T')[0] // Get the date part
                        console.log(
                            `Processing meal: ${meal.name} for date: ${date}`
                        )

                        if (mealsByDate[date]) {
                            mealsByDate[date].push(meal)
                        } else {
                            // For dates that might not be in our initial array but have meals
                            console.log(`Adding date ${date} to mealsByDate`)
                            mealsByDate[date] = [meal]
                        }
                    } else {
                        // Add the first meal (Muffinssit) to today's date if it has no date
                        if (meal.name === 'Muffinssit') {
                            const today = format(new Date(), 'yyyy-MM-dd')
                            console.log(
                                `Adding Muffinssit to today's date: ${today}`
                            )
                            if (mealsByDate[today]) {
                                mealsByDate[today].push(meal)
                            }
                        } else {
                            console.warn('Meal missing date:', meal)
                        }
                    }
                })
            }

            console.log('Processed meal data by date:', mealsByDate)
            setMealsByDate(mealsByDate)
        } catch (error) {
            console.error('Error fetching meal data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const renderMealItem = ({ item }) => (
        <TouchableOpacity
            onPress={() =>
                navigation.navigate('MealDetail', { mealId: item._id })
            }
            style={styles.mealItem}
        >
            <CustomText style={styles.mealName}>{item.name}</CustomText>
            <CustomText style={styles.mealType}>
                {item.defaultRoles?.[0] || 'Ateria'}
            </CustomText>
        </TouchableOpacity>
    )

    const renderDateSection = ({ item: date }) => {
        const meals = mealsByDate[format(date, 'yyyy-MM-dd')] || []
        const isToday =
            format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

        return (
            <View style={styles.dateSection}>
                <View style={styles.dateHeaderContainer}>
                    <CustomText style={styles.dateHeader}>
                        {format(date, 'EEEE d.M.yyyy', { locale: fi })}
                        {isToday ? ' (Tänään)' : ''}
                    </CustomText>
                    <Button
                        title="Lisää ateria"
                        onPress={() =>
                            navigation.navigate('AddMeal', {
                                selectedDate: date,
                            })
                        }
                        style={styles.addMealButton}
                    />
                </View>

                {meals.length > 0 ? (
                    <FlatList
                        data={meals}
                        renderItem={renderMealItem}
                        keyExtractor={(item) => item._id || item.id}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={styles.noMealsContainer}>
                        <CustomText style={styles.noMealsText}>
                            Ei aterioita
                        </CustomText>
                    </View>
                )}
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={dates}
                renderItem={renderDateSection}
                keyExtractor={(date) => format(date, 'yyyy-MM-dd')}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        width: '100%',
    },
    contentContainer: {
        padding: 8,
        width: '100%',
    },
    dateSection: {
        marginBottom: 20,
        width: '100%',
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    dateHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        flexWrap: 'wrap',
    },
    addMealButton: {
        backgroundColor: '#9C86FC',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 25,
        marginLeft: 10,
        minWidth: 100,
    },
    mealItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 8,
        width: '100%',
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
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    noMealsText: {
        color: '#666',
    },
})

export default Table
