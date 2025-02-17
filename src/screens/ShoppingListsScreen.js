import React, { useState, useEffect } from 'react'
import { Alert, Modal, StyleSheet, View, FlatList } from 'react-native'
import axios from 'axios'
import Button from '../components/Button'
import FormAddShoppingList from '../components/FormAddShoppingList'
import CustomText from '../components/CustomText'
import * as Updates from 'expo-updates'

const ShoppingListScreen = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [shoppingLists, setShoppingLists] = useState([])
    // Add loading state
    // const [isLoading, setIsLoading] = useState(false)

    const getServerUrl = (endpoint) => {
        const { manifest } = Updates
        let debuggerHost = 'localhost'
        if (manifest && manifest.debuggerHost) {
            debuggerHost = manifest.debuggerHost.split(':').shift()
        } else {
            debuggerHost = '192.168.250.107'
        }
        const serverUrl = `http://${debuggerHost}:3001${endpoint}`
        return serverUrl
    }

    const fetchShoppingLists = async () => {
        try {
            const response = await axios.get(getServerUrl('/shopping-lists'))
            setShoppingLists(response.data)
        } catch (error) {
            console.error('Error fetching shopping lists:', error)
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
                onPress={() => {
                    /* Navigate to list detail view */
                }}
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
                    keyExtractor={(item) => item.id}
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
        paddingVertical: 7,
        paddingHorizontal: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        marginVertical: 10,
    },
    secondaryButton: {
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 10,
        elevation: 2,
        backgroundColor: '#E0E0E0',
        marginTop: 10,
    },
})
