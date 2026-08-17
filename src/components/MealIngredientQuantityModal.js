import { useEffect, useState } from 'react'
import {
    Alert,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Button from './Button'
import CustomText from './CustomText'
import { APP_UNITS, resolveAppUnit } from '../utils/units'

/**
 * In-flow quantity step for adding a meal ingredient.
 * Rendered as a page inside the existing meal modal — not a nested overlay.
 */
const MealIngredientQuantityModal = ({
    visible,
    item,
    onCancel,
    onConfirm,
}) => {
    const [quantity, setQuantity] = useState('')
    const [unit, setUnit] = useState('kpl')
    const [unitMenuOpen, setUnitMenuOpen] = useState(false)

    useEffect(() => {
        if (visible && item) {
            setQuantity('')
            setUnit(resolveAppUnit(item.unit))
            setUnitMenuOpen(false)
        }
    }, [visible, item])

    if (!visible) return null

    const handleConfirm = () => {
        const parsed = parseFloat(String(quantity).replace(',', '.'))
        if (!Number.isFinite(parsed) || parsed <= 0) {
            Alert.alert(
                'Määrä puuttuu',
                'Syötä tähän ateriaan tarvittava määrä.'
            )
            return
        }
        onConfirm({
            quantity: parsed,
            unit: resolveAppUnit(unit),
        })
    }

    return (
        <View style={styles.page}>
            <CustomText style={styles.hint}>
                {item?.name
                    ? `Paljonko ateriaan: ${item.name}?`
                    : 'Valitse määrä'}
            </CustomText>
            <CustomText style={styles.label}>Määrä</CustomText>
            <View style={styles.quantityRow}>
                <TextInput
                    style={[styles.input, styles.quantityInput]}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="decimal-pad"
                    placeholder="Esim. 2"
                    placeholderTextColor="#999"
                    autoFocus
                />
                <TouchableOpacity
                    style={styles.unitSelectButton}
                    onPress={() => setUnitMenuOpen((open) => !open)}
                    activeOpacity={0.7}
                >
                    <CustomText style={styles.unitSelectText} numberOfLines={1}>
                        {unit}
                    </CustomText>
                    <MaterialIcons
                        name={unitMenuOpen ? 'expand-less' : 'expand-more'}
                        size={16}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>
            {unitMenuOpen && (
                <View style={styles.unitDropdown}>
                    {APP_UNITS.map((option) => {
                        const selected = option === unit
                        return (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.unitOption,
                                    selected && styles.unitOptionSelected,
                                ]}
                                onPress={() => {
                                    setUnit(option)
                                    setUnitMenuOpen(false)
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
            )}
            <View style={styles.actions}>
                <Button
                    title="Peruuta"
                    type="TERTIARY"
                    onPress={onCancel}
                    style={styles.actionButton}
                />
                <Button
                    title="Lisää ateriaan"
                    onPress={handleConfirm}
                    style={styles.actionButton}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    hint: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 4,
        height: 40,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#111',
    },
    quantityInput: {
        flex: 1,
    },
    unitSelectButton: {
        width: 88,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 6,
        gap: 2,
    },
    unitSelectText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    unitDropdown: {
        alignSelf: 'flex-end',
        width: 88,
        marginBottom: 12,
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
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
        textAlign: 'center',
    },
    unitOptionTextSelected: {
        fontWeight: '600',
        color: '#5844BB',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
    actionButton: {
        alignSelf: 'flex-start',
    },
})

export default MealIngredientQuantityModal
