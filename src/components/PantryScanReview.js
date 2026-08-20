import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Keyboard,
    Platform,
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
import { lookupFoodItemsByName } from '../services/foodItemApi'

const NAME_LOOKUP_DELAY_MS = 450

const SOURCE_LABELS = {
    catalog: 'Omasta tietokannasta',
    openfoodfacts: 'Open Food Facts',
    inferred: null,
}

const formatNumber = (value) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return ''
    return String(Math.round(parsed * 10) / 10).replace('.', ',')
}

const formatNutritionLine = (nutrition, calories) => {
    const kcal = nutrition?.calories ?? calories
    if (!kcal) return null
    const parts = [`${Math.round(kcal)} kcal / 100 g`]
    if (nutrition?.proteins) {
        parts.push(`P ${formatNumber(nutrition.proteins)} g`)
    }
    if (nutrition?.carbohydrates) {
        parts.push(`H ${formatNumber(nutrition.carbohydrates)} g`)
    }
    if (nutrition?.fat) {
        parts.push(`R ${formatNumber(nutrition.fat)} g`)
    }
    return parts.join(' · ')
}

const mapScanItemToRow = (item, index) => ({
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
    calories: item.calories,
    nutrition: item.nutrition,
    matchSource: item.matchSource,
    matchName: item.matchName,
    barcode: item.barcode,
    lookingUp:
        String(item.name || '').trim().length >= 2 &&
        !(item.calories || item.nutrition?.calories),
})

const applyLookupResult = (row, result) => {
    if (!result) return { ...row, lookingUp: false }
    return {
        ...row,
        lookingUp: false,
        category: result.category?.length ? result.category : row.category,
        calories: result.calories ?? row.calories,
        nutrition: result.nutrition ?? row.nutrition,
        foodId: result.source === 'catalog' ? result.foodId : null,
        matchSource: result.source,
        matchName: result.matchName,
        barcode: result.barcode,
    }
}

