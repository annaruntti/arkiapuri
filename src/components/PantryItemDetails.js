import { useEffect, useState } from 'react'
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { Feather, MaterialIcons } from '@expo/vector-icons'

import { getCategoryTree, getCategoryIdByName, toCategoryDisplayName } from '../utils/foodCategories'
import { resolveEntityKey } from '../utils/foodItemId'
import {
    confirmDeleteFoodItemImage,
    ensureCatalogFoodItemId,
    pickFoodItemImage,
    uploadFoodItemImage,
} from '../utils/foodItemImage'
import { getVisibleNutritionRows } from '../utils/nutritionFields'
import { useShowNutrition } from '../hooks/useShowNutrition'
import { getFoodItemImageUrl } from '../utils/openFoodFactsMapper'
import {
    inferLocationIdFromCategories,
    locationIdOf,
    syncStorageCategoryForLocation,
} from '../utils/pantryLocations'

import Button from './Button'
import CustomText from './CustomText'
import InlineCategorySelect from './InlineCategorySelect'
import FormDateField from './FormDateField'
import PantryItemOffSection from './PantryItemOffSection'
import ResponsiveModal from './ResponsiveModal'

const EMPTY_LOCATIONS = []
const categories = getCategoryTree()

const parsePriceInput = (value) => {
    const parsed = parseFloat(String(value ?? '').replace(',', '.'))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

const PantryItemDetails = ({
    item,
    visible,
    onClose,
    onUpdate,
    embedded = false,
    showInventoryFields = true,
    locations = EMPTY_LOCATIONS,
}) => {
    const [editableFields, setEditableFields] = useState({})
    const [editedValues, setEditedValues] = useState({})
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const showNutrition = useShowNutrition()

    const itemKey = resolveEntityKey(item)

    useEffect(() => {
        if (!item) return

        const categoryNames = (item.category || [])
            .map((entry) => toCategoryDisplayName(entry))
            .filter(Boolean)

        setEditedValues((prev) => {
            const prevKey = resolveEntityKey(prev)
            if (itemKey && prevKey === itemKey) {
                const inferredLocationId = inferLocationIdFromCategories(
                    prev.category,
                    locations
                )
                if (!prev.locationId && inferredLocationId) {
                    return { ...prev, locationId: inferredLocationId }
                }
                return prev
            }

            return {
                ...item,
                category: categoryNames,
                locationId:
                    locationIdOf(item) ||
                    inferLocationIdFromCategories(categoryNames, locations),
                expirationDate: item.expirationDateSetByUser
                    ? item.expirationDate
                    : null,
            }
        })
    }, [item, itemKey, locations])

    if (!item) return null

    const imageUrl = getFoodItemImageUrl(item)
    const off = item.openFoodFactsData || {}
    const nutritionRows = getVisibleNutritionRows(item)
    const caloriesValue =
        nutritionRows.find((row) => row.key === 'calories')?.value ??
        item.calories ??
        '0'

    const toggleEdit = (field) => {
        const opening = !editableFields[field]
        setEditableFields((prev) => ({
            ...prev,
            [field]: !prev[field],
        }))
        if (!opening) return
        if (field === 'price') {
            const current = parsePriceInput(editedValues.price ?? item.price)
            setEditedValues((prev) => ({
                ...prev,
                price: current > 0 ? String(current) : '',
            }))
            return
        }
        if (!editedValues[field]) {
            setEditedValues((prev) => ({
                ...prev,
                [field]: item[field],
            }))
        }
    }

    const handleChange = (field, value) => {
        setEditedValues((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleCategoryChange = (selectedItems) => {
        const categoryNames = (selectedItems || [])
            .map((entry) => toCategoryDisplayName(entry))
            .filter(Boolean)
        const inferredLocationId = inferLocationIdFromCategories(
            categoryNames,
            locations
        )
        setEditedValues((prev) => ({
            ...prev,
            category: categoryNames,
            ...(inferredLocationId ? { locationId: inferredLocationId } : {}),
        }))
    }

    const handleLocationChange = (locationId) => {
        const location = locations.find(
            (entry) => String(entry._id) === String(locationId)
        )
        setEditedValues((prev) => ({
            ...prev,
            locationId: locationId || null,
            category: location
                ? syncStorageCategoryForLocation(prev.category, location.type)
                : prev.category,
        }))
    }

    const handleSave = async () => {
        try {
            const categoryIds = (editedValues.category || []).map((name) =>
                getCategoryIdByName(name)
            )

            const parsedPrice = parsePriceInput(editedValues.price)
            const updatedValues = {
                ...editedValues,
                price: parsedPrice,
                category: categoryIds,
                locationId: editedValues.locationId || null,
                expirationDate: editedValues.expirationDate || null,
                expirationDateSetByUser: Boolean(editedValues.expirationDate),
            }

            await onUpdate(item._id, updatedValues)
            setEditableFields({})
        } catch (error) {
            console.error('Error saving updates:', error)
        }
    }

    const pickImage = async () => {
        const asset = await pickFoodItemImage({
            title: 'Valitse kuva',
            message: 'Valitse, miten haluat lisätä kuvan',
            cameraDenied: 'Tämä toiminto vaatii kameran käyttöoikeuden.',
            libraryDenied: 'Tämä toiminto vaatii kameran käyttöoikeuden.',
            cameraError: 'Kameran avaaminen epäonnistui',
            pickError: 'kuvan valitseminen epäonnistui',
        })
        if (!asset) return

        try {
            setIsUploadingImage(true)
            const foodItemId = await ensureCatalogFoodItemId(item)
            const foodItem = await uploadFoodItemImage(foodItemId, asset)
            onUpdate(item._id, {
                ...item,
                foodId: { ...foodItem },
                image: foodItem.image,
            })
        } catch (error) {
            console.error('Error uploading food item image:', error)
            if (error.message === 'Food item not found') {
                Alert.alert(
                    'Virhe',
                    'Tämä elintarvike ei ole enää olemassa. Päivitä varastosi ja yritä uudelleen.'
                )
            } else {
                Alert.alert(
                    'Virhe',
                    'Kuvien lataaminen epäonnistui: ' + error.message
                )
            }
        } finally {
            setIsUploadingImage(false)
        }
    }

    const removeFoodItemImage = async () => {
        const foodItemId = item.foodId?._id || item.foodId
        if (!foodItemId) return
        const removed = await confirmDeleteFoodItemImage(foodItemId)
        if (removed) {
            onUpdate(item._id, { ...item, image: null })
            Alert.alert('Success', 'Kuva poistettu onnistuneesti')
        }
    }

    const renderEditableField = (field, label, value, type = 'text') => {
        return (
            <View style={styles.detailRow}>
                <CustomText style={styles.label}>{label}:</CustomText>
                <View style={styles.valueContainer}>
                    {editableFields[field] ? (
                        <TextInput
                            style={styles.input}
                            value={String(editedValues[field])}
                            onChangeText={(text) => handleChange(field, text)}
                            keyboardType={
                                type === 'decimal'
                                    ? 'decimal-pad'
                                    : type === 'number'
                                      ? 'numeric'
                                      : 'default'
                            }
                            autoFocus
                            selectTextOnFocus
                        />
                    ) : (
                        <CustomText>{value}</CustomText>
                    )}
                    <TouchableOpacity
                        style={styles.editIcon}
                        onPress={() => toggleEdit(field)}
                    >
                        <Feather
                            name={editableFields[field] ? 'check' : 'edit-2'}
                            size={18}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const content = (
        <ScrollView
            style={[
                styles.detailScroll,
                embedded && styles.detailScrollEmbedded,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.itemDetails}>
                {imageUrl ? (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.itemImage}
                            resizeMode="cover"
                        />
                        <View style={styles.imageActions}>
                            <TouchableOpacity
                                style={styles.imageActionButton}
                                onPress={pickImage}
                                disabled={isUploadingImage}
                            >
                                <MaterialIcons
                                    name="edit"
                                    size={20}
                                    color="#5844BB"
                                />
                                <CustomText style={styles.imageActionText}>
                                    Change
                                </CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.imageActionButton}
                                onPress={removeFoodItemImage}
                                disabled={isUploadingImage}
                            >
                                <MaterialIcons
                                    name="delete"
                                    size={20}
                                    color="#ff4444"
                                />
                                <CustomText style={styles.imageActionText}>
                                    Remove
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.noImageContainer}>
                        <TouchableOpacity
                            style={styles.addImageButton}
                            onPress={pickImage}
                            disabled={isUploadingImage}
                        >
                            <MaterialIcons
                                name="add-a-photo"
                                size={40}
                                color="#5844BB"
                            />
                            <CustomText style={styles.addImageText}>
                                Add Image
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                )}
                {renderEditableField('name', 'Nimi', item.name)}
                {showInventoryFields
                    ? renderEditableField(
                          'quantity',
                          'Määrä',
                          item.quantity,
                          'number'
                      )
                    : null}
                {showInventoryFields
                    ? renderEditableField('unit', 'Yksikkö', item.unit)
                    : null}
                {!(parseFloat(item.price) > 0) &&
                parseFloat(item.priceEstimate) > 0 ? (
                    <CustomText style={styles.priceEstimateHint}>
                        Hinta-arvio: {Number(item.priceEstimate).toFixed(2)} €
                        {item.priceEstimateSource === 'history' &&
                        item.foodId?.priceSource === 'open-prices'
                            ? ' · Open Prices'
                            : ''}
                    </CustomText>
                ) : null}
                {renderEditableField(
                    'price',
                    'Hinta',
                    (() => {
                        const draft = parsePriceInput(editedValues.price)
                        const saved = parsePriceInput(item.price)
                        const visible = draft || saved
                        return visible > 0 ? `${visible} €` : 'Ei hintaa'
                    })(),
                    'decimal'
                )}

                {showInventoryFields && locations.length > 0 ? (
                    <View style={styles.categoryRow}>
                        <CustomText style={styles.label}>
                            Säilytyspaikka:
                        </CustomText>
                        <View style={styles.locationChips}>
                            <TouchableOpacity
                                style={[
                                    styles.locationChip,
                                    !editedValues.locationId &&
                                        styles.locationChipActive,
                                ]}
                                onPress={() => handleLocationChange(null)}
                            >
                                <CustomText style={styles.locationChipText}>
                                    Ei sijaintia
                                </CustomText>
                            </TouchableOpacity>
                            {locations.map((location) => {
                                const selected =
                                    String(editedValues.locationId || '') ===
                                    String(location._id)
                                return (
                                    <TouchableOpacity
                                        key={String(location._id)}
                                        style={[
                                            styles.locationChip,
                                            selected &&
                                                styles.locationChipActive,
                                        ]}
                                        onPress={() =>
                                            handleLocationChange(
                                                String(location._id)
                                            )
                                        }
                                    >
                                        <CustomText
                                            style={styles.locationChipText}
                                        >
                                            {location.name}
                                        </CustomText>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                ) : null}
                {showNutrition &&
                    renderEditableField(
                        'calories',
                        'Kalorit',
                        caloriesValue,
                        'number'
                    )}

                <PantryItemOffSection
                    showNutrition={showNutrition}
                    nutritionRows={nutritionRows}
                    off={off}
                />

                <View style={styles.categoryRow}>
                    <CustomText style={styles.label}>Kategoriat:</CustomText>
                    <InlineCategorySelect
                        value={editedValues.category || []}
                        onChange={handleCategoryChange}
                        categories={categories}
                        placeholder="Valitse kategoriat"
                    />
                </View>

                {showInventoryFields ? (
                    <FormDateField
                        label="Viimeinen käyttöpäivä"
                        value={editedValues.expirationDate || null}
                        onChange={(selectedDate) =>
                            handleChange('expirationDate', selectedDate)
                        }
                        onRemove={() => handleChange('expirationDate', null)}
                        placeholder="Ei asetettu"
                        style={styles.expirationDateField}
                        testID="pantryExpirationDate"
                    />
                ) : null}

                {Object.keys(editedValues).length > 0 && (
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Tallenna muutokset"
                            onPress={handleSave}
                            style={styles.saveButton}
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    )

    if (embedded) {
        return content
    }

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onClose}
            title="Elintarvikkeen tiedot"
            maxWidth={640}
        >
            {content}
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    priceEstimateHint: {
        textAlign: 'left',
        fontSize: 14,
        color: '#5844BB',
        marginBottom: 8,
    },
    detailScroll: {
        paddingTop: 20,
        paddingHorizontal: 20,
        ...(Platform.OS === 'web' && {
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '::-webkit-scrollbar': { display: 'none' },
        }),
    },
    detailScrollEmbedded: {
        paddingHorizontal: 0,
    },
    itemDetails: {
        paddingTop: 10,
    },
    imageContainer: {
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    noImageContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    itemImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    imageActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    imageActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        gap: 5,
    },
    imageActionText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    addImageButton: {
        borderWidth: 2,
        borderColor: '#5844BB',
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        width: '100%',
    },
    addImageText: {
        marginTop: 8,
        color: '#5844BB',
        fontSize: 16,
        fontWeight: '500',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    categoryRow: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 8,
    },
    expirationDateField: {
        marginTop: 4,
        marginBottom: 8,
    },
    locationChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    locationChip: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: '#eee',
    },
    locationChipActive: {
        backgroundColor: '#AE9CFC',
    },
    locationChipText: {
        fontSize: 13,
        fontWeight: '600',
    },
    label: {
        fontWeight: 'bold',
        flex: 1,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
        justifyContent: 'flex-end',
    },
    editIcon: {
        padding: 5,
        marginLeft: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#5844BB',
        padding: 2,
        minWidth: 50,
        textAlign: 'right',
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#AE9CFC',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        minWidth: 200,
        width: '100%',
    },
})

export default PantryItemDetails
