import { Feather } from '@expo/vector-icons'
import React, { useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import FoodItemRow from './FoodItemRow'

const MealTabs = ({
    foodItems,
    recipe,
    isRecipeEditing,
    editingFoodItem,
    onAddFoodItem,
    onEditFoodItem,
    onRemoveFoodItem,
    onItemChange,
    onRecipeChange,
    onToggleRecipeEdit,
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
                    {foodItems?.map((item, index) => (
                        <FoodItemRow
                            key={index}
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
                    ))}
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
})

export default MealTabs

