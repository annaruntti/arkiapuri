import React, { useState } from 'react'
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import CustomText from './CustomText'
import Button from './Button'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

const ShoppingListDetail = ({ shoppingList, onClose, onUpdate }) => {
    const [checkedItems, setCheckedItems] = useState([])

    const handleCheckItem = (item) => {
        setCheckedItems((prev) =>
            prev.includes(item._id)
                ? prev.filter((id) => id !== item._id)
                : [...prev, item._id]
        )
    }

    const moveCheckedToPantry = async () => {
        try {
            const token = await storage.getItem('userToken')
            const itemsToMove = shoppingList.items.filter((item) =>
                checkedItems.includes(item._id)
            )

            // Move items to pantry
            const response = await axios.post(
                getServerUrl('/pantry/add-items'),
                { items: itemsToMove },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                // Remove items from shopping list
                const updatedList = {
                    ...shoppingList,
                    items: shoppingList.items.filter(
                        (item) => !checkedItems.includes(item._id)
                    ),
                }

                await axios.put(
                    getServerUrl(`/shopping-lists/${shoppingList._id}`),
                    updatedList,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )

                // Reset checked items
                setCheckedItems([])
                // Update parent component
                if (onUpdate) onUpdate(updatedList)
            }
        } catch (error) {
            console.error('Error moving items to pantry:', error)
            Alert.alert('Virhe', 'Tuotteiden siirto ruokavarastoon epäonnistui')
        }
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemRow}
            onPress={() => handleCheckItem(item)}
        >
            <View style={styles.itemContainer}>
                <View style={styles.checkboxContainer}>
                    <MaterialIcons
                        name={
                            checkedItems.includes(item._id)
                                ? 'check-box'
                                : 'check-box-outline-blank'
                        }
                        size={24}
                        color="#9C86FC"
                    />
                </View>
                <View style={styles.itemInfo}>
                    <CustomText style={styles.itemName}>{item.name}</CustomText>
                    <CustomText style={styles.itemDetails}>
                        {item.quantity} {item.unit} • {item.estimatedPrice}€
                    </CustomText>
                    <View style={styles.itemCategories}>
                        {item.categories?.map((category, index) => (
                            <CustomText key={index} style={styles.category}>
                                {category}
                            </CustomText>
                        ))}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <CustomText style={styles.title}>
                    {shoppingList.name}
                </CustomText>
                <CustomText style={styles.description}>
                    {shoppingList.description}
                </CustomText>
            </View>

            <View style={styles.stats}>
                <CustomText>
                    Tuotteita: {shoppingList.items?.length || 0}
                </CustomText>
                <CustomText>
                    Kokonaishinta: {shoppingList.totalEstimatedPrice}€
                </CustomText>
            </View>

            <FlatList
                data={shoppingList.items}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                style={styles.list}
            />

            {checkedItems.length > 0 && (
                <Button
                    title={`Siirrä ${checkedItems.length} tuotetta ruokavarastoon`}
                    onPress={moveCheckedToPantry}
                    style={styles.secondaryButton}
                />
            )}

            <Button
                title="Sulje"
                onPress={onClose}
                style={styles.tertiaryButton}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        color: '#666',
        fontSize: 16,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    list: {
        flex: 1,
    },
    itemRow: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxContainer: {
        marginRight: 10,
    },
    itemInfo: {
        marginBottom: 5,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemDetails: {
        color: '#666',
    },
    itemCategories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    category: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 12,
        fontSize: 12,
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
        marginTop: 10,
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
        marginTop: 10,
    },
})

export default ShoppingListDetail
