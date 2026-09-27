import { useEffect, useState } from 'react'
import {
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import { FOOD_PLACEHOLDER_IMAGE_URL } from '../constants/images'
import { getFoodItemImageUrl } from '../utils/openFoodFactsMapper'

const itemIdOf = (item) => {
    if (!item) return ''
    const candidate = item._id ?? item.id
    if (candidate == null) return ''
    if (typeof candidate === 'object') {
        if (candidate.$oid) return String(candidate.$oid)
        if (candidate._id != null) return itemIdOf({ _id: candidate._id })
    }
    return String(candidate)
}

const parsePriceInput = (value) => {
    const parsed = parseFloat(String(value ?? '').replace(',', '.'))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

/**
 * Lets the user fill missing shopping-list prices inline.
 * Image opens full product details; the row itself does not.
 */
const MissingPriceItemsPanel = ({
    items = [],
    onSavePrice,
    onOpenDetails,
    onClose,
}) => {
    const [drafts, setDrafts] = useState({})
    const [savingId, setSavingId] = useState(null)

    useEffect(() => {
        const validIds = new Set(items.map(itemIdOf).filter(Boolean))
        setDrafts((prev) => {
            const next = {}
            for (const [id, value] of Object.entries(prev)) {
                if (validIds.has(id)) next[id] = value
            }
            return next
        })
    }, [items])

    const handleSave = async (item) => {
        const id = itemIdOf(item)
        if (!id || savingId === id) return
        const price = parsePriceInput(drafts[id])
        if (!(price > 0)) return
        setSavingId(id)
        try {
            await onSavePrice(item, price)
            setDrafts((prev) => {
                const next = { ...prev }
                delete next[id]
                return next
            })
        } finally {
            setSavingId(null)
        }
    }

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <CustomText style={styles.hint}>
                Lisää hinta suoraan riville. Tuotteen kuvaa napauttamalla
                avautuvat kaikki tiedot.
            </CustomText>
            {items.length === 0 ? (
                <CustomText style={styles.empty}>
                    Kaikilla tuotteilla on nyt hinta-arvio.
                </CustomText>
            ) : (
                items.map((item) => {
                    const id = itemIdOf(item)
                    const quantityLabel =
                        `${item.quantity ?? ''} ${item.unit || ''}`.trim()
                    const imageUri =
                        getFoodItemImageUrl(item) || FOOD_PLACEHOLDER_IMAGE_URL
                    return (
                        <View key={id} style={styles.row}>
                            <TouchableOpacity
                                onPress={() => onOpenDetails?.(item)}
                                accessibilityRole="button"
                                accessibilityLabel="Avaa tuotteen tiedot"
                                style={styles.imageButton}
                            >
                                <Image
                                    source={{ uri: imageUri }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>
                            <View style={styles.meta}>
                                <CustomText
                                    style={styles.name}
                                    numberOfLines={2}
                                >
                                    {item.name}
                                </CustomText>
                                {quantityLabel ? (
                                    <CustomText
                                        style={styles.quantity}
                                        numberOfLines={1}
                                    >
                                        {quantityLabel}
                                    </CustomText>
                                ) : null}
                            </View>
                            <View style={styles.priceField}>
                                <TextInput
                                    style={styles.priceInput}
                                    value={drafts[id] ?? ''}
                                    onChangeText={(value) =>
                                        setDrafts((prev) => ({
                                            ...prev,
                                            [id]: value,
                                        }))
                                    }
                                    onBlur={() => handleSave(item)}
                                    onSubmitEditing={() => handleSave(item)}
                                    keyboardType="decimal-pad"
                                    placeholder="0,00"
                                    placeholderTextColor="#999"
                                    returnKeyType="done"
                                    editable={savingId !== id}
                                />
                                <CustomText style={styles.currency}>€</CustomText>
                            </View>
                        </View>
                    )
                })
            )}
            <Button
                title="Valmis"
                type="PRIMARY"
                onPress={onClose}
                style={styles.doneButton}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scroll: {
        maxHeight: 520,
        width: '100%',
    },
    content: {
        paddingBottom: 24,
        paddingRight: 8,
        gap: 4,
    },
    hint: {
        textAlign: 'left',
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        marginBottom: 12,
        flexShrink: 1,
    },
    empty: {
        textAlign: 'left',
        fontSize: 15,
        lineHeight: 22,
        color: '#666',
        marginVertical: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 10,
    },
    imageButton: {
        flexShrink: 0,
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    meta: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
    },
    name: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1f2937',
        lineHeight: 20,
    },
    quantity: {
        marginTop: 2,
        fontSize: 13,
        color: '#666',
    },
    priceField: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        gap: 4,
    },
    priceInput: {
        width: 72,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 8,
        fontSize: 16,
        textAlign: 'right',
        backgroundColor: '#fff',
        color: '#111',
    },
    currency: {
        fontSize: 15,
        color: '#333',
        width: 14,
    },
    doneButton: {
        marginTop: 16,
        alignSelf: 'stretch',
    },
})

export default MissingPriceItemsPanel
