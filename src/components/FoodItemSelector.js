import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import CustomText from './CustomText'
import Button from './Button'
import SearchFoodItems from './SearchFoodItems'

const FoodItemSelector = ({
    foodItems = [],
    onOpenFoodItemModal,
    onOpenPantryModal,
}) => {
    const [activeMode, setActiveMode] = useState(null)

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

            <SearchFoodItems
                onSelect={(item) => {
                    // Handle search selection
                }}
            />

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
                    {foodItems.map((item, index) => (
                        <View key={index} style={styles.foodItem}>
                            <CustomText>{item.name}</CustomText>
                        </View>
                    ))}
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
        marginBottom: 15,
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
    foodItem: {
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        marginBottom: 5,
    },
    secondaryButtonText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
})

export default FoodItemSelector
