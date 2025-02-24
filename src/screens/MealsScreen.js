import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    Modal,
    FlatList,
    Pressable,
    Alert,
} from 'react-native'
import CustomText from '../components/CustomText'
import Button from '../components/Button'
import AddMealForm from '../components/FormAddMeal'
import { AntDesign } from '@expo/vector-icons'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

const MealsScreen = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [meals, setMeals] = useState([])
    const [loading, setLoading] = useState(true)

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
            // Close the modal
            setModalVisible(false)
        } catch (error) {
            console.error('Error updating meals list:', error)
            Alert.alert('Virhe', 'Aterian lisääminen listaan epäonnistui')
        }
    }

    const renderMealItem = ({ item }) => (
        <View style={styles.mealItem}>
            <CustomText style={styles.mealTitle}>{item.name}</CustomText>
            <CustomText>Vaikeustaso: {item.difficultyLevel}</CustomText>
            <CustomText>Valmistusaika: {item.cookingTime} min</CustomText>
        </View>
    )

    return (
        <View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Pressable
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <AntDesign name="close" size={24} color="black" />
                        </Pressable>
                        <View style={styles.modalHeader}>
                            <CustomText style={styles.modalTitle}>
                                Lisää uusi ateria
                            </CustomText>
                        </View>
                        <AddMealForm
                            onSubmit={handleAddMeal}
                            onClose={() => setModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
            <CustomText style={styles.introText}>
                Selaa tallennettuja aterioita ja luo uusia aterioita. Voit
                lisätä atrerioihin tarvittavat ainesosat aterian luonnin
                yhteydessä ostoslistallesi. Näet myös aterian luonnin
                yhteydessä, löytyykö tuote pentteristäsi.
            </CustomText>
            <Button
                title="Lisää ateria"
                onPress={() => setModalVisible(true)}
                style={styles.primaryButton}
            />

            {loading ? (
                <CustomText>Ladataan...</CustomText>
            ) : meals.length > 0 ? (
                <FlatList
                    data={meals}
                    renderItem={renderMealItem}
                    keyExtractor={(item) => item._id}
                    style={styles.list}
                />
            ) : (
                <CustomText style={styles.emptyText}>
                    Ei vielä aterioita. Lisää ensimmäinen ateriasi!
                </CustomText>
            )}
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
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingVertical: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: '90%',
        maxWidth: 400,
        maxHeight: '95%',
        position: 'relative',
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 5,
        zIndex: 1,
    },
    modalHeader: {
        width: '100%',
        marginTop: 30,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
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
    mealItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    mealTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    list: {
        width: '100%',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    formContainer: {
        padding: 20,
    },
})

export default MealsScreen
