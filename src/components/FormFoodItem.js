import axios from 'axios'
import { forwardRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useShowNutrition } from '../hooks/useShowNutrition'
import { getCategoryTree } from '../utils/foodCategories'
import {
    pickFoodItemImage,
    uploadFoodItemImage,
} from '../utils/foodItemImage'
import {
    buildFoodItemFormPayload,
    toCatalogFoodItemPayload,
} from '../utils/foodItemForm'
import {
    getInitialNutritionValue,
    hasAnyInitialNutrition,
} from '../utils/nutritionFields'
import { useResponsiveDimensions } from '../utils/responsive'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import CustomRadioButton from './CustomRadioButton'
import Button from './Button'
import CustomText from './CustomText'
import FormDateField from './FormDateField'
import CustomInput from './CustomInput'
import FoodItemNutritionFields from './FoodItemNutritionFields'
import FormFoodItemLocationTargets from './FormFoodItemLocationTargets'
import InlineCategorySelect from './InlineCategorySelect'
import UnifiedFoodSearch from './UnifiedFoodSearch'
import UnitSelect from './UnitSelect'
import { formStyles } from '../styles/formStyles'

const FormFoodItem = forwardRef(
    (
        {
            onSubmit,
            onClose,
            location = 'meal',
            showLocationSelector = false,
            shoppingLists = [],
            selectedShoppingListId,
            onShoppingListSelect,
            initialValues = {},
            showUnifiedSearch = false,
            onSearchItemSelect,
            shoppingListId,
            allowNonFood = false,
            showBackButton = false,
        },
        ref
    ) => {
        const { isDesktop } = useResponsiveDimensions()
        const showNutrition = useShowNutrition()
        const [nutritionExpanded, setNutritionExpanded] = useState(
            hasAnyInitialNutrition(initialValues)
        )
        const [unitMenuOpen, setUnitMenuOpen] = useState(false)
        const [date, setDate] = useState(
            initialValues.expirationDate
                ? new Date(initialValues.expirationDate)
                : null
        )
        const [selectedLocations, setSelectedLocations] = useState(['meal'])
        const [quantities, setQuantities] = useState({
            meal: '',
            'shopping-list': '',
            pantry: '',
        })
        const [foodItemImage, setFoodItemImage] = useState(null)

        const {
            control,
            handleSubmit,
            register,
            formState: { errors },
            reset,
            watch,
            setValue,
        } = useForm({
            defaultValues: {
                isFood:
                    initialValues.isFood === false
                        ? false
                        : initialValues.isFood === true
                          ? true
                          : true,
                name: initialValues.name || '',
                category: initialValues.category || [],
                quantity: initialValues.quantity || '',
                price: initialValues.price || '0',
                expirationDate: initialValues.expirationDate
                    ? new Date(initialValues.expirationDate)
                    : undefined,
                location: location,
                unit: initialValues.unit || 'kpl',
                calories: String(
                    getInitialNutritionValue(initialValues, 'calories') || ''
                ),
                proteins: String(
                    getInitialNutritionValue(initialValues, 'proteins') || ''
                ),
                carbohydrates: String(
                    getInitialNutritionValue(initialValues, 'carbohydrates') ||
                        ''
                ),
                sugars: String(
                    getInitialNutritionValue(initialValues, 'sugars') || ''
                ),
                fat: String(getInitialNutritionValue(initialValues, 'fat') || ''),
                saturatedFat: String(
                    getInitialNutritionValue(initialValues, 'saturatedFat') ||
                        ''
                ),
                fiber: String(
                    getInitialNutritionValue(initialValues, 'fiber') || ''
                ),
                salt: String(
                    getInitialNutritionValue(initialValues, 'salt') || ''
                ),
            },
        })

        const currentUnit = watch('unit')
        const isFood = watch('isFood') !== false
        const showFoodFields = isFood

        const closeUnitMenu = () => {
            setUnitMenuOpen(false)
        }

        const handleQuantityChange = (location, value) => {
            setQuantities((prev) => ({
                ...prev,
                [location]: value,
            }))
        }

        const handleLocationToggle = (location) => {
            setSelectedLocations((prev) => {
                if (prev.includes(location)) {
                    // Remove location if it's not 'meal' (meal is always required)
                    return location === 'meal'
                        ? prev
                        : prev.filter((loc) => loc !== location)
                } else {
                    return [...prev, location]
                }
            })
        }

        const pickImage = async () => {
            const asset = await pickFoodItemImage()
            if (asset) setFoodItemImage(asset)
        }

        const handleFormSubmit = async (data) => {
            try {
                const formData = buildFoodItemFormPayload({
                    data,
                    location,
                    date,
                    showLocationSelector,
                    selectedLocations,
                    quantities,
                })

                if (location === 'meal' || location === 'shopping-list') {
                    onSubmit(formData)
                    // Form reset and closing handled by parent component
                } else {
                    const catalogPayload = toCatalogFoodItemPayload(formData)

                    const token = await storage.getItem('userToken')
                    if (!token) {
                        onSubmit(formData)
                        return
                    }

                    const response = await axios.post(
                        getServerUrl('/food-items/find-or-create'),
                        catalogPayload,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (response.data.success) {
                        const createdFoodItem = response.data.foodItem
                        let finalFoodItem = createdFoodItem
                        if (foodItemImage) {
                            try {
                                finalFoodItem = await uploadFoodItemImage(
                                    createdFoodItem._id,
                                    foodItemImage
                                )
                            } catch (imageError) {
                                console.error(
                                    'Error uploading food item image:',
                                    imageError
                                )
                                Alert.alert(
                                    'Warning',
                                    'Food item created but image upload failed: ' +
                                        imageError.message
                                )
                            }
                        }

                        onSubmit({
                            ...finalFoodItem,
                            quantity: formData.quantity,
                            unit: formData.unit,
                            expirationDate: formData.expirationDate,
                            expirationDateSetByUser:
                                formData.expirationDateSetByUser,
                        })
                        reset()
                        setQuantities({
                            meal: '',
                            'shopping-list': '',
                            pantry: '',
                        })
                        setSelectedLocations(['meal'])
                        setFoodItemImage(null)
                    } else {
                        Alert.alert(
                            'Virhe',
                            'Raaka-aineen lisääminen epäonnistui'
                        )
                    }
                }
            } catch (error) {
                console.error('Error submitting form:', error)
                Alert.alert('Virhe', 'Raaka-aineen lisääminen epäonnistui')
            }
        }

        const renderForm = () => (
            <View style={styles.formContainer}>
                {onClose && showBackButton && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onClose}
                        accessibilityRole="button"
                        accessibilityLabel="Takaisin"
                    >
                        <MaterialIcons name="chevron-left" size={22} color="#5844BB" />
                    </TouchableOpacity>
                )}

                {allowNonFood && (
                    <View style={formStyles.fieldGroup}>
                        <CustomText style={styles.isFoodQuestion}>
                            Onko kyseessä elintarvike?
                        </CustomText>
                        <View style={styles.isFoodRow}>
                            <TouchableOpacity
                                style={styles.isFoodOption}
                                onPress={() => setValue('isFood', true)}
                                activeOpacity={0.7}
                            >
                                <CustomRadioButton
                                    status={
                                        showFoodFields
                                            ? 'checked'
                                            : 'unchecked'
                                    }
                                    onPress={() => setValue('isFood', true)}
                                    color="#5844BB"
                                />
                                <CustomText style={styles.isFoodOptionText}>
                                    Elintarvike
                                </CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.isFoodOption}
                                onPress={() => {
                                    setValue('isFood', false)
                                    setValue('category', [])
                                    setValue('calories', '0')
                                }}
                                activeOpacity={0.7}
                            >
                                <CustomRadioButton
                                    status={
                                        !showFoodFields
                                            ? 'checked'
                                            : 'unchecked'
                                    }
                                    onPress={() => {
                                        setValue('isFood', false)
                                        setValue('category', [])
                                        setValue('calories', '0')
                                    }}
                                    color="#5844BB"
                                />
                                <CustomText style={styles.isFoodOptionText}>
                                    Muu tuote
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Row 1: Name and Category */}
                <View style={styles.formSingleColumn}>
                    <CustomInput
                        control={control}
                        name="name"
                        label={
                            showFoodFields
                                ? 'Elintarvikkeen nimi'
                                : 'Tuotteen nimi'
                        }
                        placeholder={
                            showFoodFields
                                ? 'Esim. kevytmaito'
                                : 'Esim. tiskirätti'
                        }
                        rules={{ required: 'Tämä on pakollinen tieto' }}
                        variant="form"
                    />

                    {showFoodFields && (
                        <View style={formStyles.fieldGroup}>
                            <CustomText style={formStyles.label}>
                                Elintarvikkeen tyyppi
                            </CustomText>
                            <Controller
                                control={control}
                                rules={{
                                    maxLength: 100,
                                    required: showFoodFields,
                                }}
                                render={({ field: { value, onChange } }) => (
                                    <InlineCategorySelect
                                        value={value}
                                        onChange={onChange}
                                        categories={getCategoryTree()}
                                        placeholder="Valitse elintarvikkeen kategoriat"
                                    />
                                )}
                                name="category"
                                {...register('category')}
                            />
                            {errors.category && (
                                <View style={formStyles.errorRow}>
                                    <MaterialIcons
                                        name="error"
                                        color="red"
                                        size={14}
                                    />
                                    <CustomText style={formStyles.errorMsg}>
                                        Tämä on pakollinen tieto
                                    </CustomText>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Row 2: Quantity + unit, calories/nutrition, date */}
                <View
                    style={[
                        styles.formSingleColumn,
                        unitMenuOpen && styles.unitColumnElevated,
                    ]}
                >
                    <View
                        style={[
                            formStyles.fieldGroup,
                            unitMenuOpen && styles.unitFieldElevated,
                        ]}
                    >
                        <CustomText style={formStyles.label}>Määrä</CustomText>
                        <View style={formStyles.inputRow}>
                            <CustomInput
                                control={control}
                                name="quantity"
                                placeholder="Esim. 0,5"
                                rules={{
                                    required: 'Määrä on pakollinen tieto',
                                    pattern: {
                                        value: /^(0|[1-9]\d*)([.,]\d+)?$/,
                                        message: 'Syötä kelvollinen luku',
                                    },
                                }}
                                variant="form"
                                style={formStyles.inputInRow}
                                keyboardType="decimal-pad"
                            />
                            <Controller
                                control={control}
                                name="unit"
                                rules={{ required: true }}
                                render={({ field: { onChange, value } }) => (
                                    <View style={formStyles.inputTrailing}>
                                        <UnitSelect
                                            value={value}
                                            onChange={onChange}
                                            open={unitMenuOpen}
                                            onOpenChange={setUnitMenuOpen}
                                        />
                                    </View>
                                )}
                            />
                        </View>
                        {(errors.quantity || errors.unit) && (
                            <View style={formStyles.errorRow}>
                                <MaterialIcons
                                    name="error"
                                    color="red"
                                    size={14}
                                />
                                <CustomText style={formStyles.errorMsg}>
                                    Määrä ja yksikkö ovat pakollisia tietoja
                                </CustomText>
                            </View>
                        )}
                    </View>

                    {showFoodFields && (
                        <FormDateField
                            label="Viimeinen käyttöpäivä"
                            value={date}
                            onChange={setDate}
                            onRemove={() => setDate(null)}
                            placeholder="Ei asetettu"
                            style={
                                unitMenuOpen
                                    ? styles.unitColumnBehind
                                    : undefined
                            }
                            testID="expiryDate"
                        />
                    )}

                    {showFoodFields && showNutrition && (
                        <FoodItemNutritionFields
                            control={control}
                            expanded={nutritionExpanded}
                            onExpandedChange={setNutritionExpanded}
                            style={
                                unitMenuOpen
                                    ? styles.unitColumnBehind
                                    : undefined
                            }
                        />
                    )}
                </View>

                {/* Row 3: Price (if shopping-list) */}
                {location === 'shopping-list' && (
                    <View
                        style={[
                            formStyles.fieldGroup,
                            unitMenuOpen && styles.unitColumnBehind,
                        ]}
                    >
                        <CustomText style={formStyles.label}>
                            Arvioitu hinta
                        </CustomText>
                        <View style={formStyles.inputRow}>
                            <CustomInput
                                control={control}
                                name="price"
                                placeholder="Esim. 4"
                                rules={{
                                    maxLength: 4,
                                    pattern: {
                                        value: /^(0|[1-9]\d*)(\.\d+)?$/,
                                        message: 'Täytä hinta numerona',
                                    },
                                }}
                                variant="form"
                                style={formStyles.inputInRow}
                            />
                            <View style={formStyles.inputTrailing}>
                                <CustomText style={formStyles.inputMetric}>
                                    €
                                </CustomText>
                            </View>
                        </View>
                    </View>
                )}

                {showLocationSelector && location === 'meal' && (
                    <FormFoodItemLocationTargets
                        selectedLocations={selectedLocations}
                        quantities={quantities}
                        currentUnit={currentUnit}
                        shoppingLists={shoppingLists}
                        selectedShoppingListId={selectedShoppingListId}
                        onLocationToggle={handleLocationToggle}
                        onQuantityChange={handleQuantityChange}
                        onShoppingListSelect={onShoppingListSelect}
                        style={unitMenuOpen ? styles.unitColumnBehind : undefined}
                    />
                )}

                {/* Row 4: Image Picker and Submit Button */}
                <View
                    style={[
                        styles.formSingleColumn,
                        unitMenuOpen && styles.unitColumnBehind,
                    ]}
                >
                    <View style={formStyles.fieldGroup}>
                        <CustomText style={formStyles.label}>
                            Tuotteen kuva
                        </CustomText>
                        <TouchableOpacity
                            style={styles.imagePicker}
                            onPress={pickImage}
                        >
                            {foodItemImage ? (
                                <Image
                                    source={{ uri: foodItemImage.uri }}
                                    style={styles.selectedImage}
                                />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <MaterialIcons
                                        name="add-a-photo"
                                        size={40}
                                        color="#5844BB"
                                    />
                                    <CustomText
                                        style={styles.imagePlaceholderText}
                                    >
                                        Lisää kuva
                                    </CustomText>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Tallenna tuote"
                            onPress={handleSubmit(handleFormSubmit)}
                            style={styles.submitButton}
                            textStyle={styles.submitButtonText}
                        />
                    </View>
                </View>
            </View>
        )

        return (
            <ScrollView
                ref={ref}
                style={styles.formScrollView}
                contentContainerStyle={styles.formScroll}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={closeUnitMenu}
                scrollEventThrottle={16}
            >
                {showUnifiedSearch && (
                    <View style={styles.unifiedSearchSection}>
                        <CustomText style={styles.unifiedSearchTitle}>
                            Lisää uusia tuotteita
                        </CustomText>
                        <CustomText style={styles.unifiedSearchText}>
                            Hae tuotteita nimellä tai skannaa viivakoodi.
                            Tulokset sisältävät sekä omat tuotteesi että Open
                            Food Facts -tietokannan.
                        </CustomText>
                        <View style={styles.unifiedSearchContainer}>
                            <UnifiedFoodSearch
                                onSelectItem={onSearchItemSelect}
                                location="shopping-list"
                                shoppingListId={shoppingListId}
                            />
                        </View>
                    </View>
                )}

                {showUnifiedSearch && (
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <CustomText style={styles.dividerText}>TAI</CustomText>
                        <View style={styles.dividerLine} />
                    </View>
                )}

                {showUnifiedSearch && (
                    <View style={styles.manualFormSection}>
                        <CustomText style={styles.manualFormTitle}>
                            Luo uusi tuote manuaalisesti
                        </CustomText>
                    </View>
                )}

                {renderForm()}
            </ScrollView>
        )
    }
)

// Display name for better debugging
FormFoodItem.displayName = 'FormFoodItem'

const styles = StyleSheet.create({
    backButton: {
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingRight: 12,
        paddingBottom: 12,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    formContainer: {
        paddingTop: 5,
        paddingBottom: 20,
        width: '100%',
        ...(Platform.OS === 'web' && { overflow: 'visible' }),
    },
    isFoodQuestion: {
        fontSize: 16,
        marginBottom: 10,
        color: '#333',
        fontWeight: '500',
    },
    isFoodRow: {
        flexDirection: 'row',
        gap: 16,
        flexWrap: 'wrap',
    },
    isFoodOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
        paddingRight: 8,
    },
    isFoodOptionText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    formSingleColumn: {
        width: '100%',
        ...(Platform.OS === 'web' && { overflow: 'visible' }),
    },
    unitColumnElevated: {
        zIndex: 100,
        elevation: 100,
        ...(Platform.OS === 'web' && { overflow: 'visible' }),
    },
    unitFieldElevated: {
        position: 'relative',
        zIndex: 100,
        elevation: 100,
        ...(Platform.OS === 'web' && { overflow: 'visible' }),
    },
    unitColumnBehind: {
        zIndex: 0,
        elevation: 0,
    },
    fullWidth: {
        width: '100%',
    },
    formScrollView: {
        width: '100%',
        ...(Platform.OS === 'web' && {
            overflow: 'visible',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '::-webkit-scrollbar': { display: 'none' },
        }),
    },
    formScroll: {
        flexGrow: 1,
        width: '100%',
        ...(Platform.OS === 'web' && { overflow: 'visible' }),
    },
    unifiedSearchSection: {
        marginBottom: 15,
        paddingHorizontal: 15,
        backgroundColor: 'rgb(248, 248, 248)',
        paddingVertical: 15,
        borderRadius: 10,
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
    },
    unifiedSearchTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    unifiedSearchText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    unifiedSearchContainer: {
        width: '100%',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
    },
    manualFormSection: {
        marginBottom: 10,
    },
    manualFormTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    // inputAndIcon: rivi jossa input + yksikköteksti vierekkäin
    inputAndIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
        marginVertical: 10,
    },
    submitButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#AE9CFC',
        width: '100%',
        marginBottom: 10,
    },
    submitButtonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    errorMsg: {
        color: '#e53e3e',
        marginLeft: 5,
        fontSize: 13,
    },
    messageSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    imagePicker: {
        borderWidth: 2,
        borderColor: '#5844BB',
        borderStyle: 'dashed',
        borderRadius: 8,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: '#5844BB',
        fontSize: 16,
        fontWeight: '500',
    },
    selectedImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
})

export default FormFoodItem
