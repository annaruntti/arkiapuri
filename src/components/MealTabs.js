import { useState } from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Button from './Button'
import CustomText from './CustomText'
import FoodItemRow from './FoodItemRow'

const TABS = [
    { id: 'ingredients', label: 'Raaka-aineet' },
    { id: 'recipe', label: 'Valmistusohje' },
    { id: 'details', label: 'Tiedot' },
]

const MealTabs = ({
    foodItems,
    foodItemsWithAvailability = [],
    recipe,
    isRecipeEditing,
    onAddFoodItem,
    onOpenFoodItem,
    onRemoveFoodItem,
    onRecipeChange,
    onToggleRecipeEdit,
    onAddToShoppingList,
    onAddToPantry,
    nutritionContent,
    detailsContent,
}) => {
    const [activeTab, setActiveTab] = useState('ingredients')

    const renderTabContent = () => {
        if (activeTab === 'ingredients') {
            return (
                <View style={styles.detailSection}>
                    <View style={styles.sectionHeader}>
                        <CustomText style={styles.sectionHint}>
                            {foodItems?.length
                                ? `${foodItems.length} raaka-ainetta`
                                : 'Ei raaka-aineita'}
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
                        const inPantry = Boolean(availability.inPantry)
                        const inShoppingList = Boolean(availability.inShoppingList)
                        const statusParts = [
                            inPantry ? 'ruokavarastossa' : null,
                            inShoppingList ? 'ostoslistalla' : null,
                        ].filter(Boolean)
                        const canAddToShoppingList =
                            !inShoppingList && Boolean(onAddToShoppingList)
                        const canAddToPantry =
                            !inPantry && Boolean(onAddToPantry)

                        const availabilityFooter =
                            canAddToShoppingList || canAddToPantry ? (
                                <View style={styles.availabilityActions}>
                                    {canAddToShoppingList ? (
                                        <TouchableOpacity
                                            onPress={() =>
                                                onAddToShoppingList(item)
                                            }
                                            hitSlop={{
                                                top: 6,
                                                bottom: 6,
                                                left: 4,
                                                right: 4,
                                            }}
                                        >
                                            <CustomText
                                                style={
                                                    styles.availabilityAction
                                                }
                                            >
                                                Lisää ostoslistalle
                                            </CustomText>
                                        </TouchableOpacity>
                                    ) : null}
                                    {canAddToPantry ? (
                                        <TouchableOpacity
                                            onPress={() =>
                                                onAddToPantry(item)
                                            }
                                            hitSlop={{
                                                top: 6,
                                                bottom: 6,
                                                left: 4,
                                                right: 4,
                                            }}
                                        >
                                            <CustomText
                                                style={
                                                    styles.availabilityAction
                                                }
                                            >
                                                Lisää ruokavarastoon
                                            </CustomText>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            ) : null

                        return (
                            <FoodItemRow
                                key={item.tempId || item._id || item.foodId || index}
                                item={item}
                                index={index}
                                onOpenDetails={onOpenFoodItem}
                                onRemove={onRemoveFoodItem}
                                details={
                                    statusParts.length ? (
                                        <CustomText
                                            style={styles.availabilityStatus}
                                        >
                                            {statusParts.join(' · ')}
                                        </CustomText>
                                    ) : undefined
                                }
                                footer={availabilityFooter}
                            />
                        )
                    })}
                    {nutritionContent}
                </View>
            )
        }

        if (activeTab === 'details') {
            return <View style={styles.detailSection}>{detailsContent}</View>
        }

        return (
                <View style={styles.detailSection}>
                    <View style={styles.recipeHeader}>
                        <CustomText style={styles.sectionHint}>
                            {recipe ? 'Reseptin vaiheet' : 'Ei valmistusohjetta'}
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

    return (
        <>
            <View style={styles.tabsContainer}>
                {TABS.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            activeTab === tab.id && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <CustomText
                            style={[
                                styles.tabText,
                                activeTab === tab.id && styles.activeTabText,
                            ]}
                            numberOfLines={1}
                        >
                            {tab.label}
                        </CustomText>
                    </TouchableOpacity>
                ))}
            </View>
            {renderTabContent()}
        </>
    )
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        marginTop: 4,
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#5844BB',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    activeTabText: {
        color: '#5844BB',
        fontWeight: 'bold',
    },
    detailSection: {
        marginTop: 12,
    },
    sectionHint: {
        fontSize: 14,
        color: '#6b7280',
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
        borderBottomColor: '#5844BB',
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
    availabilityActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    availabilityStatus: {
        fontSize: 12,
        color: '#4b5563',
        marginTop: 4,
    },
    availabilityAction: {
        fontSize: 12,
        color: '#5844BB',
        textDecorationLine: 'underline',
        fontWeight: '500',
    },
})

export default MealTabs

