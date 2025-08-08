import React, { useState, useEffect, useRef } from 'react'
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Platform,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import axios from 'axios'
import storage from '../utils/storage'
import { getServerUrl } from '../utils/getServerUrl'

const SearchFoodItems = ({ onSelectItem }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [allFoodItems, setAllFoodItems] = useState([])
    const [filteredItems, setFilteredItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [isListVisible, setIsListVisible] = useState(false)
    const searchContainerRef = useRef(null)
    const [addedItems, setAddedItems] = useState(new Set())

    // Fetch all food items when component mounts
    useEffect(() => {
        fetchFoodItems()
    }, [])

    // useEffect for click listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)
            ) {
                setIsListVisible(false)
                setSearchQuery('')
                setAddedItems(new Set())
            }
        }

        if (Platform.OS === 'web') {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            if (Platform.OS === 'web') {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
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

        // Filter by search term
        const matchingItems = allFoodItems.filter((item) => {
            const itemName = (item.name || '').toLowerCase()
            return itemName.includes(searchTerm)
        })

        // Remove duplicates based on name
        const uniqueItems = matchingItems.reduce((unique, item) => {
            const existingItem = unique.find(
                (u) => u.name.toLowerCase() === item.name.toLowerCase()
            )
            if (!existingItem) {
                unique.push(item)
            }
            return unique
        }, [])

        console.log('Filtered unique results:', uniqueItems)
        setFilteredItems(uniqueItems)
    }, [searchQuery, allFoodItems])

    // Update search query handler to show list
    const handleSearchQueryChange = (text) => {
        setSearchQuery(text)
        setIsListVisible(text.trim() !== '')
    }

    const handleItemSelect = (item) => {
        setAddedItems((prev) => new Set(prev).add(item._id))
        onSelectItem(item)
    }

    const renderItem = ({ item }) => {
        const isAdded = addedItems.has(item._id)

        return (
            <TouchableOpacity
                style={[styles.resultItem, isAdded && styles.resultItemAdded]}
                onPress={() => handleItemSelect(item)}
                disabled={isAdded}
            >
                <CustomText style={isAdded ? styles.addedText : null}>
                    {item.name}
                </CustomText>
                <MaterialIcons
                    name={isAdded ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={isAdded ? '#38E4D9' : '#666'}
                />
            </TouchableOpacity>
        )
    }

    const handleCloseList = () => {
        setIsListVisible(false)
        setSearchQuery('')
        setAddedItems(new Set())
    }

    return (
        <View style={styles.container}>
            <View ref={searchContainerRef} style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={24} color="#666" />
                    <TextInput
                        style={styles.input}
                        placeholder="Hae raaka-aineita..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={handleSearchQueryChange}
                        onFocus={() =>
                            setIsListVisible(searchQuery.trim() !== '')
                        }
                    />
                    {searchQuery.trim() !== '' && (
                        <TouchableOpacity
                            onPress={handleCloseList}
                            style={styles.clearButton}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="#666"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {isListVisible && searchQuery.trim() !== '' && !loading && (
                    <View style={styles.resultsContainer}>
                        <View style={styles.scrollWrapper}>
                            <FlatList
                                data={filteredItems}
                                renderItem={renderItem}
                                keyExtractor={(item) => item._id}
                                style={styles.resultsList}
                                scrollEnabled={true}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                                bounces={false}
                                ListEmptyComponent={() => (
                                    <CustomText style={styles.infoText}>
                                        Ei hakutuloksia
                                    </CustomText>
                                )}
                            />
                        </View>
                    </View>
                )}

                {loading && (
                    <CustomText style={styles.infoText}>Ladataan...</CustomText>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    searchContainer: {
        zIndex: 1000,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        padding: 5,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        padding: 5,
    },
    resultsContainer: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 4,
        marginBottom: 10,
        ...(Platform.OS !== 'web' && {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        }),
    },
    scrollWrapper: {
        maxHeight: 300,
        borderRadius: 4,
        ...(Platform.OS === 'web'
            ? {
                  overflowY: 'auto',
              }
            : {
                  overflow: 'hidden',
              }),
    },
    resultsList: {
        width: '100%',
        ...(Platform.OS === 'web'
            ? {
                  height: 'auto',
              }
            : {}),
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
    resultItemAdded: {
        backgroundColor: '#f8f8f8',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    infoText: {
        textAlign: 'center',
        padding: 10,
        color: '#666',
    },
    addedText: {
        color: '#333',
    },
    clearButton: {
        padding: 5,
        marginLeft: 5,
    },
})

export default SearchFoodItems
