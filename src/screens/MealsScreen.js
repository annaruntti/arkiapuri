import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    StyleSheet,
    FlatList,
    Pressable,
    Alert,
    TouchableOpacity,
    Platform,
} from 'react-native'
import CustomText from '../components/CustomText'
import Button from '../components/Button'
import AddMealForm from '../components/FormAddMeal'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import MealItemDetail from '../components/MealItemDetail'
import { getDifficultyText } from '../utils/mealUtils'
import CustomModal from '../components/CustomModal'

const MealsScreen = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedMeal, setSelectedMeal] = useState(null)
    const [detailModalVisible, setDetailModalVisible] = useState(false)

    const fetchMeals = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/meals'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.data.success) {
                setMeals(response.data.meals)
            }
        } catch (error) {
            console.error('Error fetching meals:', error)
            Alert.alert('Virhe', 'Aterioiden haku epäonnistui')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMeals()
    }, [])

    const handleAddMeal = async (newMeal) => {
        try {
            // Add the new meal to the existing meals array
            setMeals((prevMeals) => [...prevMeals, newMeal])
            setModalVisible(false)
        } catch (error) {
            console.error('Error updating meals list:', error)
            Alert.alert('Virhe', 'Aterian lisääminen listaan epäonnistui')
        }
    }

    const handleDeleteMeal = async (mealId) => {
        console.log('handleDeleteMeal called with ID:', mealId)
        const token = await storage.getItem('userToken')
        console.log('Got token:', token ? 'yes' : 'no')

        if (Platform.OS === 'web') {
            // For web, skipping the Alert and directly make the API call
            try {
                setLoading(true)
                const response = await axios.delete(
                    getServerUrl(`/meals/${mealId}`),
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                console.log('Delete API response:', response.data)

                if (response.data.success) {
                    setMeals((prevMeals) =>
                        prevMeals.filter((meal) => meal._id !== mealId)
                    )
                    alert('Ateria poistettu') // window.alert for web
                } else {
                    alert('Aterian poistaminen epäonnistui')
                }
            } catch (error) {
                console.error('Error in delete API call:', error)
                alert(
                    'Aterian poistaminen epäonnistui: ' +
                        (error.response?.data?.message || error.message)
                )
            } finally {
                setLoading(false)
            }
        } else {
            // For mobile, Alert.alert
            Alert.alert(
                'Poista ateria',
                'Haluatko varmasti poistaa tämän aterian?',
                [
                    {
                        text: 'Peruuta',
                        style: 'cancel',
                    },
                    {
                        text: 'Poista',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                setLoading(true)
                                const response = await axios.delete(
                                    getServerUrl(`/meals/${mealId}`),
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                )
                                if (response.data.success) {
                                    setMeals((prevMeals) =>
                                        prevMeals.filter(
                                            (meal) => meal._id !== mealId
                                        )
                                    )
                                    Alert.alert('Onnistui', 'Ateria poistettu')
                                } else {
                                    Alert.alert(
                                        'Virhe',
                                        'Aterian poistaminen epäonnistui'
                                    )
                                }
                            } catch (error) {
                                console.error(
                                    'Error in delete API call:',
                                    error
                                )
                                Alert.alert(
                                    'Virhe',
                                    'Aterian poistaminen epäonnistui: ' +
                                        (error.response?.data?.message ||
                                            error.message)
                                )
                            } finally {
                                setLoading(false)
                            }
                        },
                    },
                ]
            )
        }
    }

    const DeleteButton = ({ onPress }) => (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={onPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <MaterialIcons name="delete" size={20} color="#666" />
        </TouchableOpacity>
    )

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                style={styles.itemInfo}
                onPress={() => handleMealPress(item)}
            >
                <CustomText style={styles.itemName}>{item.name}</CustomText>
                <CustomText style={styles.itemDetails}>
                    {getDifficultyText(item.difficultyLevel)} •{' '}
                    {item.cookingTime} min
                </CustomText>
            </TouchableOpacity>
            <View style={styles.itemActions}>
                <DeleteButton
                    onPress={() => {
                        console.log('Delete button pressed for meal:', item._id)
                        handleDeleteMeal(item._id)
                    }}
                />
            </View>
        </View>
    )

    useEffect(() => {
        if (selectedMeal) {
            console.log(selectedMeal.foodItems, 'fooditems')
        }
    }, [selectedMeal])

    const handleMealPress = (meal) => {
        setSelectedMeal(meal)
        setDetailModalVisible(true)
    }

    const handleCloseDetail = () => {
        setDetailModalVisible(false)
        setSelectedMeal(null)
    }

    return (
        <View style={styles.container}>
            <CustomModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title="Lisää uusi ateria"
            >
                <View style={styles.modalBody}>
                    <AddMealForm
                        onSubmit={handleAddMeal}
                        onClose={() => setModalVisible(false)}
                    />
                </View>
            </CustomModal>

            <CustomText style={styles.introText}>
                Selaa ja hallinnoi aterioitasi. Voit lisätä uusia aterioita ja
                muokata olemassa olevia.
            </CustomText>

            <View style={styles.buttonContainer}>
                <Button
                    title="Lisää ateria"
                    onPress={() => setModalVisible(true)}
                    style={styles.primaryButton}
                />
            </View>

            <FlatList
                data={meals}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                refreshing={loading}
                onRefresh={fetchMeals}
                ListEmptyComponent={
                    !loading && (
                        <CustomText style={styles.emptyText}>
                            Ei vielä aterioita. Lisää ensimmäinen ateria
                            painamalla "Lisää ateria" -nappia.
                        </CustomText>
                    )
                }
            />

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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    introText: {
        fontSize: 17,
        textAlign: 'center',
        padding: 20,
    },
    itemContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemInfo: {
        flex: 1,
        flexDirection: 'column',
        marginRight: 10,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemDetails: {
        color: '#666',
        fontSize: 14,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
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
    list: {
        width: '100%',
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginBottom: 20,
    },
    modalBody: {
        flex: 1,
        padding: 15,
    },
})

export default MealsScreen
