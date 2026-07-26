import { useEffect, useRef, useState } from 'react'
import {
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'

/**
 * K-Ruoka-style quantity chip: tap to open + / − / delete controls.
 */
const ShoppingListItemQuantityControl = ({
    quantity = 1,
    unit = 'kpl',
    disabled = false,
    onIncrease,
    onDecrease,
    onDelete,
}) => {
    const [open, setOpen] = useState(false)
    const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 })
    const buttonRef = useRef(null)
    const displayQty = Number(quantity) || 0

    useEffect(() => {
        if (disabled) setOpen(false)
    }, [disabled])

    const openMenu = () => {
        if (disabled) return
        buttonRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x, y, width, height })
            setOpen(true)
        })
    }

    const closeMenu = () => setOpen(false)

    const handleIncrease = () => {
        onIncrease?.()
    }

    const handleDecrease = () => {
        if (displayQty <= 1) {
            closeMenu()
            onDelete?.()
            return
        }
        onDecrease?.()
    }

    const handleDelete = () => {
        closeMenu()
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
                accessibilityLabel={`Määrä ${displayQty} ${unit}. Avaa määrän muokkaus.`}
            >
                <CustomText style={styles.qtyButtonText}>
                    {displayQty} {unit}
                </CustomText>
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={closeMenu}
            >
                <Pressable style={styles.backdrop} onPress={closeMenu}>
                    <View
                        style={[
                            styles.menu,
                            {
                                top: menuTop,
                                right: menuRight,
                            },
                        ]}
                        // Prevent backdrop press when tapping the menu
                        onStartShouldSetResponder={() => true}
                    >
                        <CustomText style={styles.menuTitle}>
                            {displayQty} {unit}
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

                            <CustomText style={styles.menuQty}>
                                {displayQty}
                            </CustomText>

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
                </Pressable>
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
        backgroundColor: '#9C86FC',
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
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    menu: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        minWidth: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
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
        gap: 8,
    },
    menuIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuQty: {
        fontSize: 18,
        fontWeight: '700',
        minWidth: 28,
        textAlign: 'center',
        color: '#333',
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
