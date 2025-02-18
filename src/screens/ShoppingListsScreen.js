import React, { useState, useEffect } from 'react'
import {
    Alert,
    Modal,
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
} from 'react-native'
import axios from 'axios'
import Button from '../components/Button'
import FormAddShoppingList from '../components/FormAddShoppingList'
import CustomText from '../components/CustomText'
import storage from '../utils/storage'
import { getServerUrl } from '../utils/getServerUrl'
import { MaterialIcons } from '@expo/vector-icons'
import ShoppingListDetail from '../components/ShoppingListDetail'

const ShoppingListScreen = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [shoppingLists, setShoppingLists] = useState([])
    const [selectedList, setSelectedList] = useState(null)

    const fetchShoppingLists = async () => {
        try {
            const token = await storage.getItem('userToken')
            console.log('Token for request:', token)

            const response = await axios.get(getServerUrl('/shopping-lists'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            // Extract shopping lists from response
            if (response.data.success) {
                setShoppingLists(response.data.shoppingLists)
            } else {
                console.error(
                    'Failed to fetch shopping lists:',
                    response.data.message
                )
                Alert.alert('Virhe', 'Ostoslistojen haku epäonnistui')
            }
        } catch (error) {
            console.error(
                'Error fetching shopping lists:',
                error?.response?.data || error
            )
            Alert.alert('Virhe', 'Ostoslistojen haku epäonnistui')
        }
    }

    useEffect(() => {
        fetchShoppingLists()
    }, [])

    const handleCreateList = async (data) => {
        try {
            setModalVisible(false)
            // Refresh the shopping lists to show the new one
            await fetchShoppingLists()
        } catch (error) {
            Alert.alert('Virhe', 'Ostoslistan luonti epäonnistui')
        }
    }

    const handleViewList = (list) => {
        setSelectedList(list)
    }

    const handleListUpdate = (updatedList) => {
        console.log('Updating list in screen component:', updatedList)
        setShoppingLists((prev) =>
            prev.map((list) =>
                list._id === updatedList._id ? updatedList : list
            )
        )
        // Also update the selected list to show the new item immediately
        setSelectedList(updatedList)
    }

    const renderShoppingList = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.listHeader}>
                <CustomText style={styles.listTitle}>{item.name}</CustomText>
                <CustomText style={styles.listDescription}>
                    {item.description}
                </CustomText>
            </View>
            <View style={styles.listStats}>
                <CustomText>Tuotteita: {item.items?.length || 0}</CustomText>
                <CustomText>
                    Arvioitu hinta: {item.totalEstimatedPrice}€
                </CustomText>
            </View>
            <Button
                style={styles.secondaryButton}
                title="Näytä lista"
                onPress={() => handleViewList(item)}
            />
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
                <View style={styles.layerView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        <CustomText style={styles.modalTitle}>
                            Luo uusi ostoslista
                        </CustomText>
                        <FormAddShoppingList
                            onSubmit={handleCreateList}
                            onClose={() => setModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={!!selectedList}
                onRequestClose={() => setSelectedList(null)}
            >
                <View style={styles.layerView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setSelectedList(null)}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                        {selectedList && (
                            <ShoppingListDetail
                                shoppingList={selectedList}
                                onClose={() => setSelectedList(null)}
                                onUpdate={handleListUpdate}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            <CustomText style={styles.introText}>
                Täällä voit luoda uusia ostoslistoja ja jakaa ne perheenjäsenten
                kanssa. Voitte käyttää ja päivittää ostoslistoja reaaliajassa.
            </CustomText>

            <Button
                style={styles.primaryButton}
                title="Luo uusi ostoslista"
                onPress={() => setModalVisible(true)}
            />

            {shoppingLists.length > 0 ? (
                <FlatList
                    style={styles.listContainer}
                    data={shoppingLists}
                    renderItem={renderShoppingList}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <CustomText style={styles.emptyText}>
                    Ei vielä ostoslistoja. Luo ensimmäinen lista painamalla "Luo
                    uusi ostoslista" -nappia.
                </CustomText>
            )}
        </View>
    )
}

export default ShoppingListScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    introText: {
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#666',
    },
    layerView: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        flex: 1,
        justifyContent: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 35,
        paddingTop: 45,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    listContainer: {
        marginTop: 20,
    },
    listItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    listHeader: {
        marginBottom: 10,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listDescription: {
        color: '#666',
    },
    listStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
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
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1,
        padding: 5,
    },
})
