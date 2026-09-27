import { useEffect, useState } from 'react'
import {
    Alert,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import { APP_UNITS, resolveAppUnit } from '../utils/units'

const parsePriceInput = (value) => {
    const parsed = parseFloat(String(value ?? '').replace(',', '.'))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

/**
 * Shown after a shopping-list barcode scan so the found product can be
 * checked, renamed, or rejected before it is saved.
 */
const BarcodeProductReview = ({
    product,
    onConfirm,
    onRescan,
    onCancel,
}) => {
    const [name, setName] = useState(product?.name || '')
    const [quantity, setQuantity] = useState(String(product?.quantity || 1))
    const [unit, setUnit] = useState(resolveAppUnit(product?.unit))
    const [calories, setCalories] = useState(
        product?.calories > 0 ? String(product.calories) : ''
    )
    const [price, setPrice] = useState(
        parsePriceInput(product?.price) > 0
            ? String(product.price)
            : ''
    )
    const [priceIsEstimate, setPriceIsEstimate] = useState(
        Boolean(product?.priceIsEstimate)
    )
    const [priceEditing, setPriceEditing] = useState(
        parsePriceInput(product?.price) > 0
    )
    const [priceTouched, setPriceTouched] = useState(false)
    const [unitMenuOpen, setUnitMenuOpen] = useState(false)

    useEffect(() => {
        setName(product?.name || '')
        setQuantity(String(product?.quantity || 1))
        setUnit(resolveAppUnit(product?.unit))
        setCalories(product?.calories > 0 ? String(product.calories) : '')
        setUnitMenuOpen(false)
        setPriceTouched(false)
        const amount = parsePriceInput(product?.price)
        setPrice(amount > 0 ? String(amount) : '')
        setPriceIsEstimate(Boolean(product?.priceIsEstimate && amount > 0))
        setPriceEditing(amount > 0)
    }, [product?.barcode])

    useEffect(() => {
        if (priceTouched) return
        const amount = parsePriceInput(product?.price)
        if (!(amount > 0)) return
        setPrice(String(amount))
        setPriceIsEstimate(Boolean(product?.priceIsEstimate))
        setPriceEditing(true)
    }, [product?.price, product?.priceIsEstimate, priceTouched])

    const handlePriceChange = (value) => {
        setPriceTouched(true)
        setPriceIsEstimate(false)
        setPrice(value)
    }

    const handleConfirm = () => {
        const trimmed = name.trim()
        const parsed = parseFloat(String(quantity).replace(',', '.'))
        const parsedCalories = parseFloat(String(calories).replace(',', '.'))
        const parsedPrice = parsePriceInput(price)
        if (!trimmed) {
            Alert.alert('Nimi puuttuu', 'Anna tuotteelle nimi ennen lisäämistä.')
            return
        }
        if (!Number.isFinite(parsed) || parsed <= 0) {
            Alert.alert('Määrä puuttuu', 'Syötä lisättävä määrä.')
            return
        }
        onConfirm({
            name: trimmed,
            quantity: parsed,
            unit: resolveAppUnit(unit),
            calories:
                Number.isFinite(parsedCalories) && parsedCalories > 0
                    ? parsedCalories
                    : 0,
            category: product?.category || [],
            price: parsedPrice,
            priceIsEstimate: priceIsEstimate && parsedPrice > 0,
        })
    }

    const categoryLabel = Array.isArray(product?.category)
        ? product.category.filter(Boolean).join(', ')
        : ''

    return (
        <View style={styles.page}>
            <CustomText style={styles.hint}>
                Tarkista tuotteen tiedot ennen ostoslistaan lisäämistä.
            </CustomText>
            {product?.imageUrl ? (
                <Image
                    source={{ uri: product.imageUrl }}
                    style={styles.image}
                    resizeMode="contain"
                />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <CustomText style={styles.placeholderText}>
                        Ei kuvaa
                    </CustomText>
                </View>
            )}
            <CustomText style={styles.label}>Nimi</CustomText>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Tuotteen nimi"
                placeholderTextColor="#999"
            />
            {product?.brands ? (
                <CustomText style={styles.meta}>
                    Merkki: {product.brands}
                </CustomText>
            ) : null}
            {product?.barcode ? (
                <CustomText style={styles.meta}>
                    Viivakoodi: {product.barcode}
                </CustomText>
            ) : null}
            {product?.quantityLabel ? (
                <CustomText style={styles.meta}>
                    Pakkaus: {product.quantityLabel}
                </CustomText>
            ) : null}
            {categoryLabel ? (
                <CustomText style={styles.meta}>
                    Kategoria: {categoryLabel}
                </CustomText>
            ) : null}
            <CustomText style={styles.label}>Määrä</CustomText>
            <View style={styles.quantityRow}>
                <TextInput
                    style={[styles.input, styles.quantityInput]}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor="#999"
                />
                <TouchableOpacity
                    style={styles.unitSelectButton}
                    onPress={() => setUnitMenuOpen((open) => !open)}
                    activeOpacity={0.7}
                >
                    <CustomText style={styles.unitSelectText}>{unit}</CustomText>
                </TouchableOpacity>
            </View>
            {unitMenuOpen ? (
                <View style={styles.unitMenu}>
                    {APP_UNITS.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.unitOption}
                            onPress={() => {
                                setUnit(option)
                                setUnitMenuOpen(false)
                            }}
                        >
                            <CustomText
                                style={
                                    option === unit
                                        ? styles.unitOptionSelected
                                        : styles.unitOptionText
                                }
                            >
                                {option}
                            </CustomText>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : null}
            <CustomText style={styles.label}>Kalorit (kcal)</CustomText>
            <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#999"
            />
            <CustomText style={styles.label}>Hinta</CustomText>
            {priceEditing ? (
                <View>
                    <TextInput
                        style={styles.input}
                        value={price}
                        onChangeText={handlePriceChange}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor="#999"
                    />
                    {priceIsEstimate && parsePriceInput(price) > 0 ? (
                        <CustomText style={styles.estimateHint}>
                            Arvio aiemman hinnan perusteella. Voit muokata.
                        </CustomText>
                    ) : null}
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.addPriceButton}
                    onPress={() => setPriceEditing(true)}
                    activeOpacity={0.7}
                >
                    <CustomText style={styles.addPriceText}>
                        Lisää hinta
                    </CustomText>
                </TouchableOpacity>
            )}
            <Button
                title="Lisää ostoslistalle"
                type="PRIMARY"
                onPress={handleConfirm}
                style={styles.primaryButton}
            />
            <Button
                title="Skannaa uudelleen"
                type="SECONDARY"
                onPress={onRescan}
                style={styles.followingButton}
            />
            <Button
                title="Peruuta"
                type="TERTIARY"
                onPress={onCancel}
                style={styles.followingButton}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    page: {
        paddingBottom: 12,
    },
    hint: {
        textAlign: 'left',
        fontSize: 15,
        marginBottom: 12,
        color: '#333',
    },
    image: {
        width: '100%',
        height: 160,
        marginBottom: 12,
        backgroundColor: '#f6f6f6',
        borderRadius: 8,
    },
    imagePlaceholder: {
        width: '100%',
        height: 120,
        marginBottom: 12,
        borderRadius: 8,
        backgroundColor: '#f3f0ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        color: '#666',
    },
    label: {
        textAlign: 'left',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        marginTop: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    meta: {
        textAlign: 'left',
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
    },
    quantityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    quantityInput: {
        flex: 1,
        marginBottom: 0,
    },
    unitSelectButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#fff',
        minWidth: 72,
        alignItems: 'center',
    },
    unitSelectText: {
        fontSize: 16,
    },
    unitMenu: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    unitOption: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#f3f0ff',
    },
    unitOptionText: {
        fontSize: 14,
    },
    unitOptionSelected: {
        fontSize: 14,
        fontWeight: '700',
        color: '#5844BB',
    },
    estimateHint: {
        textAlign: 'left',
        fontSize: 13,
        color: '#666',
        marginTop: -6,
        marginBottom: 8,
    },
    addPriceButton: {
        borderWidth: 1,
        borderColor: '#5844BB',
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 10,
        alignItems: 'center',
        backgroundColor: '#f8f6ff',
    },
    addPriceText: {
        color: '#5844BB',
        fontSize: 15,
        fontWeight: '600',
    },
    primaryButton: {
        marginTop: 16,
    },
    followingButton: {
        marginTop: 8,
    },
})

export default BarcodeProductReview
