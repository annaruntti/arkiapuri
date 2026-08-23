import axios from 'axios'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import PrimaryActionFade from '../components/PrimaryActionFade'
import ListItem from '../components/ListItem'
import FormAddShoppingList from '../components/FormAddShoppingList'
import LoginPromptModal from '../components/LoginPromptModal'
import useLoginPrompt from '../hooks/useLoginPrompt'
import ShoppingListDetail from '../components/ShoppingListDetail'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import ContentContainer from '../components/ContentContainer'
import StickyListLayout from '../components/StickyListLayout'
import { useResponsiveDimensions } from '../utils/responsive'

const ShoppingListsScreen = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
    const [shoppingLists, setShoppingLists] = useState([])
    const [selectedList, setSelectedList] = useState(null)
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
                setSelectedList((prev) => {
                    if (!prev) return prev
                    const refreshed = lists.find(
                        (list) => String(list._id) === String(prev._id)
                    )
                    return refreshed ?? prev
                })
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

    const fetchPantryItems = async () => {
        try {
            const token = await storage.getItem('userToken')

            if (!token) {
                return []
            }

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
            if (error?.response?.status !== 401) {
                Alert.alert('Virhe', 'Pentterin tietojen haku epäonnistui')
            }
            return []
        }
    }

    useEffect(() => {
        fetchShoppingLists()
    }, [])

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
        setSelectedList(list)
    }

    const handleListUpdate = (updatedList) => {
        setShoppingLists((prev) =>
            prev.map((list) =>
                String(list._id) === String(updatedList._id)
                    ? updatedList
                    : list
            )
        )
        setSelectedList(updatedList)
    }

    const renderShoppingList = (item) => (
        <ListItem
            key={item._id}
            title={item.name}
            subtitle={item.description}
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
        <ResponsiveLayout>
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

                    <ShoppingListDetail
                        shoppingList={selectedList}
                        visible={!!selectedList}
                        onClose={() => setSelectedList(null)}
                        onUpdate={handleListUpdate}
                        fetchShoppingLists={fetchShoppingLists}
                        fetchPantryItems={fetchPantryItems}
                        onRequireLogin={(trigger, action) =>
                            showLoginPrompt(trigger || 'shopping_list', action)
                        }
                    />

                    <View style={styles.content}>
                        <StickyListLayout
                            sticky={
                                <PrimaryActionFade
                                    style={[
                                        styles.buttonContainer,
                                        isDesktop &&
                                            styles.desktopButtonContainer,
                                    ]}
                                >
                                    <Button
                                        title="Luo uusi ostoslista"
                                        onPress={handleOpenCreateList}
                                    />
                                </PrimaryActionFade>
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
        backgroundColor: '#fff',
        padding: 10,
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
    buttonContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
        paddingHorizontal: 5,
        paddingTop: 10,
        alignItems: 'flex-start',
    },
    desktopButtonContainer: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
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
