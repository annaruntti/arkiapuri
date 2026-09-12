import { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import Button from './Button'
import ResponsiveModal from './ResponsiveModal'
import { removalReasonLabel } from '../utils/pantryLocations'

const PantryRemovalSuggestionsModal = ({
    visible,
    onClose,
    suggestions = [],
    submitting = false,
    onRemove,
    onKeep,
}) => {
    const [selectedIds, setSelectedIds] = useState([])

    useEffect(() => {
        if (!visible) return
        setSelectedIds(suggestions.map((suggestion) => String(suggestion.itemId)))
    }, [visible, suggestions])

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

    const toggle = (itemId) => {
        const id = String(itemId)
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
        )
    }

    const selectedSuggestions = suggestions.filter((suggestion) =>
        selectedSet.has(String(suggestion.itemId))
    )
    const keptSuggestions = suggestions.filter(
        (suggestion) => !selectedSet.has(String(suggestion.itemId))
    )

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onClose}
            title="Poistoehdotukset"
            maxWidth={560}
        >
            <CustomText style={styles.hint}>
                Valitse tuotteet, jotka poistetaan pentteristä. Valitsematta
                jätetyt pidetään, eikä ehdotusta näytetä uudelleen ennen kuin
                tilanne muuttuu.
            </CustomText>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {suggestions.map((suggestion) => {
                    const id = String(suggestion.itemId)
                    const selected = selectedSet.has(id)
                    return (
                        <TouchableOpacity
                            key={id}
                            style={styles.row}
                            onPress={() => toggle(id)}
                        >
                            <MaterialIcons
                                name={
                                    selected
                                        ? 'check-box'
                                        : 'check-box-outline-blank'
                                }
                                size={24}
                                color="#000000"
                            />
                            <View style={styles.rowText}>
                                <CustomText style={styles.name}>
                                    {suggestion.itemName}
                                    {suggestion.quantity
                                        ? ` · ${suggestion.quantity} ${suggestion.unit || ''}`
                                        : ''}
                                </CustomText>
                                <CustomText style={styles.reason}>
                                    {removalReasonLabel(suggestion)}
                                </CustomText>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>
            <View style={styles.actions}>
                <Button
                    title={
                        submitting
                            ? 'Päivitetään...'
                            : `Poista valitut (${selectedSuggestions.length})`
                    }
                    onPress={() => onRemove?.(selectedSuggestions)}
                    disabled={submitting || selectedSuggestions.length === 0}
                />
                <Button
                    type="SECONDARY"
                    title={
                        keptSuggestions.length > 0
                            ? `Pidä pentterissä (${keptSuggestions.length})`
                            : 'Pidä pentterissä'
                    }
                    onPress={() => onKeep?.(keptSuggestions)}
                    disabled={submitting || keptSuggestions.length === 0}
                />
            </View>
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    hint: {
        color: '#555',
        marginBottom: 12,
    },
    list: {
        maxHeight: 360,
    },
    listContent: {
        gap: 8,
        paddingBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 12,
    },
    rowText: {
        flex: 1,
    },
    name: {
        fontWeight: '700',
        fontSize: 15,
    },
    reason: {
        color: '#666',
        marginTop: 2,
        fontSize: 13,
    },
    actions: {
        gap: 10,
        marginTop: 12,
        paddingBottom: 8,
    },
})

export default PantryRemovalSuggestionsModal
