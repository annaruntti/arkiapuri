import React, { useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import Button from './Button'
import SearchFoodItems from './SearchFoodItems'

const FoodItemSelector = ({
    foodItems = [],
    onOpenFoodItemModal,
    onOpenPantryModal,
    onSelectItem,
    onUpdateQuantity,
    onRemoveItem,
}) => {
    const [activeMode, setActiveMode] = useState(null)

    const incrementQuantity = (index, currentQuantity) => {
        onUpdateQuantity(index, parseFloat((currentQuantity + 1).toFixed(2)))
    }

    const decrementQuantity = (index, currentQuantity) => {
        if (currentQuantity > 0) {
            onUpdateQuantity(
                index,
                parseFloat((currentQuantity - 1).toFixed(2))
            )
        }
    }

    return (
        <View style={styles.container}>
            <CustomText style={styles.infoTitle}>
                Lisää ateriaan tarvittavat raaka-aineet
            </CustomText>
            <CustomText style={styles.infoText}>
                Voit lisätä aterian raaka-aineta etsimällä sovellukseen aiemmin
                lisäämiäsi elintarvikkeita hakemalla niitä nimellä, luomalla
                uusia raaka-aineita tai valitsemalla ne pentteristäsi.
            </CustomText>
            <View style={styles.searchContainer}>
                <SearchFoodItems onSelectItem={onSelectItem} />
            </View>
            <View style={styles.buttonGroup}>
                <Button
                    title="Lisää uusi raaka-aine"
                    onPress={onOpenFoodItemModal}
                    style={[
                        styles.secondaryButton,
                        activeMode === 'new' && styles.activeButton,
                    ]}
                    textStyle={styles.secondaryButtonText}
                />
                <Button
                    title="Valitse Pentteristä"
                    onPress={onOpenPantryModal}
                    style={[
                        styles.secondaryButton,
                        activeMode === 'pantry' && styles.activeButton,
                    ]}
                    textStyle={styles.secondaryButtonText}
                />
            </View>

            {foodItems.length > 0 ? (
                <>
                    <CustomText style={styles.infoTitle}>
                        Raaka-aineet:
                    </CustomText>

                    <View style={styles.foodItemsList}>
                        {foodItems.map((item, index) => (
                            <View key={index} style={styles.foodItemRow}>
                                <View style={styles.foodItemInfo}>
                                    <CustomText style={styles.foodItemName}>
                                        {item.name}
                                    </CustomText>
                                    <View style={styles.controlsContainer}>
                                        <View
                                            style={
                                                styles.quantityControlContainer
                                            }
                                        >
                                            <Pressable
                                                onPress={() =>
                                                    decrementQuantity(
                                                        index,
                                                        item.quantities.meal
                                                    )
                                                }
                                                style={styles.quantityButton}
                                            >
                                                <MaterialIcons
                                                    name="remove"
                                                    size={20}
                                                    color="#666"
                                                />
                                            </Pressable>

                                            <View
                                                style={
                                                    styles.quantityValueContainer
                                                }
                                            >
                                                <CustomText
                                                    style={styles.quantityValue}
                                                >
                                                    {item.quantities.meal}
                                                </CustomText>
                                                <CustomText
                                                    style={styles.unitText}
                                                >
                                                    {item.unit}
                                                </CustomText>
                                            </View>

                                            <Pressable
                                                onPress={() =>
                                                    incrementQuantity(
                                                        index,
                                                        item.quantities.meal
                                                    )
                                                }
                                                style={styles.quantityButton}
                                            >
                                                <MaterialIcons
                                                    name="add"
                                                    size={20}
                                                    color="#666"
                                                />
                                            </Pressable>
                                        </View>
                                        <Pressable
                                            onPress={() => onRemoveItem(index)}
                                            style={styles.removeButton}
                                        >
                                            <View
                                                style={
                                                    styles.removeButtonContainer
                                                }
                                            >
                                                <MaterialIcons
                                                    name="delete"
                                                    size={20}
                                                    color="#666"
                                                />
                                            </View>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            ) : (
                <CustomText style={styles.infoTitle}>
                    Ei vielä lisättyjä raaka-aineita
                </CustomText>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    infoTitle: {
        paddingTop: 10,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    infoText: {
        paddingTop: 10,
        marginBottom: 20,
        fontSize: 14,
        textAlign: 'center',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        gap: 10,
    },
    secondaryButton: {
        flex: 1,
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 7,
        elevation: 2,
        backgroundColor: '#38E4D9',
        marginBottom: 10,
    },
    activeButton: {
        backgroundColor: '#9C86FC',
    },
    foodItemsList: {
        marginBottom: 10,
    },
    foodItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    foodItemInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    foodItemName: {
        flex: 1,
        fontSize: 14,
    },
    quantityControlContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: 25,
        overflow: 'hidden',
        height: 36,
        borderWidth: 2,
        borderColor: '#9C86FC',
    },
    quantityButton: {
        padding: 8,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        height: '100%',
    },
    quantityValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 30,
        backgroundColor: 'transparent',
    },
    quantityValue: {
        fontSize: 16,
        marginRight: 5,
        textAlign: 'center',
        color: '#333',
    },
    unitText: {
        fontSize: 14,
        color: '#666',
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    removeButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonContainer: {
        backgroundColor: '#E8E8E8',
        borderRadius: 25,
        padding: 8,
        height: 36,
        width: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    searchContainer: {
        marginBottom: 15,
    },
})

export default FoodItemSelector
