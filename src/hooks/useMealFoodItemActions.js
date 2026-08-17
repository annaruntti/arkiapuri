import axios from 'axios'
import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { checkFoodItemsAvailability } from '../utils/foodItemAvailability'
import { getServerUrl } from '../utils/getServerUrl'
import {
    getIngredientQuantity,
    mergeUpdatedFoodItem,
} from '../utils/mealFoodItem'
import storage from '../utils/storage'

const getAuthHeaders = async () => {
    const token = await storage.getItem('userToken')
    return { Authorization: `Bearer ${token}` }
}

const getItemQuantity = (item) => getIngredientQuantity(item)

const getItemCategory = (item) =>
    Array.isArray(item.category) ? item.category : []

const getFoodItemId = (item) => item._id || item.foodId?._id || item.foodId

/**
 * Shared actions for adding meal ingredients to shopping list / pantry.
 */
const useMealFoodItemActions = ({
    foodItems,
    setFoodItems,
    setFoodItemsWithAvailability,
}) => {
    const [shoppingLists, setShoppingLists] = useState([])
    const [selectedShoppingListId, setSelectedShoppingListId] = useState(null)
    const [pendingShoppingListItem, setPendingShoppingListItem] = useState(null)
    const [showShoppingListPicker, setShowShoppingListPicker] = useState(false)
    const [isAddingToShoppingList, setIsAddingToShoppingList] = useState(false)

    const refreshAvailability = useCallback(
        async (items) => {
            try {
                const withAvailability = await checkFoodItemsAvailability(items)
                setFoodItemsWithAvailability(withAvailability)
            } catch (error) {
                console.error('Error checking food items availability:', error)
            }
        },
        [setFoodItemsWithAvailability]
    )

    const applyFoodItemUpdate = useCallback(
        async (sourceItem, updatedFoodItem) => {
            const nextFoodItems = mergeUpdatedFoodItem(
                foodItems,
                sourceItem,
                updatedFoodItem
            )
            setFoodItems(nextFoodItems)
            await refreshAvailability(nextFoodItems)
        },
        [foodItems, setFoodItems, refreshAvailability]
    )

    const fetchShoppingLists = useCallback(async () => {
        try {
            const headers = await getAuthHeaders()
            const response = await axios.get(getServerUrl('/shopping-lists'), {
                headers,
            })

            if (!response.data.success) return []

            const lists = response.data.shoppingLists || []
            setShoppingLists(lists)

            if (lists.length === 1) {
                setSelectedShoppingListId(lists[0]._id)
            } else if (
                lists.length > 1 &&
                selectedShoppingListId &&
                !lists.some((list) => list._id === selectedShoppingListId)
            ) {
                setSelectedShoppingListId(null)
            }

            return lists
        } catch (error) {
            console.error('Error fetching shopping lists:', error)
            return []
        }
    }, [selectedShoppingListId])

    const ensureFoodItemForShoppingList = async (item, headers) => {
        const foodItemId = getFoodItemId(item)
        const categoryArray = getItemCategory(item)

        if (foodItemId) {
            return { _id: foodItemId, name: item.name, unit: item.unit }
        }

        const findOrCreateResponse = await axios.post(
            getServerUrl('/food-items/find-or-create'),
            {
                name: item.name,
                unit: item.unit || 'kpl',
                category: categoryArray,
                calories: parseInt(item.calories, 10) || 0,
                price: parseFloat(item.price) || 0,
            },
            { headers }
        )

        if (!findOrCreateResponse.data?.success) {
            throw new Error(
                findOrCreateResponse.data?.message || 'Food item sync failed'
            )
        }

        return findOrCreateResponse.data.foodItem
    }

    const addItemToShoppingList = useCallback(
        async (item, listId) => {
            const listIdToUse = listId || selectedShoppingListId
            if (!item || !listIdToUse) {
                Alert.alert('Virhe', 'Valitse ostoslista')
                return
            }

            setIsAddingToShoppingList(true)
            try {
                const headers = await getAuthHeaders()
                const quantity = getItemQuantity(item)
                const categoryArray = getItemCategory(item)
        const foodItem = await ensureFoodItemForShoppingList(item, headers)

                const shoppingListResponse = await axios.post(
                    getServerUrl(`/shopping-lists/${listIdToUse}/items`),
                    {
                        items: [
                            {
                                foodId: foodItem._id,
                                name: item.name,
                                estimatedPrice: parseFloat(item.price) || 0,
                                quantity,
                                unit: item.unit || 'kpl',
                                category: categoryArray,
                                calories: parseInt(item.calories, 10) || 0,
                                price: parseFloat(item.price) || 0,
                            },
                        ],
                    },
                    { headers }
                )

                if (!shoppingListResponse.data?.success) {
                    throw new Error(
                        shoppingListResponse.data?.message ||
                            'Shopping list update failed'
                    )
                }

                setSelectedShoppingListId(listIdToUse)
                setShowShoppingListPicker(false)
                setPendingShoppingListItem(null)
                await applyFoodItemUpdate(item, foodItem)

                const selectedList = shoppingLists.find(
                    (list) => list._id === listIdToUse
                )
                Alert.alert(
                    'Onnistui',
                    selectedList
                        ? `Tuote lisätty listalle "${selectedList.name}"`
                        : 'Tuote lisätty ostoslistaan'
                )
            } catch (error) {
                console.error('Error adding to shopping list:', error)
                Alert.alert(
                    'Virhe',
                    error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        'Tuotteen lisääminen ostoslistaan epäonnistui'
                )
            } finally {
                setIsAddingToShoppingList(false)
            }
        },
        [
            selectedShoppingListId,
            shoppingLists,
            applyFoodItemUpdate,
        ]
    )

    const requestAddToShoppingList = useCallback(
        async (item) => {
            let lists = shoppingLists
            if (!lists.length) {
                lists = await fetchShoppingLists()
            }

            if (!lists.length) {
                Alert.alert(
                    'Virhe',
                    'Sinulla ei ole ostoslistaa. Luo ensin ostoslista.'
                )
                return
            }

            setPendingShoppingListItem(item)

            if (lists.length === 1) {
                setSelectedShoppingListId(lists[0]._id)
                await addItemToShoppingList(item, lists[0]._id)
                return
            }

            setShowShoppingListPicker(true)
        },
        [shoppingLists, fetchShoppingLists, addItemToShoppingList]
    )

    const addItemToPantry = useCallback(
        async (item) => {
            try {
                const headers = await getAuthHeaders()
                const quantity = getItemQuantity(item)
                const categoryArray = getItemCategory(item)
                const foodItemId = getFoodItemId(item)

                const pantryResponse = await axios.post(
                    getServerUrl('/pantry/items'),
                    {
                        name: item.name,
                        category: categoryArray,
                        quantity,
                        unit: item.unit || 'kpl',
                        price: parseFloat(item.price) || 0,
                        calories: parseInt(item.calories, 10) || 0,
                        foodId: foodItemId,
                    },
                    { headers }
                )

                if (!pantryResponse.data?.success) {
                    throw new Error(
                        pantryResponse.data?.message ||
                            pantryResponse.data?.error ||
                            'Pantry update failed'
                    )
                }

                await applyFoodItemUpdate(item, pantryResponse.data.foodItem)
                Alert.alert('Onnistui', 'Tuote lisätty ruokavarastoon')
            } catch (error) {
                console.error('Error adding to pantry:', error)
                Alert.alert(
                    'Virhe',
                    error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        'Tuotteen lisääminen ruokavarastoon epäonnistui'
                )
            }
        },
        [applyFoodItemUpdate]
    )

    const closeShoppingListPicker = useCallback(() => {
        if (isAddingToShoppingList) return
        setShowShoppingListPicker(false)
        setPendingShoppingListItem(null)
    }, [isAddingToShoppingList])

    return {
        shoppingLists,
        selectedShoppingListId,
        pendingShoppingListItem,
        showShoppingListPicker,
        isAddingToShoppingList,
        fetchShoppingLists,
        refreshAvailability,
        requestAddToShoppingList,
        addItemToShoppingList,
        addItemToPantry,
        closeShoppingListPicker,
    }
}

export default useMealFoodItemActions
