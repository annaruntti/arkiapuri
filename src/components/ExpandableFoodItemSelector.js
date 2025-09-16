import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Animated, FlatList, Pressable, StyleSheet, View } from 'react-native'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import Button from './Button'
import CustomText from './CustomText'
import FormFoodItem from './FormFoodItem'
import SearchFoodItems from './SearchFoodItems'

const ExpandableFoodItemSelector = ({
    foodItems = [],
    onSelectItem,
    onSelectMultipleItems,
    onUpdateQuantity,
    onRemoveItem,
    onAddFoodItem,
    shoppingLists = [],
    selectedShoppingListId,
    onShoppingListSelect,
}) => {
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const [activeMode, setActiveMode] = useState(null)
    const [showNewItemForm, setShowNewItemForm] = useState(false)
    const [showPantrySelector, setShowPantrySelector] = useState(false)
    const [pantryItems, setPantryItems] = useState([])
    const [selectedPantryItems, setSelectedPantryItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [formAnimation] = useState(new Animated.Value(0))
    const [pantryAnimation] = useState(new Animated.Value(0))

    // Track showNewItemForm state changes
    useEffect(() => {
        // Form state tracking for debugging if needed
    }, [showNewItemForm])

    // Fetch pantry items when pantry selector is opened
    const fetchPantryItems = async () => {
        setIsLoading(true)
        try {
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/pantry'), {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000,
            })


            if (response.data.success) {
                const items =
                    response.data.pantry?.items || response.data.items || []
                setPantryItems(items)
            } else {
                console.error('Failed to fetch pantry items:', response.data)
                setPantryItems([])
            }
        } catch (error) {
            console.error('Error fetching pantry items:', error)
            setPantryItems([])
        } finally {
            setIsLoading(false)
        }
    }

    // Animation functions
    const animateIn = (animationValue) => {
        Animated.timing(animationValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start()
    }

    const animateOut = (animationValue, callback) => {
        Animated.timing(animationValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start(callback)
    }

    // Handle new item form toggle
    const toggleNewItemForm = () => {
        if (showNewItemForm) {
            animateOut(formAnimation, () => {
                setShowNewItemForm(false)
                setActiveMode(null)
            })
        } else {
            setShowPantrySelector(false)
            setActiveMode('new')
            setShowNewItemForm(true)
            animateIn(formAnimation)
        }
    }

    // Handle pantry selector toggle
    const togglePantrySelector = () => {
        if (showPantrySelector) {
            animateOut(pantryAnimation, () => {
                setShowPantrySelector(false)
                setActiveMode(null)
            })
        } else {
            setShowNewItemForm(false)
            setActiveMode('pantry')
            setShowPantrySelector(true)
            fetchPantryItems()
            animateIn(pantryAnimation)
        }
    }

    // Handle form submission
    const handleFormSubmit = (data) => {
        onAddFoodItem(data)
        toggleNewItemForm()
    }

    // Handle pantry item selection
    const togglePantryItemSelection = (item) => {
        setSelectedPantryItems((prev) => {
            const isSelected = prev.find(
                (selected) => selected._id === item._id
            )
            if (isSelected) {
                return prev.filter((selected) => selected._id !== item._id)
            } else {
                return [...prev, { ...item, quantities: { meal: 1 } }]
            }
        })
    }

    // Add selected pantry items
    const addSelectedPantryItems = () => {
        if (onSelectMultipleItems) {
            // Use the multiple items handler for better state management
            onSelectMultipleItems(selectedPantryItems)
        } else {
            // Fallback to individual selection
            selectedPantryItems.forEach((item) => onSelectItem(item))
        }
        setSelectedPantryItems([])
        togglePantrySelector()
    }

    // Quantity control functions
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

    // Render pantry item
    const renderPantryItem = ({ item }) => {
        const isSelected = selectedPantryItems.find(
            (selected) => selected._id === item._id
        )

        return (
            <Pressable
                style={[
                    styles.pantryItem,
                    isSelected && styles.selectedPantryItem,
                ]}
                onPress={() => togglePantryItemSelection(item)}
            >
                <View style={styles.pantryItemContent}>
                    <CustomText style={styles.pantryItemName}>
                        {item.name}
                    </CustomText>
                    <CustomText style={styles.pantryItemDetails}>
                        {item.quantity} {item.unit}
                    </CustomText>
                </View>
                <View style={styles.checkboxContainer}>
                    {isSelected && (
                        <MaterialIcons name="check" size={20} color="#9C86FC" />
                    )}
                </View>
            </Pressable>
        )
    }

    return (
        <View style={styles.container}>
            <CustomText style={styles.infoTitle}>
                Lisää ateriaan tarvittavat raaka-aineet
            </CustomText>
            <CustomText style={styles.infoText}>
                Voit lisätä aterian raaka-aineita etsimällä sovellukseen aiemmin
                lisäämiäsi elintarvikkeita hakemalla niitä nimellä, luomalla
                uusia raaka-aineita tai valitsemalla ne pentteristäsi.
            </CustomText>

            {/* Search Section */}
            <View style={styles.searchContainer}>
                <SearchFoodItems onSelectItem={onSelectItem} />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
                <Button
                    title="Lisää uusi raaka-aine"
                    onPress={toggleNewItemForm}
                    style={[
                        styles.secondaryButton,
                        activeMode === 'new' && styles.activeButton,
                    ]}
                    textStyle={[
                        styles.secondaryButtonText,
                        !isDesktop && !isTablet && styles.mobileButtonText,
                    ]}
                />
                <Button
                    title="Valitse Pentteristä"
                    onPress={togglePantrySelector}
                    style={[
                        styles.secondaryButton,
                        activeMode === 'pantry' && styles.activeButton,
                    ]}
                    textStyle={[
                        styles.secondaryButtonText,
                        !isDesktop && !isTablet && styles.mobileButtonText,
                    ]}
                />
            </View>

            {/* Expandable New Item Form */}
            {showNewItemForm && (
                <Animated.View
                    style={[
                        styles.expandableSection,
                        {
                            maxHeight: formAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 600],
                            }),
                            opacity: formAnimation,
                        },
                    ]}
                >
                    <View style={styles.formHeader}>
                        <CustomText style={styles.formTitle}>
                            Lisää uusi raaka-aine
                        </CustomText>
                        <Pressable
                            onPress={toggleNewItemForm}
                            style={styles.closeButton}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="#666"
                            />
                        </Pressable>
                    </View>
                    <FormFoodItem
                        onSubmit={handleFormSubmit}
                        onClose={toggleNewItemForm}
                        location="meal"
                        showLocationSelector={true}
                        shoppingLists={shoppingLists}
                        selectedShoppingListId={selectedShoppingListId}
                        onShoppingListSelect={onShoppingListSelect}
                        buttonStyle="secondary"
                        initialValues={{
                            quantities: {
                                meal: '',
                                'shopping-list': '',
                                pantry: '',
                            },
                            locations: ['meal'],
                        }}
                    />
                </Animated.View>
            )}

            {/* Expandable Pantry Selector */}
            {showPantrySelector && (
                <Animated.View
                    style={[
                        styles.expandableSection,
                        {
                            maxHeight: pantryAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 400],
                            }),
                            opacity: pantryAnimation,
                        },
                    ]}
                >
                    <View style={styles.formHeader}>
                        <CustomText style={styles.formTitle}>
                            Valitse pentteristä
                        </CustomText>
                        <Pressable
                            onPress={togglePantrySelector}
                            style={styles.closeButton}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="#666"
                            />
                        </Pressable>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <CustomText style={styles.loadingText}>
                                Ladataan...
                            </CustomText>
                        </View>
                    ) : (
                        <View style={styles.pantryContainer}>
                            <CustomText style={styles.foundItemsText}>
                                {`${pantryItems.length} elintarviketta löydetty`}
                            </CustomText>

                            <View style={styles.pantryListContainer}>
                                <FlatList
                                    data={pantryItems}
                                    renderItem={renderPantryItem}
                                    keyExtractor={(item) => item._id}
                                    style={styles.pantryList}
                                    contentContainerStyle={
                                        styles.pantryListContent
                                    }
                                    showsVerticalScrollIndicator={true}
                                    nestedScrollEnabled={true}
                                    bounces={false}
                                    scrollEnabled={true}
                                    keyboardShouldPersistTaps="handled"
                                />
                            </View>

                            {selectedPantryItems.length > 0 && (
                                <View style={styles.pantryActions}>
                                    <CustomText style={styles.selectedCount}>
                                        {`${selectedPantryItems.length} valittu`}
                                    </CustomText>
                                    <Button
                                        title="Lisää valitut"
                                        onPress={addSelectedPantryItems}
                                        style={styles.addSelectedButton}
                                        textStyle={styles.buttonText}
                                    />
                                </View>
                            )}
                        </View>
                    )}
                </Animated.View>
            )}

            {/* Selected Food Items List */}
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
    container: {
        flex: 1,
    },
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
    searchContainer: {
        marginBottom: 15,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        gap: 10,
    },
    secondaryButton: {
        flex: 1,
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 7,
        elevation: 2,
        backgroundColor: '#38E4D9',
    },
    activeButton: {
        backgroundColor: '#9C86FC',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    mobileButtonText: {
        fontSize: 13,
    },

    // Expandable sections
    expandableSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        backgroundColor: '#fff',
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },

    // Pantry selector styles
    pantryContainer: {
        padding: 15,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    foundItemsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    pantryListContainer: {
        height: 200,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginBottom: 15,
    },
    pantryList: {
        flex: 1,
    },
    pantryListContent: {
        paddingVertical: 8,
    },
    pantryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    selectedPantryItem: {
        borderColor: '#9C86FC',
        backgroundColor: '#f8f5ff',
    },
    pantryItemContent: {
        flex: 1,
    },
    pantryItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    pantryItemDetails: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#9C86FC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pantryActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 55,
        marginTop: 15,
        marginBottom: 20,
        paddingTop: 15,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    selectedCount: {
        fontSize: 14,
        color: '#666',
    },
    addSelectedButton: {
        backgroundColor: '#38E4D9',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 25,
        elevation: 2,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    // Food items list (existing styles)
    foodItemsList: {
        marginBottom: 10,
    },
    foodItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
})

export default ExpandableFoodItemSelector
