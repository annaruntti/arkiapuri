import React, { useState, useEffect } from 'react'
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import axios from 'axios'
import storage from '../utils/storage'
import { getServerUrl } from '../utils/getServerUrl'

const SearchFoodItems = ({ onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [allFoodItems, setAllFoodItems] = useState([])
    const [filteredItems, setFilteredItems] = useState([])
    const [loading, setLoading] = useState(false)

    // Fetch all food items when component mounts
    useEffect(() => {
        fetchFoodItems()
    }, [])

    const fetchFoodItems = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/food-items'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const items = response.data.foodItems || response.data || []
            console.log('Setting food items:', items)
            setAllFoodItems(items)
        } catch (error) {
            console.error('Error fetching food items:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter items based on search query
    useEffect(() => {
        console.log('Search query changed:', searchQuery)
        console.log('Current allFoodItems:', allFoodItems)

        if (searchQuery.trim() === '') {
            setFilteredItems([])
            return
        }

        const searchTerm = searchQuery.toLowerCase().trim()
        const filtered = allFoodItems.filter((item) => {
            const itemName = (item.name || '').toLowerCase()
            console.log('Checking item:', item, 'for term:', searchTerm)
            return itemName.includes(searchTerm)
        })
        console.log('Filtered results:', filtered)
        setFilteredItems(filtered)
    }, [searchQuery, allFoodItems])

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => onSelect(item)}
        >
            <CustomText>{item.name}</CustomText>
            <MaterialIcons name="add" size={24} color="#9C86FC" />
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <MaterialIcons name="search" size={24} color="#666" />
                <TextInput
                    style={styles.input}
                    placeholder="Hae raaka-aineita..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <CustomText style={styles.infoText}>Ladataan...</CustomText>
            ) : (
                <FlatList
                    data={filteredItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    style={styles.resultsList}
                    ListEmptyComponent={() =>
                        searchQuery.trim() !== '' && (
                            <CustomText style={styles.infoText}>
                                Ei hakutuloksia
                            </CustomText>
                        )
                    }
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        padding: 5,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        padding: 5,
    },
    resultsList: {
        maxHeight: 200,
    },
    resultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: 'white',
    },
    infoText: {
        textAlign: 'center',
        padding: 10,
        color: '#666',
    },
})

export default SearchFoodItems
