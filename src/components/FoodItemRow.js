import React from 'react'
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { Feather } from '@expo/vector-icons'
import CustomText from './CustomText'

const FoodItemRow = ({
    item,
    index,
    onEdit,
    onRemove,
    isEditing,
    onItemChange,
}) => (
    <View style={styles.foodItemRow}>
        <View style={styles.foodItemContent}>
            {isEditing ? (
                <>
                    <TextInput
                        style={[styles.input, styles.foodItemInput]}
                        value={item.name}
                        onChangeText={(text) =>
                            onItemChange(index, 'name', text)
                        }
                        placeholder="Raaka-aineen nimi"
                    />
                    <TextInput
                        style={[styles.input, styles.foodItemInput]}
                        value={item.quantity}
                        onChangeText={(text) =>
                            onItemChange(index, 'quantity', text)
                        }
                        placeholder="Määrä"
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={[styles.input, styles.foodItemInput]}
                        value={item.unit}
                        onChangeText={(text) =>
                            onItemChange(index, 'unit', text)
                        }
                        placeholder="Yksikkö"
                    />
                </>
            ) : (
                <CustomText>
                    {item.name} - {item.quantities?.meal || 0} {item.unit}
                </CustomText>
            )}
        </View>
        <View style={styles.foodItemActions}>
            <TouchableOpacity
                style={styles.editIcon}
                onPress={() => onEdit(index)}
            >
                <Feather
                    name={isEditing ? 'check' : 'edit-2'}
                    size={18}
                    color="#666"
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.editIcon}
                onPress={() => onRemove(index)}
            >
                <Feather name="trash-2" size={18} color="#666" />
            </TouchableOpacity>
        </View>
    </View>
)

const styles = StyleSheet.create({
    foodItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    foodItemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    foodItemInput: {
        flex: 1,
        textAlign: 'left',
    },
    foodItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
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
})

export default FoodItemRow
