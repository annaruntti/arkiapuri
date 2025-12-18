import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import FoodItemRow from './FoodItemRow'

const MealTabs = ({
    foodItems,
    foodItemsWithAvailability = [],
    recipe,
    isRecipeEditing,
    editingFoodItem,
    onAddFoodItem,
    onEditFoodItem,
    onRemoveFoodItem,
    onItemChange,
    onRecipeChange,
    onToggleRecipeEdit,
    onAddToShoppingList,
    onAddToPantry,
}) => {
    const [activeTab, setActiveTab] = useState('ingredients')

    const renderTabContent = () => {
        if (activeTab === 'ingredients') {
            return (
                <View style={styles.detailSection}>
                    <View style={styles.sectionHeader}>
                        <CustomText style={styles.sectionTitle}>
                            Raaka-aineet:
                        </CustomText>
                        <Button
                            title="+ Lisää"
                            onPress={onAddFoodItem}
                            type="TERTIARY"
                            size="small"
                        />
                    </View>
                    {foodItems?.map((item, index) => {
                        // Find availability info for this item
                        const itemWithAvailability = foodItemsWithAvailability.find(
                            (availItem) => availItem.name === item.name || availItem._id === item._id
                        ) || item
                        const availability = itemWithAvailability.availability || {}
                        const showSuggestion = 
                            !availability.inPantry || !availability.inShoppingList

                        return (
                            <View key={index}>
                                <FoodItemRow
                                    item={item}
                                    index={index}
                                    onEdit={(index) =>
                                        onEditFoodItem(
                                            editingFoodItem === index ? null : index
                                        )
                                    }
                                    onRemove={onRemoveFoodItem}
                                    isEditing={editingFoodItem === index}
                                    onItemChange={onItemChange}
                                />
                                {/* Show availability status */}
                                {(availability.inPantry || availability.inShoppingList || showSuggestion) && (
                                    <View style={styles.availabilityContainer}>
                                        {availability.inPantry && (
                                            <View style={styles.availabilityBadge}>
                                                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                                                <CustomText style={styles.availabilityText}>
                                                    Ruokavarastossa ({availability.pantryQuantity || 0} {item.unit || 'kpl'})
                                                </CustomText>
                                            </View>
                                        )}
                                        {availability.inShoppingList && (
                                            <View style={styles.availabilityBadge}>
                                                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                                                <CustomText style={styles.availabilityText}>
                                                    Ostoslistalla ({availability.shoppingListQuantity || 0} {item.unit || 'kpl'})
                                                </CustomText>
                                            </View>
                                        )}
                                        {showSuggestion && onAddToShoppingList && onAddToPantry && (
                                            <>
                                                <CustomText style={styles.suggestionText}>
                                                    Lisää raaka-aine myös:
                                                </CustomText>
                                                <View style={styles.suggestionButtons}>
                                                    {!availability.inShoppingList && (
                                                        <TouchableOpacity
                                                            style={styles.suggestionButton}
                                                            onPress={() => onAddToShoppingList(item)}
                                                        >
                                                            <MaterialIcons name="shopping-cart" size={16} color="#000000" />
                                                            <CustomText style={styles.suggestionButtonText}>
                                                                Ostoslistalle
                                                            </CustomText>
                                                        </TouchableOpacity>
                                                    )}
                                                    {!availability.inPantry && (
                                                        <TouchableOpacity
                                                            style={styles.suggestionButton}
                                                            onPress={() => onAddToPantry(item)}
                                                        >
                                                            <MaterialIcons name="kitchen" size={16} color="#000000" />
                                                            <CustomText style={styles.suggestionButtonText}>
                                                                Ruokavarastoon
                                                            </CustomText>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </>
                                        )}
                                    </View>
                                )}
                            </View>
                        )
                    })}
                </View>
            )
        } else {
            return (
                <View style={styles.detailSection}>
                    <View style={styles.recipeHeader}>
                        <CustomText style={styles.sectionTitle}>
                            Valmistusohje:
                        </CustomText>
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={onToggleRecipeEdit}
                        >
                            <Feather
                                name={isRecipeEditing ? 'check' : 'edit-2'}
                                size={18}
                                color="#666"
                            />
                        </TouchableOpacity>
                    </View>
                    {isRecipeEditing ? (
                        <TextInput
                            style={[styles.input, styles.recipeInput]}
                            value={recipe}
                            onChangeText={onRecipeChange}
                            multiline
                            numberOfLines={4}
                        />
                    ) : (
                        <CustomText style={styles.recipeText}>
                            {recipe || 'Ei valmistusohjetta'}
                        </CustomText>
                    )}
                </View>
            )
        }
    }

    return (
        <>
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'ingredients' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('ingredients')}
                >
                    <CustomText
                        style={[
                            styles.tabText,
                            activeTab === 'ingredients' &&
                                styles.activeTabText,
                        ]}
                    >
                        Raaka-aineet
                    </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'recipe' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('recipe')}
                >
                    <CustomText
                        style={[
                            styles.tabText,
                            activeTab === 'recipe' && styles.activeTabText,
                        ]}
                    >
                        Valmistusohje
                    </CustomText>
                </TouchableOpacity>
            </View>
            {renderTabContent()}
        </>
    )
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        marginTop: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#9C86FC',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: '#9C86FC',
        fontWeight: 'bold',
    },
    detailSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    recipeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    editIcon: {
        padding: 5,
        marginLeft: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#9C86FC',
        padding: 2,
        minWidth: 50,
        textAlign: 'right',
    },
    recipeText: {
        lineHeight: 24,
        flex: 1,
        flexWrap: 'wrap',
        wordBreak: 'break-word',
    },
    recipeInput: {
        textAlign: 'left',
        minHeight: 100,
        flex: 1,
        flexWrap: 'wrap',
        wordBreak: 'break-word',
    },
    availabilityContainer: {
        marginTop: 8,
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    availabilityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#D1FAE5',
        borderRadius: 6,
    },
    availabilityText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#065F46',
    },
    suggestionText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginTop: 4,
        marginBottom: 8,
    },
    suggestionButtons: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    suggestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#9C86FC',
        borderRadius: 25,
        paddingVertical: 6,
        paddingHorizontal: 12,
        minHeight: 32,
    },
    suggestionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
    },
})

export default MealTabs

