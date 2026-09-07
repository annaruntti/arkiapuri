import { useEffect, useRef, useState } from 'react'
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import UnitSelect from './UnitSelect'
import { resolveAppUnit } from '../utils/units'

const formatQuantity = (value) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return '0'
    return String(num).replace('.', ',')
}

const parseQuantity = (value) =>
    parseFloat(String(value).trim().replace(',', '.'))

/**
 * Quantity chip: tap to open + / − / typed amount / unit / delete controls.
 */
const ShoppingListItemQuantityControl = ({
    quantity = 1,
    unit = 'kpl',
    disabled = false,
    onChange,
    onDelete,
}) => {
    const displayQty = Number(quantity) || 0
    const displayUnit = resolveAppUnit(unit)
    const [open, setOpen] = useState(false)
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(formatQuantity(quantity))
    const [draftUnit, setDraftUnit] = useState(displayUnit)
    const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 })
    const buttonRef = useRef(null)
    const inputRef = useRef(null)

    useEffect(() => {
        if (!disabled) return
        setOpen(false)
    }, [disabled])

    useEffect(() => {
        if (editing) return
        const next = formatQuantity(displayQty)
        setDraft((prev) => (prev === next ? prev : next))
    }, [displayQty, editing])

    useEffect(() => {
        if (open) return
        setDraftUnit((prev) => (prev === displayUnit ? prev : displayUnit))
    }, [displayUnit, open])

    const openMenu = () => {
        if (disabled) return
        setEditing(false)
        setDraft(formatQuantity(displayQty))
        setDraftUnit(displayUnit)
        buttonRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x, y, width, height })
            setOpen(true)
        })
    }

    const emitChange = (nextQuantity, nextUnit) => {
        const quantityChanged =
            nextQuantity !== undefined && nextQuantity !== displayQty
        const unitChanged =
            nextUnit !== undefined && nextUnit !== displayUnit
        if (!quantityChanged && !unitChanged) return
        onChange?.({
            quantity: quantityChanged ? nextQuantity : undefined,
            unit: unitChanged ? nextUnit : undefined,
        })
    }

    const closeMenu = () => {
        commitDraft({ close: true })
    }

    const commitDraft = ({ close = false } = {}) => {
        const parsed = parseQuantity(draft)
        setEditing(false)
        if (!Number.isFinite(parsed)) {
            setDraft(formatQuantity(displayQty))
        } else if (parsed <= 0) {
            setOpen(false)
            onDelete?.()
            return
        } else {
            emitChange(parsed, draftUnit)
            setDraft(formatQuantity(parsed))
        }
        if (close) {
            setOpen(false)
        }
    }

    const applyQuantity = (next) => {
        setEditing(false)
        if (!Number.isFinite(next) || next <= 0) {
            setOpen(false)
            onDelete?.()
            return
        }
        setDraft(formatQuantity(next))
        emitChange(next, draftUnit)
    }

    const handleIncrease = () => {
        const base = editing ? parseQuantity(draft) : displayQty
        const current = Number.isFinite(base) ? base : displayQty
        applyQuantity(current + 1)
    }

    const handleDecrease = () => {
        const base = editing ? parseQuantity(draft) : displayQty
        const current = Number.isFinite(base) ? base : displayQty
        if (current <= 1) {
            setOpen(false)
            onDelete?.()
            return
        }
        applyQuantity(current - 1)
    }

    const handleSelectUnit = (nextUnit) => {
        setDraftUnit(nextUnit)
        const parsed = editing ? parseQuantity(draft) : displayQty
        const current = Number.isFinite(parsed) && parsed > 0 ? parsed : displayQty
        emitChange(current, nextUnit)
    }

    const handleDelete = () => {
        setEditing(false)
        setOpen(false)
        onDelete?.()
    }

    const menuTop = anchor.y + anchor.height + 6
    const menuRight = Math.max(8, 8)

    return (
        <>
            <TouchableOpacity
                ref={buttonRef}
                style={[styles.qtyButton, disabled && styles.qtyButtonDisabled]}
                onPress={openMenu}
                disabled={disabled}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={`Määrä ${displayQty} ${displayUnit}. Avaa määrän muokkaus.`}
            >
                <CustomText style={styles.qtyButtonText}>
                    {formatQuantity(displayQty)} {displayUnit}
                </CustomText>
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={closeMenu}
            >
                <View style={styles.overlay} pointerEvents="box-none">
                    <Pressable
                        style={styles.backdrop}
                        onPress={closeMenu}
                        accessibilityLabel="Sulje määrän muokkaus"
                    />
                    <View
                        style={[
                            styles.menu,
                            {
                                top: menuTop,
                                right: menuRight,
                            },
                        ]}
                    >
                        <CustomText style={styles.menuTitle}>
                            Muokkaa määrää ja yksikköä
                        </CustomText>
                        <View style={styles.menuRow}>
                            <TouchableOpacity
                                style={styles.menuIconButton}
                                onPress={handleDecrease}
                                accessibilityLabel={
                                    displayQty <= 1
                                        ? 'Poista tuote'
                                        : 'Vähennä määrää'
                                }
                            >
                                <MaterialIcons
                                    name={
                                        displayQty <= 1
                                            ? 'delete-outline'
                                            : 'remove'
                                    }
                                    size={22}
                                    color="#333"
                                />
                            </TouchableOpacity>

                            <TextInput
                                ref={inputRef}
                                style={styles.menuQtyInput}
                                value={draft}
                                onChangeText={(text) => {
                                    setEditing(true)
                                    setDraft(text)
                                }}
                                onFocus={() => setEditing(true)}
                                onSubmitEditing={() =>
                                    commitDraft({ close: true })
                                }
                                keyboardType="decimal-pad"
                                selectTextOnFocus
                                returnKeyType="done"
                                accessibilityLabel="Muokkaa määrää"
                            />

                            <View style={styles.unitSelectSlot}>
                                <UnitSelect
                                    value={draftUnit}
                                    onChange={handleSelectUnit}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.menuIconButton}
                                onPress={handleIncrease}
                                accessibilityLabel="Lisää määrää"
                            >
                                <MaterialIcons
                                    name="add"
                                    size={22}
                                    color="#333"
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.deleteRow}
                            onPress={handleDelete}
                        >
                            <MaterialIcons
                                name="delete-outline"
                                size={18}
                                color="#B00020"
                            />
                            <CustomText style={styles.deleteText}>
                                Poista listalta
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    qtyButton: {
        minWidth: 40,
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 18,
        backgroundColor: '#AE9CFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    qtyButtonDisabled: {
        backgroundColor: '#bbb',
    },
    qtyButtonText: {
        color: '#000000',
        fontWeight: '700',
        fontSize: 13,
    },
    overlay: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    menu: {
        position: 'absolute',
        zIndex: 2,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        minWidth: 250,
        overflow: 'visible',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
        ...(Platform.OS === 'web' && { overflow: 'visible' }),
    },
    menuTitle: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        zIndex: 2,
        ...(Platform.OS === 'web' && { overflow: 'visible' }),
    },
    menuIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuQtyInput: {
        minWidth: 52,
        maxWidth: 72,
        height: 40,
        borderWidth: 1,
        borderColor: '#5844BB',
        borderRadius: 8,
        paddingHorizontal: 8,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        color: '#333',
        backgroundColor: '#fff',
        ...(Platform.OS === 'web' && {
            outlineStyle: 'none',
            outlineWidth: 0,
        }),
    },
    unitSelectSlot: {
        width: 48,
        height: 40,
        zIndex: 3,
        ...(Platform.OS === 'web' && { overflow: 'visible' }),
    },
    deleteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    deleteText: {
        color: '#B00020',
        fontWeight: '600',
        fontSize: 14,
    },
})

export default ShoppingListItemQuantityControl
