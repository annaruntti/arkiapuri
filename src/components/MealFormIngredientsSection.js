import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import Button from './Button'
import CustomText from './CustomText'
import FormFoodItem from './FormFoodItem'
import MealFormSelectedIngredient from './MealFormSelectedIngredient'
import UnifiedFoodSearch from './UnifiedFoodSearch'

/**
 * Ingredients picker + selected rows for the create-meal form.
 */
const MealFormIngredientsSection = ({
    foodItems,
    servings,
    showItemForm,
    formErrors,
    isDesktop,
    foodItemsErrorRef,
    onSelectItem,
    onToggleItemForm,
    onAddNewItem,
    onRemove,
    onUpdateQuantity,
    onAddToShoppingList,
    onAddToPantry,
}) => (
    <View style={styles.foodItemSelectorContainer}>
        <CustomText style={styles.label}>Raaka-aineet</CustomText>
        <UnifiedFoodSearch
            onSelectItem={onSelectItem}
            location="meal"
            allowDuplicates={true}
            servings={servings}
        />
        {formErrors.foodItems ? (
            <View
                ref={foodItemsErrorRef}
                style={[styles.errorRow, { marginTop: 8 }]}
            >
                <MaterialIcons name="error" color="#e53e3e" size={14} />
                <CustomText style={styles.errorMsg}>
                    {formErrors.foodItems}
                </CustomText>
            </View>
        ) : null}

        <View
            style={[
                styles.manualAddContainer,
                isDesktop && styles.desktopButtonContainer,
            ]}
        >
            <Button
                title="+ Luo uusi tuote"
                onPress={onToggleItemForm}
                style={[
                    styles.tertiaryButton,
                    isDesktop && styles.tertiaryButtonDesktop,
                ]}
                textStyle={styles.buttonText}
            />
        </View>

        {showItemForm ? (
            <View style={styles.formFoodItemSection}>
                <View style={styles.formFoodItemHeader}>
                    <CustomText style={styles.formFoodItemTitle}>
                        Luo uusi tuote
                    </CustomText>
                    <TouchableOpacity
                        onPress={onToggleItemForm}
                        style={styles.closeFormButton}
                    >
                        <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
                <FormFoodItem onSubmit={onAddNewItem} location="meal" />
            </View>
        ) : null}

        {foodItems.length > 0 ? (
            <View style={styles.selectedItemsContainer}>
                <CustomText style={styles.selectedItemsTitle}>
                    Valitut raaka-aineet:
                </CustomText>
                {foodItems.map((item, index) => (
                    <MealFormSelectedIngredient
                        key={
                            item.tempId ||
                            `${item._id || item.name}-${index}`
                        }
                        item={item}
                        index={index}
                        onRemove={onRemove}
                        onUpdateQuantity={onUpdateQuantity}
                        onAddToShoppingList={onAddToShoppingList}
                        onAddToPantry={onAddToPantry}
                    />
                ))}
            </View>
        ) : null}
    </View>
)

const styles = StyleSheet.create({
    label: {
        paddingTop: 10,
        marginBottom: 5,
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    errorMsg: {
        color: '#e53e3e',
        marginLeft: 5,
        fontSize: 13,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    foodItemSelectorContainer: {
        marginTop: 20,
        marginBottom: 20,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 9998,
        position: 'relative',
    },
    selectedItemsContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    selectedItemsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    manualAddContainer: {
        marginTop: 10,
        marginBottom: 15,
        width: '100%',
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        width: 'auto',
        borderWidth: 3,
        borderColor: '#5844BB',
    },
    tertiaryButtonDesktop: {
        width: 'auto',
        alignSelf: 'flex-start',
        minWidth: 200,
        maxWidth: 250,
    },
    desktopButtonContainer: {
        alignItems: 'flex-start',
    },
    formFoodItemSection: {
        marginTop: 20,
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    formFoodItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    formFoodItemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeFormButton: {
        padding: 5,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
})

export default MealFormIngredientsSection
