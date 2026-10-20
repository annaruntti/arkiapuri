import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

import CustomRadioButton from './CustomRadioButton'
import CustomText from './CustomText'
import FormFoodItemShoppingListSelector from './FormFoodItemShoppingListSelector'

/**
 * Meal-context multi-destination picker (meal / shopping list / pantry).
 */
const FormFoodItemLocationTargets = ({
    selectedLocations,
    quantities,
    currentUnit,
    shoppingLists,
    selectedShoppingListId,
    onLocationToggle,
    onQuantityChange,
    onShoppingListSelect,
    style,
}) => (
    <View style={[styles.locationSelector, style]}>
        <CustomText style={styles.labelTitle}>
            Valitse minne haluat samalla lisätä raaka-aineen ja määrät
        </CustomText>
        <View style={styles.radioGroup}>
            {['meal', 'shopping-list', 'pantry'].map((loc) => (
                <View key={loc}>
                    <View style={styles.locationRow}>
                        <TouchableOpacity
                            style={styles.radioOption}
                            onPress={() => onLocationToggle(loc)}
                        >
                            <CustomRadioButton
                                value={loc}
                                status={
                                    selectedLocations.includes(loc)
                                        ? 'checked'
                                        : 'unchecked'
                                }
                                onPress={() => onLocationToggle(loc)}
                                color="#5844BB"
                                disabled={loc === 'meal'}
                            />
                            <CustomText style={styles.radioLabel}>
                                {loc === 'meal'
                                    ? 'Ateriaan kätettävä määrä'
                                    : loc === 'shopping-list'
                                      ? 'Ostoslistalle'
                                      : 'Pentteriin'}
                            </CustomText>
                        </TouchableOpacity>
                        {selectedLocations.includes(loc) && (
                            <View style={styles.quantityInput}>
                                <TextInput
                                    style={styles.unitFormInput}
                                    value={quantities[loc]}
                                    onChangeText={(value) =>
                                        onQuantityChange(loc, value)
                                    }
                                    placeholder="Määrä"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                />
                                <CustomText style={styles.unitLabel}>
                                    {currentUnit || 'kpl'}
                                </CustomText>
                            </View>
                        )}
                    </View>
                    {loc === 'shopping-list' &&
                        selectedLocations.includes('shopping-list') && (
                            <View style={styles.shoppingListSelectorContainer}>
                                <FormFoodItemShoppingListSelector
                                    shoppingLists={shoppingLists}
                                    selectedId={selectedShoppingListId}
                                    onSelect={onShoppingListSelect}
                                />
                            </View>
                        )}
                </View>
            ))}
        </View>
    </View>
)

const styles = StyleSheet.create({
    locationSelector: {
        marginBottom: 15,
    },
    labelTitle: {
        paddingTop: 25,
        marginBottom: 15,
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 16,
    },
    radioGroup: {
        marginTop: 5,
        marginBottom: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    radioLabel: {
        marginLeft: 8,
        fontSize: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    quantityInput: {
        flexDirection: 'row',
        alignItems: 'right',
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
    },
    unitFormInput: {
        backgroundColor: 'white',
        borderColor: '#d1d5db',
        borderWidth: 1,
        height: 48,
        paddingHorizontal: 14,
        borderRadius: 8,
        fontSize: 16,
        width: 65,
        marginLeft: 10,
    },
    unitLabel: {
        marginLeft: 8,
        fontSize: 14,
        alignSelf: 'center',
    },
    shoppingListSelectorContainer: {
        marginLeft: 30,
        marginBottom: 5,
    },
})

export default FormFoodItemLocationTargets
