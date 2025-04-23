import {
    StyleSheet,
    FlatList,
    View,
    TouchableOpacity,
    Platform,
    Alert,
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import CustomText from './CustomText'
import { format, addDays } from 'date-fns'
import { fi } from 'date-fns/locale'
import axios from 'axios'
import storage from '../utils/storage'
import { getServerUrl } from '../utils/getServerUrl'
import Button from './Button'
import MealItemDetail from './MealItemDetail'
import CustomModal from './CustomModal'

const mealTypeTranslations = {
    breakfast: 'Aamiainen',
    lunch: 'Lounas',
    snack: 'Välipala',
    dinner: 'Päivällinen',
    supper: 'Iltapala',
    dessert: 'Jälkiruoka',
    other: 'Muu',
}

const Table = () => {
    const navigation = useNavigation()
    const [dates, setDates] = useState([])
    const [mealsByDate, setMealsByDate] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [availableMeals, setAvailableMeals] = useState([])
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)

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
                            // For dates that might not be in initial array but have meals
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

    const handleAddMeal = async (date) => {
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            console.log('All meals from API:', response.data.meals)

            if (response.data && response.data.meals) {
                // Show all meals for now, remove the filter temporarily
                const availableMeals = response.data.meals
                console.log('Available meals to show:', availableMeals)
                setAvailableMeals(availableMeals)
                setSelectedDate(date)
                setIsModalVisible(true)
            }
        } catch (error) {
            console.error('Error fetching meals:', error)
            Alert.alert('Virhe', 'Aterioiden hakeminen epäonnistui')
        }
    }

    const handleSelectMeal = async (meal) => {
        try {
            const token = await storage.getItem('userToken')
            const formattedDate = new Date(selectedDate).toISOString()

            console.log('Updating meal:', {
                mealId: meal.id,
                formattedDate,
                url: getServerUrl(`/meals/${meal.id}`),
            })

            // Use PUT with the meal.id
            const response = await axios.put(
                getServerUrl(`/meals/${meal.id}`),
                {
                    plannedCookingDate: formattedDate,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            console.log('Update response:', response.data)

            // Refresh the meal data
            fetchMealData(dates)
            setIsModalVisible(false)

            // Show success message
            Alert.alert(
                'Onnistui',
                'Ateria lisätty päivälle ' + format(selectedDate, 'd.M.yyyy')
            )
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

    const handleCloseDetail = () => {
        setDetailModalVisible(false)
        setSelectedMeal(null)
    }

    const renderMealItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleMealPress(item)}
            style={styles.mealItem}
        >
            <CustomText style={styles.mealName}>{item.name}</CustomText>
            <CustomText style={styles.mealType}>
                {item.defaultRoles?.[0]
                    ? mealTypeTranslations[item.defaultRoles[0]] ||
                      item.defaultRoles[0]
                    : 'Ateria'}
            </CustomText>
        </TouchableOpacity>
    )

    const renderDateSection = ({ item: date }) => {
        const meals = mealsByDate[format(date, 'yyyy-MM-dd')] || []
        const isToday =
            format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

        // Format the date with capitalized day name
        const formattedDate = format(date, 'EEEE d.M.yyyy', { locale: fi })
        const capitalizedDate =
            formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

        return (
            <View style={styles.dateSection}>
                <View style={styles.dateHeaderContainer}>
                    <CustomText style={styles.dateHeader}>
                        {capitalizedDate}
                        {isToday ? ' (Tänään)' : ''}
                    </CustomText>
                    <Button
                        title="Lisää ateria"
                        onPress={() => handleAddMeal(date)}
                        style={styles.addMealButton}
                        textStyle={styles.addMealButtonText}
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

    const renderMealSelectModal = () => (
        <CustomModal
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            title={`Valitse ateria päivälle ${selectedDate ? format(selectedDate, 'd.M.yyyy') : ''}`}
        >
            {availableMeals.length === 0 ? (
                <View style={styles.noMealsContainer}>
                    <CustomText style={styles.noMealsText}>
                        Ei vapaita aterioita
                    </CustomText>
                </View>
            ) : (
                <FlatList
                    data={availableMeals}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.modalMealItem}
                            onPress={() => handleSelectMeal(item)}
                        >
                            <CustomText style={styles.modalMealName}>
                                {item.name}
                            </CustomText>
                            <CustomText style={styles.modalMealType}>
                                {item.defaultRoles?.[0]
                                    ? mealTypeTranslations[
                                          item.defaultRoles[0]
                                      ] || item.defaultRoles[0]
                                    : 'Ateria'}
                            </CustomText>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.modalList}
                />
            )}
        </CustomModal>
    )

    return (
        <View style={styles.container}>
            <FlatList
                data={dates}
                renderItem={renderDateSection}
                keyExtractor={(date) => format(date, 'yyyy-MM-dd')}
                contentContainerStyle={styles.contentContainer}
            />
            {renderMealSelectModal()}
            <MealItemDetail
                meal={selectedMeal}
                visible={detailModalVisible}
                onClose={handleCloseDetail}
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
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 15,
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
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 25,
        marginLeft: 10,
        alignItems: 'center',
    },
    addMealButtonText: {
        color: 'black',
        fontWeight: 'bold',
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
    modalMealItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
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
})

export default Table