const PantryScanReview = ({
    visible,
    onClose,
    items = [],
    usage,
    submitting = false,
    onSubmit,
}) => {
    const [rows, setRows] = useState([])
    const [keyboardHeight, setKeyboardHeight] = useState(0)
    const scrollRef = useRef(null)
    const rowOffsets = useRef({})
    const focusedRowKey = useRef(null)
    const nameLookupTimers = useRef({})
    const nameLookupToken = useRef({})
    const batchLookupToken = useRef(0)

    const scrollFocusedRowIntoView = useCallback(() => {
        const key = focusedRowKey.current
        const offset = key != null ? rowOffsets.current[key] : null
        if (typeof offset !== 'number' || !scrollRef.current) return
        scrollRef.current.scrollTo({
            y: Math.max(0, offset - 8),
            animated: true,
        })
    }, [])

    useEffect(() => {
        if (Platform.OS === 'web') return undefined

        const onShow = (event) => {
            setKeyboardHeight(event.endCoordinates?.height ?? 0)
        }
        const onShown = (event) => {
            setKeyboardHeight(event.endCoordinates?.height ?? 0)
            requestAnimationFrame(() => {
                setTimeout(scrollFocusedRowIntoView, 50)
            })
        }
        const onHide = () => setKeyboardHeight(0)

        const shown = Keyboard.addListener('keyboardDidShow', onShown)
        const willShow =
            Platform.OS === 'ios'
                ? Keyboard.addListener('keyboardWillShow', onShow)
                : null
        const hidden = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            onHide
        )

        return () => {
            shown.remove()
            willShow?.remove()
            hidden.remove()
        }
    }, [scrollFocusedRowIntoView])

    const handleRowFocus = (key) => {
        focusedRowKey.current = key
        if (keyboardHeight > 0) {
            requestAnimationFrame(scrollFocusedRowIntoView)
        }
    }

    const clearNameLookupTimers = () => {
        Object.values(nameLookupTimers.current).forEach((timer) =>
            clearTimeout(timer)
        )
        nameLookupTimers.current = {}
    }

    const scheduleNameLookup = (key, name) => {
        clearTimeout(nameLookupTimers.current[key])
        const trimmed = String(name || '').trim()
        if (trimmed.length < 2) {
            updateRow(key, { lookingUp: false })
            return
        }
        const token = Date.now()
        nameLookupToken.current[key] = token
        nameLookupTimers.current[key] = setTimeout(async () => {
            try {
                const results = await lookupFoodItemsByName([trimmed])
                if (nameLookupToken.current[key] !== token) return
                const result = results[0]
                setRows((prev) =>
                    prev.map((row) =>
                        row.key === key && row.name.trim() === trimmed
                            ? applyLookupResult(row, result)
                            : row
                    )
                )
            } catch (error) {
                if (nameLookupToken.current[key] !== token) return
                updateRow(key, { lookingUp: false })
            }
        }, NAME_LOOKUP_DELAY_MS)
    }

    const handleNameChange = (key, name) => {
        updateRow(key, {
            name,
            foodId: undefined,
            matchSource: undefined,
            barcode: undefined,
            lookingUp: String(name || '').trim().length >= 2,
        })
        scheduleNameLookup(key, name)
    }

    useEffect(() => {
        if (!visible) {
            setKeyboardHeight(0)
            focusedRowKey.current = null
            clearNameLookupTimers()
            return undefined
        }
        const nextRows = (items || []).map(mapScanItemToRow)
        setRows(nextRows)
        const names = nextRows
            .map((row) => row.name.trim())
            .filter((name) => name.length >= 2)
        if (!names.length) return undefined

        const token = ++batchLookupToken.current
        lookupFoodItemsByName(names)
            .then((results) => {
                if (batchLookupToken.current !== token) return
                const byQuery = new Map(
                    (results || []).map((result) => [
                        String(result.query || '')
                            .trim()
                            .toLowerCase(),
                        result,
                    ])
                )
                setRows((prev) =>
                    prev.map((row) => {
                        const result = byQuery.get(row.name.trim().toLowerCase())
                        return result
                            ? applyLookupResult(row, result)
                            : { ...row, lookingUp: false }
                    })
                )
            })
            .catch(() => {
                if (batchLookupToken.current !== token) return
                setRows((prev) =>
                    prev.map((row) => ({ ...row, lookingUp: false }))
                )
            })

        return () => clearNameLookupTimers()
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
                calories: row.calories,
                nutrition: row.nutrition,
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
            <View
                style={[
                    styles.container,
                    keyboardHeight > 0 && {
                        paddingBottom: keyboardHeight,
                    },
                ]}
            >
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
                            ref={scrollRef}
                            style={styles.list}
                            contentContainerStyle={[
                                styles.listContent,
                                keyboardHeight > 0 && {
                                    paddingBottom: 24,
                                },
                            ]}
                            nestedScrollEnabled
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="interactive"
                        >
                            {rows.map((row) => (
                                <View
                                    key={row.key}
                                    style={styles.row}
                                    onLayout={(event) => {
                                        rowOffsets.current[row.key] =
                                            event.nativeEvent.layout.y
                                    }}
                                >
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
                                                handleNameChange(row.key, name)
                                            }
                                            placeholder="Tuotteen nimi"
                                            onFocus={() =>
                                                handleRowFocus(row.key)
                                            }
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
                                                onFocus={() =>
                                                    handleRowFocus(row.key)
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
                                        {row.lookingUp ? (
                                            <View style={styles.lookupRow}>
                                                <ActivityIndicator
                                                    size="small"
                                                    color="#5844BB"
                                                />
                                                <CustomText
                                                    style={styles.metaText}
                                                >
                                                    Haetaan tuotetietoja…
                                                </CustomText>
                                            </View>
                                        ) : (
                                            <>
                                                {row.category?.length ? (
                                                    <CustomText
                                                        style={styles.metaText}
                                                    >
                                                        {row.category.join(
                                                            ', '
                                                        )}
                                                    </CustomText>
                                                ) : null}
                                                {formatNutritionLine(
                                                    row.nutrition,
                                                    row.calories
                                                ) ? (
                                                    <CustomText
                                                        style={styles.metaText}
                                                    >
                                                        {formatNutritionLine(
                                                            row.nutrition,
                                                            row.calories
                                                        )}
                                                    </CustomText>
                                                ) : null}
                                                {SOURCE_LABELS[
                                                    row.matchSource
                                                ] ? (
                                                    <CustomText
                                                        style={
                                                            styles.sourceText
                                                        }
                                                    >
                                                        {
                                                            SOURCE_LABELS[
                                                                row.matchSource
                                                            ]
                                                        }
                                                        {row.matchName &&
                                                        row.matchName !==
                                                            row.name
                                                            ? ` · ${row.matchName}`
                                                            : ''}
                                                    </CustomText>
                                                ) : null}
                                            </>
                                        )}
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
    lookupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 6,
    },
    metaText: {
        marginTop: 4,
        fontSize: 12,
        color: '#444',
    },
    sourceText: {
        marginTop: 2,
        fontSize: 11,
        color: '#5844BB',
        fontWeight: '600',
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
