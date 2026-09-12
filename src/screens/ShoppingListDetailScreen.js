import { useCallback, useEffect, useState } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import axios from 'axios'
import ContentContainer from '../components/ContentContainer'
import LoginPromptModal from '../components/LoginPromptModal'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ShoppingListDetail from '../components/ShoppingListDetail'
import useLoginPrompt from '../hooks/useLoginPrompt'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

const isValidShoppingList = (list) =>
    Boolean(list && typeof list === 'object' && list._id)

const ShoppingListDetailScreen = ({ route, navigation }) => {
    const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
    const [shoppingList, setShoppingList] = useState(
        isValidShoppingList(route.params?.shoppingList)
            ? route.params.shoppingList
            : null
    )

    useEffect(() => {
        if (isValidShoppingList(route.params?.shoppingList)) {
            setShoppingList(route.params.shoppingList)
        }
    }, [route.params?.shoppingList])

    useEffect(() => {
        if (isValidShoppingList(route.params?.shoppingList)) return

        const listId = route.params?.listId
        const currentId =
            shoppingList?._id != null ? String(shoppingList._id) : ''
        if (currentId && (!listId || currentId === String(listId))) {
            return
        }

        if (!listId || listId === 'details') {
            if (!currentId) navigation.navigate('Ostoslista')
            return
        }

        let cancelled = false
        const loadList = async () => {
            try {
                const token = await storage.getItem('userToken')
                if (!token) {
                    if (!cancelled && !currentId) {
                        navigation.navigate('Ostoslista')
                    }
                    return
                }

                const response = await axios.get(
                    getServerUrl('/shopping-lists'),
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                if (cancelled) return

                const lists = response.data?.success
                    ? response.data.shoppingLists
                    : []
                const found = lists.find(
                    (list) => String(list._id) === String(listId)
                )
                if (found) setShoppingList(found)
                else navigation.navigate('Ostoslista')
            } catch (error) {
                if (!cancelled) {
                    if (error?.response?.status !== 401) {
                        console.error('Error fetching shopping list:', error)
                    }
                    navigation.navigate('Ostoslista')
                }
            }
        }

        loadList()
        return () => {
            cancelled = true
        }
    }, [
        route.params?.listId,
        route.params?.shoppingList,
        navigation,
        shoppingList,
    ])

    const fetchShoppingLists = useCallback(async () => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) return []

            const response = await axios.get(getServerUrl('/shopping-lists'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                const lists = response.data.shoppingLists
                if (shoppingList?._id) {
                    const refreshed = lists.find(
                        (list) => String(list._id) === String(shoppingList._id)
                    )
                    if (refreshed) setShoppingList(refreshed)
                }
                return lists
            }
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error('Error fetching shopping lists:', error)
            }
        }
        return []
    }, [shoppingList?._id])

    const fetchPantryItems = async () => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) return []

            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.data.success) {
                return response.data.pantry.items
            }
        } catch (error) {
            if (error?.response?.status !== 401) {
                Alert.alert('Virhe', 'Pentterin tietojen haku epäonnistui')
            }
        }
        return []
    }

    const handleClose = () => {
        navigation.navigate({
            name: 'Ostoslista',
            params: { updatedShoppingList: shoppingList },
            merge: true,
        })
    }

    if (!shoppingList) {
        return (
            <ResponsiveLayout
                activeRoute="ShoppingListStack"
                contentBackgroundColor="#f9fafb"
            >
                <View style={styles.missing} />
            </ResponsiveLayout>
        )
    }

    return (
        <ResponsiveLayout
            activeRoute="ShoppingListStack"
            contentBackgroundColor="#f9fafb"
        >
            <ContentContainer>
                <View style={styles.container}>
                    <ShoppingListDetail
                        shoppingList={shoppingList}
                        resetView={route.params?.resetView}
                        onUpdate={setShoppingList}
                        onClose={handleClose}
                        fetchShoppingLists={fetchShoppingLists}
                        fetchPantryItems={fetchPantryItems}
                        onRequireLogin={(trigger, action) =>
                            showLoginPrompt(trigger || 'shopping_list', action)
                        }
                    />
                    <LoginPromptModal {...loginPromptProps} />
                </View>
            </ContentContainer>
        </ResponsiveLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 15,
    },
    missing: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
})

export default ShoppingListDetailScreen
