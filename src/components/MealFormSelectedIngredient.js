import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { SOURCE_LABELS } from '../utils/dishFromPhotoDraft'
import {
    getIngredientQuantity,
} from '../utils/mealFoodItem'
import { formatScaledQuantity } from '../utils/mealServings'
import CustomText from './CustomText'

/**
 * One selected ingredient row in the create-meal form:
 * quantity editor + pantry/shopping availability suggestions.
 */
const MealFormSelectedIngredient = ({
    item,
    index,
    onRemove,
    onUpdateQuantity,
    onAddToShoppingList,
    onAddToPantry,
}) => {
    const availability = item.availability || {}
    const showSuggestion =
        Boolean(item.availability) &&
        (availability.inPantry !== true ||
            availability.inShoppingList !== true)
    const sourceLabel = SOURCE_LABELS[item.matchSource]
    const visibilityLabel =
        item.visibleInPhoto === true
            ? 'Näkyy kuvassa'
            : item.visibleInPhoto === false
              ? 'Tyypillinen ainesosa'
              : null

    return (
        <View style={styles.selectedItem}>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(index)}
            >
                <Feather name="trash-2" size={18} color="#666" />
            </TouchableOpacity>

            <View style={styles.itemInfo}>
                <CustomText style={styles.itemName}>{item.name}</CustomText>
                <CustomText style={styles.itemDetails}>
                    {`${formatScaledQuantity(getIngredientQuantity(item))} ${item.unit || 'kpl'}`}
                </CustomText>
                {(sourceLabel || visibilityLabel) && (
                    <CustomText style={styles.ingredientSourceText}>
                        {[visibilityLabel, sourceLabel]
                            .filter(Boolean)
                            .join(' · ')}
                    </CustomText>
                )}
                <View style={styles.quantityRow}>
                    <CustomText style={styles.quantityLabel}>Määrä:</CustomText>
                    <TextInput
                        style={styles.quantityInput}
                        value={String(getIngredientQuantity(item))}
                        onChangeText={(text) =>
                            onUpdateQuantity(index, parseFloat(text) || 0)
                        }
                        keyboardType="numeric"
                        placeholder="0"
                    />
                    <CustomText style={styles.unitText}>
                        {item.unit || 'kpl'}
                    </CustomText>
                </View>

                <View style={styles.availabilityContainer}>
                    {availability.inPantry && (
                        <View style={styles.availabilityBadge}>
                            <MaterialIcons
                                name="check-circle"
                                size={16}
                                color="#10B981"
                            />
                            <CustomText style={styles.availabilityText}>
                                Ruokavarastossa (
                                {availability.pantryQuantity || 0}{' '}
                                {availability.pantryUnit || 'kpl'})
                            </CustomText>
                        </View>
                    )}
                    {availability.inShoppingList && (
                        <View style={styles.availabilityBadge}>
                            <MaterialIcons
                                name="check-circle"
                                size={16}
                                color="#10B981"
                            />
                            <CustomText style={styles.availabilityText}>
                                Ostoslistalla (
                                {availability.shoppingListQuantity || 0}{' '}
                                {availability.shoppingListUnit || 'kpl'})
                            </CustomText>
                        </View>
                    )}
                    {showSuggestion && (
                        <>
                            <CustomText style={styles.suggestionText}>
                                Lisää raaka-aine myös:
                            </CustomText>
                            <View style={styles.suggestionButtons}>
                                {!availability.inShoppingList && (
                                    <TouchableOpacity
                                        style={styles.suggestionButton}
                                        activeOpacity={0.7}
                                        onPress={async () => {
                                            try {
                                                await onAddToShoppingList(item)
                                            } catch (error) {
                                                console.error(
                                                    'Error in onPress handler:',
                                                    error
                                                )
                                                Alert.alert(
                                                    'Virhe',
                                                    'Tuotteen lisääminen epäonnistui: ' +
                                                        (error.message ||
                                                            'Tuntematon virhe')
                                                )
                                            }
                                        }}
                                    >
                                        <MaterialIcons
                                            name="shopping-cart"
                                            size={16}
                                            color="#000000"
                                        />
                                        <CustomText
                                            style={styles.suggestionButtonText}
                                        >
                                            Ostoslistalle
                                        </CustomText>
                                    </TouchableOpacity>
                                )}
                                {!availability.inPantry && (
                                    <TouchableOpacity
                                        style={styles.suggestionButton}
                                        onPress={async () => {
                                            await onAddToPantry(item)
                                        }}
                                    >
                                        <MaterialIcons
                                            name="kitchen"
                                            size={16}
                                            color="#000000"
                                        />
                                        <CustomText
                                            style={styles.suggestionButtonText}
                                        >
                                            Ruokavarastoon
                                        </CustomText>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    selectedItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        position: 'relative',
    },
    itemInfo: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemDetails: {
        color: '#666',
        fontSize: 14,
    },
    ingredientSourceText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
        marginBottom: 4,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 8,
    },
    quantityLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 10,
        color: '#333',
        minWidth: 50,
    },
    quantityInput: {
        width: 60,
        height: 32,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 8,
        backgroundColor: 'white',
        fontSize: 14,
        textAlign: 'center',
        marginRight: 8,
    },
    unitText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        minWidth: 30,
    },
    removeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#e0e0e0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    availabilityContainer: {
        marginTop: 12,
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
        borderColor: '#5844BB',
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

export default MealFormSelectedIngredient
