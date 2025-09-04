import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, View } from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import FormAddShoppingList from '../components/FormAddShoppingList'
import ShoppingListDetail from '../components/ShoppingListDetail'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import { useResponsiveDimensions } from '../utils/responsive'

const ShoppingListsScreen = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [shoppingLists, setShoppingLists] = useState([])
    const [selectedList, setSelectedList] = useState(null)
    const { isDesktop } = useResponsiveDimensions()

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

    const fetchPantryItems = async () => {
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                return response.data.pantry.items
            } else {
                console.error('Failed to fetch pantry items:', response.data)
                Alert.alert('Virhe', 'Pentterin sisältöä ei voitu hakea')
                return []
            }
        } catch (error) {
            console.error('Error fetching pantry items:', error)
            Alert.alert('Virhe', 'Pentterin tietojen haku epäonnistui')
            return []
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
                    Arvioitu hinta:{' '}
                    {item.items && item.items.length > 0
                        ? item.items
                              .reduce(
                                  (sum, listItem) =>
                                      sum + (parseFloat(listItem.price) || 0),
                                  0
                              )
                              .toFixed(2)
                        : item.totalEstimatedPrice || 0}
                    €
                </CustomText>
            </View>
            <Button
                style={[
                    styles.secondaryButton,
                    styles.listItemButton,
                    isDesktop && styles.desktopListItemButton,
                ]}
                title="Näytä lista"
                onPress={() => handleViewList(item)}
                textStyle={styles.buttonText}
            />
        </View>
    )

    return (
        <ResponsiveLayout>
            <View style={styles.container}>
                <ResponsiveModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    title="Luo uusi ostoslista"
                    maxWidth={800}
                >
                    <FormAddShoppingList
                        onSubmit={handleCreateList}
                        onClose={() => setModalVisible(false)}
                    />
                </ResponsiveModal>

                <ResponsiveModal
                    visible={!!selectedList}
                    onClose={() => setSelectedList(null)}
                    title="Ostoslistan tiedot"
                    maxWidth={800}
                >
                    {selectedList && (
                        <ShoppingListDetail
                            shoppingList={selectedList}
                            onClose={() => setSelectedList(null)}
                            onUpdate={handleListUpdate}
                            fetchShoppingLists={fetchShoppingLists}
                            fetchPantryItems={fetchPantryItems}
                        />
                    )}
                </ResponsiveModal>

                <View style={styles.content}>
                    <CustomText style={styles.introText}>
                        Täällä voit luoda uusia ostoslistoja ja jakaa ne
                        perheenjäsenten kanssa. Voitte käyttää ja päivittää
                        ostoslistoja reaaliajassa.
                    </CustomText>

                    <View
                        style={[
                            styles.buttonContainer,
                            isDesktop && styles.desktopButtonContainer,
                        ]}
                    >
                        <Button
                            title="Luo uusi ostoslista"
                            onPress={() => setModalVisible(true)}
                            style={[
                                styles.primaryButton,
                                isDesktop && styles.desktopPrimaryButton,
                            ]}
                            textStyle={styles.buttonText}
                        />
                    </View>

                    {shoppingLists.length > 0 ? (
                        <FlatList
                            style={styles.listContainer}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            data={shoppingLists}
                            renderItem={renderShoppingList}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <CustomText style={styles.emptyText}>
                            Ei vielä ostoslistoja. Luo ensimmäinen lista
                            painamalla "Luo uusi ostoslista" -nappia.
                        </CustomText>
                    )}
                </View>
            </View>
        </ResponsiveLayout>
    )
}

export default ShoppingListsScreen

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
        maxWidth: '100%',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#666',
    },
    layerView: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'flex-end',
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
        width: '100%',
        maxHeight: '60%',
    },
    listItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
        width: '100%',
        marginBottom: 10,
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        width: '100%',
        marginBottom: 10,
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        width: '100%',
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    desktopPrimaryButton: {
        maxWidth: 300,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1,
        padding: 5,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    desktopButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItemButton: {
        width: 120,
        alignSelf: 'center',
        marginTop: 10,
    },
    desktopListItemButton: {
        width: 140,
        maxWidth: 140,
        paddingHorizontal: 15,
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    detailModalView: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        width: '100%',
        paddingTop: 45,
    },
    detailContentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    modalBody: {
        flex: 1,
        padding: 15,
    },
})
