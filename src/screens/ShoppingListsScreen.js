import axios from 'axios'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useCallback, useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import AddActionSection from '../components/AddActionSection'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import ListItem from '../components/ListItem'
import FormAddShoppingList from '../components/FormAddShoppingList'
import LoginPromptModal from '../components/LoginPromptModal'
import useLoginPrompt from '../hooks/useLoginPrompt'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import ContentContainer from '../components/ContentContainer'
import StickyListLayout from '../components/StickyListLayout'
import { useResponsiveDimensions } from '../utils/responsive'

const ShoppingListsScreen = ({ route }) => {
    const navigation = useNavigation()
    const [modalVisible, setModalVisible] = useState(false)
    const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
    const [shoppingLists, setShoppingLists] = useState([])
    const { isDesktop } = useResponsiveDimensions()

    const fetchShoppingLists = async () => {
        try {
            const token = await storage.getItem('userToken')

            if (!token) {
                // Keep guest session lists in memory
                return []
            }

            const response = await axios.get(getServerUrl('/shopping-lists'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            // Extract shopping lists from response
            if (response.data.success) {
                const lists = response.data.shoppingLists
                setShoppingLists(lists)
                return lists
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
            if (error?.response?.status !== 401) {
                Alert.alert('Virhe', 'Ostoslistojen haku epäonnistui')
            }
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchShoppingLists()
        }, [])
    )

    useEffect(() => {
        const updated = route.params?.updatedShoppingList
        if (!updated?._id) return
        setShoppingLists((prev) =>
            prev.map((list) =>
                String(list._id) === String(updated._id) ? updated : list
            )
        )
        navigation.setParams({ updatedShoppingList: undefined })
    }, [route.params?.updatedShoppingList])

    const handleCreateList = async (data) => {
        try {
            setModalVisible(false)
            const guestList = data?.shoppingList || data
            if (guestList?._id && String(guestList._id).startsWith('guest-')) {
                setShoppingLists((prev) => [...prev, guestList])
                return
            }
            // Refresh the shopping lists to show the new one
            await fetchShoppingLists()
        } catch (error) {
            Alert.alert('Virhe', 'Ostoslistan luonti epäonnistui')
        }
    }

    const handleOpenCreateList = async () => {
        const token = await storage.getItem('userToken')
        if (!token) {
            showLoginPrompt('shopping_list', () => setModalVisible(true))
            return
        }
        setModalVisible(true)
    }

    const handleViewList = (list) => {
        navigation.navigate('Ostoslistan tiedot', {
            listId: String(list._id),
            shoppingList: list,
            resetView: Date.now(),
        })
    }

    const renderShoppingList = (item) => (
        <ListItem
            key={item._id}
            title={item.name}
            subtitle={item.description}
            style={styles.listCard}
            trailing={
                <Button
                    style={[
                        styles.tertiaryButton,
                        styles.listItemButton,
                        isDesktop && styles.desktopListItemButton,
                    ]}
                    title="Näytä lista"
                    onPress={() => handleViewList(item)}
                    textStyle={styles.listItemButtonText}
                />
            }
            footer={
                <>
                    <CustomText>
                        Tuotteita: {item.items?.length || 0}
                    </CustomText>
                    <CustomText>
                        Arvioitu hinta:{' '}
                        {item.items && item.items.length > 0
                            ? item.items
                                  .reduce(
                                      (sum, listItem) =>
                                          sum +
                                          (parseFloat(listItem.price) || 0),
                                      0
                                  )
                                  .toFixed(2)
                            : item.totalEstimatedPrice || 0}
                        €
                    </CustomText>
                </>
            }
        />
    )

    return (
        <ResponsiveLayout contentBackgroundColor="#f9fafb">
            <ContentContainer>
                <View style={styles.container}>
                    <ResponsiveModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        title="Luo uusi ostoslista"
                        maxWidth={640}
                    >
                        <FormAddShoppingList
                            onSubmit={handleCreateList}
                            onClose={() => setModalVisible(false)}
                        />
                    </ResponsiveModal>

                    <LoginPromptModal {...loginPromptProps} />

                    <View style={styles.content}>
                        <StickyListLayout
                            chromeBackgroundColor="#f9fafb"
                            style={styles.listLayout}
                            sticky={
                                <View style={styles.addSticky}>
                                    <AddActionSection
                                        title="Lisää ostoslista"
                                        hint="Luo ostoslista ostettaville tuotteille. Voit täydentää listaa myöhemmin."
                                        primaryTitle="Luo uusi ostoslista"
                                        primaryIcon="add"
                                        onPrimaryPress={handleOpenCreateList}
                                    />
                                </View>
                            }
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            {shoppingLists.length > 0 ? (
                                shoppingLists.map(renderShoppingList)
                            ) : (
                                <CustomText style={styles.emptyText}>
                                    Ei vielä ostoslistoja. Luo ensimmäinen lista
                                    painamalla "Luo uusi ostoslista" -nappia.
                                </CustomText>
                            )}
                        </StickyListLayout>
                    </View>
                </View>
            </ContentContainer>
        </ResponsiveLayout>
    )
}

export default ShoppingListsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 10,
    },
    listLayout: {
        backgroundColor: '#f9fafb',
    },
    addSticky: {
        backgroundColor: '#f9fafb',
        paddingBottom: 4,
    },
    listCard: {
        backgroundColor: '#ffffff',
    },
    introText: {
        fontSize: 17,
        textAlign: 'left',
        marginBottom: 20,
        maxWidth: '100%',
    },
    desktopIntroText: {
        fontSize: 21,
        paddingVertical: 16,
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
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        minWidth: 165,
        elevation: 2,
        backgroundColor: '#AE9CFC',
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
        borderColor: '#5844BB',
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
    listItemButtonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14,
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
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '100%',
        padding: 5,
    },
    listItemButton: {
        width: 100,
        flexShrink: 0,
        marginTop: 0,
    },
    desktopListItemButton: {
        width: 120,
        maxWidth: 120,
        paddingHorizontal: 12,
        marginTop: 0,
    },
})
