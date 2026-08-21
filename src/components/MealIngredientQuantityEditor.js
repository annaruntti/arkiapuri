import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useState } from 'react'
import CustomText from './CustomText'
import ListItem from './ListItem'
import { getIngredientQuantity } from '../utils/mealFoodItem'
import { APP_UNITS, resolveAppUnit } from '../utils/units'

const MealIngredientQuantityEditor = ({ foodItems = [], onItemChange }) => {
    const [openUnitIndex, setOpenUnitIndex] = useState(null)

    if (!foodItems.length) return null

    return (
        <View style={styles.section}>
            <CustomText style={styles.heading}>Raaka-aineiden määrät</CustomText>
            {foodItems.map((item, index) => {
                const unit = resolveAppUnit(item.unit)
                const unitMenuOpen = openUnitIndex === index

                return (
                    <ListItem
                        key={item.tempId || item._id || item.foodId || index}
                        title={
                            <View style={styles.titleRow}>
                                <CustomText
                                    style={styles.name}
                                    numberOfLines={2}
                                >
                                    {item.name}
                                </CustomText>
                                <TextInput
                                    style={[styles.input, styles.quantityInput]}
                                    value={String(getIngredientQuantity(item))}
                                    onChangeText={(text) =>
                                        onItemChange(
                                            index,
                                            'quantity',
                                            parseFloat(
                                                String(text).replace(',', '.')
                                            ) || 0
                                        )
                                    }
                                    keyboardType="decimal-pad"
                                    placeholder="Määrä"
                                />
                                <TouchableOpacity
                                    style={styles.unitSelectButton}
                                    onPress={() =>
                                        setOpenUnitIndex(
                                            unitMenuOpen ? null : index
                                        )
                                    }
                                    activeOpacity={0.7}
                                >
                                    <CustomText
                                        style={styles.unitSelectText}
                                        numberOfLines={1}
                                    >
                                        {unit}
                                    </CustomText>
                                    <MaterialIcons
                                        name={
                                            unitMenuOpen
                                                ? 'expand-less'
                                                : 'expand-more'
                                        }
                                        size={16}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                        }
                        details={
                            unitMenuOpen ? (
                                <View style={styles.unitDropdown}>
                                    {APP_UNITS.map((option) => {
                                        const selected = option === unit
                                        return (
                                            <TouchableOpacity
                                                key={option}
                                                style={[
                                                    styles.unitOption,
                                                    selected &&
                                                        styles.unitOptionSelected,
                                                ]}
                                                onPress={() => {
                                                    onItemChange(
                                                        index,
                                                        'unit',
                                                        option
                                                    )
                                                    setOpenUnitIndex(null)
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <CustomText
                                                    style={[
                                                        styles.unitOptionText,
                                                        selected &&
                                                            styles.unitOptionTextSelected,
                                                    ]}
                                                >
                                                    {option}
                                                </CustomText>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            ) : undefined
                        }
                    />
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        marginTop: 16,
    },
    heading: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 10,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        flex: 1,
        minWidth: 0,
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#1f2937',
    },
    quantityInput: {
        width: 72,
        textAlign: 'right',
    },
    unitSelectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        minWidth: 88,
        justifyContent: 'space-between',
        gap: 4,
    },
    unitSelectText: {
        fontSize: 16,
        color: '#1f2937',
    },
    unitDropdown: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
    },
    unitOption: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    unitOptionSelected: {
        backgroundColor: '#f3f0ff',
    },
    unitOptionText: {
        fontSize: 14,
        color: '#333',
    },
    unitOptionTextSelected: {
        fontWeight: '600',
        color: '#5844BB',
    },
})

export default MealIngredientQuantityEditor
