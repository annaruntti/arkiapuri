import { useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import ResponsiveModal from './ResponsiveModal'
import Button from './Button'
import { APP_UNITS } from '../utils/units'

const PantryScanReview = ({
    visible,
    onClose,
    items = [],
    usage,
    submitting = false,
    onSubmit,
}) => {
    const [rows, setRows] = useState([])

    useEffect(() => {
        if (!visible) return
        setRows(
            (items || []).map((item, index) => ({
                key: `${item.foodId || item.name}-${index}`,
                selected: item.confidence >= 0.35,
                name: item.name || '',
                quantity: String(item.quantity || 1),
                unit: item.unit || 'kpl',
                category: item.category || [],
                foodId: item.foodId,
                confidence: item.confidence,
                alreadyInPantry: Boolean(item.alreadyInPantry),
                notes: item.notes,
            }))
        )
    }, [visible, items])

    const selectedCount = useMemo(
        () => rows.filter((row) => row.selected && row.name.trim()).length,
        [rows]
    )

    const updateRow = (key, patch) => {
        setRows((prev) =>
            prev.map((row) => (row.key === key ? { ...row, ...patch } : row))
        )
    }

    const toggleAll = (selected) => {
        setRows((prev) => prev.map((row) => ({ ...row, selected })))
    }

    const handleSubmit = () => {
        const selected = rows
            .filter((row) => row.selected && row.name.trim())
            .map((row) => ({
                name: row.name.trim(),
                quantity: Number(row.quantity) || 1,
                unit: row.unit || 'kpl',
                category: row.category,
                foodId: row.foodId,
            }))
        onSubmit?.(selected)
    }

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onClose}
            title="Tunnistetut tuotteet"
            maxWidth={640}
        >
            <View style={styles.container}>
                {usage ? (
                    <CustomText style={styles.usageText}>
                        Skannaus käytti {usage.creditsCharged ?? 2} krediittiä.
                        Jäljellä {usage.remainingCredits} / {usage.creditLimit}.
                    </CustomText>
                ) : null}

                {rows.length === 0 ? (
                    <CustomText style={styles.emptyText}>
                        Kuvasta ei tunnistettu elintarvikkeita. Kokeile
                        lähempää kuvaa tai parempaa valaistusta.
                    </CustomText>
                ) : (
                    <>
                        <View style={styles.toolbar}>
                            <CustomText style={styles.countText}>
                                Tunnistettu {rows.length} tuotetta
                            </CustomText>
                            <View style={styles.toolbarLinks}>
                                <TouchableOpacity
                                    onPress={() => toggleAll(true)}
                                >
                                    <CustomText style={styles.link}>
                                        Valitse kaikki
                                    </CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => toggleAll(false)}
                                >
                                    <CustomText style={styles.link}>
                                        Poista valinnat
                                    </CustomText>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <ScrollView
                            style={styles.list}
                            contentContainerStyle={styles.listContent}
                            nestedScrollEnabled
                        >
                            {rows.map((row) => (
                                <View key={row.key} style={styles.row}>
                                    <TouchableOpacity
                                        onPress={() =>
                                            updateRow(row.key, {
                                                selected: !row.selected,
                                            })
                                        }
                                        style={styles.checkbox}
                                    >
                                        <MaterialIcons
                                            name={
                                                row.selected
                                                    ? 'check-box'
                                                    : 'check-box-outline-blank'
                                            }
                                            size={24}
                                            color={
                                                row.selected
                                                    ? '#5844BB'
                                                    : '#888'
                                            }
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.fields}>
                                        <TextInput
                                            style={styles.nameInput}
                                            value={row.name}
                                            onChangeText={(name) =>
                                                updateRow(row.key, { name })
                                            }
                                            placeholder="Tuotteen nimi"
                                        />
                                        <View style={styles.metaRow}>
                                            <TextInput
                                                style={styles.qtyInput}
                                                value={row.quantity}
                                                keyboardType="decimal-pad"
                                                onChangeText={(quantity) =>
                                                    updateRow(row.key, {
                                                        quantity,
                                                    })
                                                }
                                            />
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={
                                                    false
                                                }
                                            >
                                                {APP_UNITS.map((unit) => (
                                                    <TouchableOpacity
                                                        key={unit}
                                                        style={[
                                                            styles.unitChip,
                                                            row.unit ===
                                                                unit &&
                                                                styles.unitChipActive,
                                                        ]}
                                                        onPress={() =>
                                                            updateRow(row.key, {
                                                                unit,
                                                            })
                                                        }
                                                    >
                                                        <CustomText
                                                            style={
                                                                styles.unitChipText
                                                            }
                                                        >
                                                            {unit}
                                                        </CustomText>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                        <CustomText style={styles.hint}>
                                            Varmuus:{' '}
                                            {Math.round(
                                                (row.confidence || 0) * 100
                                            )}
                                            %
                                            {row.alreadyInPantry
                                                ? ' · Jo pentterissä'
                                                : ''}
                                            {row.notes ? ` · ${row.notes}` : ''}
                                        </CustomText>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </>
                )}

                <View style={styles.footer}>
                    <Button
                        title={
                            submitting
                                ? 'Lisätään...'
                                : `Lisää valitut pentteriin (${selectedCount})`
                        }
                        onPress={handleSubmit}
                        disabled={submitting || selectedCount === 0}
                        style={styles.submitButton}
                    />
                    {submitting ? (
                        <ActivityIndicator
                            color="#5844BB"
                            style={styles.spinner}
                        />
                    ) : null}
                </View>
            </View>
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 0,
    },
    usageText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    emptyText: {
        color: '#666',
        marginVertical: 20,
        textAlign: 'center',
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
        flexWrap: 'wrap',
    },
    toolbarLinks: {
        flexDirection: 'row',
        gap: 12,
    },
    countText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    link: {
        color: '#5844BB',
        fontWeight: '600',
    },
    list: {
        flex: 1,
        minHeight: 0,
    },
    listContent: {
        paddingBottom: 8,
        flexGrow: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 10,
        marginBottom: 8,
    },
    checkbox: {
        paddingTop: 6,
        marginRight: 8,
    },
    fields: {
        flex: 1,
    },
    nameInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 16,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    qtyInput: {
        width: 64,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 6,
        textAlign: 'center',
    },
    unitChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#e8e8e8',
        marginRight: 6,
    },
    unitChipActive: {
        backgroundColor: '#AE9CFC',
    },
    unitChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    hint: {
        marginTop: 6,
        fontSize: 12,
        color: '#666',
    },
    submitButton: {
        backgroundColor: '#AE9CFC',
    },
    footer: {
        paddingTop: 12,
        paddingBottom: 16,
    },
    spinner: {
        marginTop: 8,
    },
})

export default PantryScanReview
