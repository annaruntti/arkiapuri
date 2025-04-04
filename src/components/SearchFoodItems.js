import React, { useState } from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'

const SearchFoodItems = ({ onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('')

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
        padding: 10,
        marginBottom: 10,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
})

export default SearchFoodItems
