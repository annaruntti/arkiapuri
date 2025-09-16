import { MaterialIcons } from '@expo/vector-icons'
import Fontisto from '@expo/vector-icons/Fontisto'
import React, { forwardRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
    Alert,
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
// Cross-platform picker: web uses input[type=date], native uses community picker
import axios from 'axios'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import CustomRadioButton from './CustomRadioButton'
import DateTimePicker from './DateTimePicker'

import categories from '../data/categories'
import { getServerUrl } from '../utils/getServerUrl'
import Button from './Button'
import CustomText from './CustomText'
import InlineCategorySelect from './InlineCategorySelect'

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
            buttonStyle = 'primary',
        },
        ref
    ) => {
        const { isDesktop } = useResponsiveDimensions()
        const [date, setDate] = useState(new Date())
        const [show, setShow] = useState(false)
        const [mode, setMode] = useState('date')
        const [selectedLocations, setSelectedLocations] = useState(['meal'])
        const [quantities, setQuantities] = useState({
            meal: '',
            'shopping-list': '',
            pantry: '',
        })

        const {
            control,
            handleSubmit,
            register,
            formState: { errors },
            reset,
            watch,
        } = useForm({
            defaultValues: {
                name: initialValues.name || '',
                category: initialValues.category || [],
                quantity: initialValues.quantity || '',
                price: initialValues.price || '0',
                expirationDate: initialValues.expirationDate
                    ? new Date(initialValues.expirationDate)
                    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                location: location,
                unit: initialValues.unit || 'kpl',
                calories: initialValues.calories || '0',
            },
        })

        const currentUnit = watch('unit')

        const showMode = () => {
            if (Platform.OS === 'android') {
                setShow(true)
            } else {
                // For iOS, show the picker immediately
                setShow(true)
            }
            setMode('date')
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

        const handleFormSubmit = async (data) => {
            try {
                const quantity = parseFloat(data.quantity) || 0

                // Get category names from IDs
                const getCategoryName = (id) => {
                    for (const category of categories) {
                        if (category.id === id) return category.name
                        const subcategory = category.children.find(
                            (c) => c.id === id
                        )
                        if (subcategory) return subcategory.name
                    }
                    return id
                }

                const formData = {
                    name: data.name,
                    category: Array.isArray(data.category)
                        ? data.category.map((id) => getCategoryName(id))
                        : [],
                    unit: data.unit,
                    price: parseFloat(data.price) || 0,
                    calories: parseInt(data.calories) || 0,
                    expirationDate: data.expirationDate,
                    location: location,
                    locations: showLocationSelector
                        ? selectedLocations
                        : [location],
                    quantity: quantity,
                    quantities: {
                        meal: 0,
                        'shopping-list': 0,
                        pantry: 0,
                    },
                }

                // Set quantities based on whether multi-location is enabled
                if (showLocationSelector) {
                    // Multi-location mode: use the quantities from the state
                    selectedLocations.forEach((loc) => {
                        const locQuantity = parseFloat(quantities[loc]) || 0
                        formData.quantities[loc] = locQuantity
                    })
                    // Set primary quantity to the main location quantity
                    formData.quantity =
                        parseFloat(quantities[location]) || quantity
                } else {
                    // Single location mode: use the main quantity field
                    if (location === 'pantry') {
                        formData.quantities.pantry = quantity
                    } else if (location === 'shopping-list') {
                        formData.quantities['shopping-list'] = quantity
                    } else if (location === 'meal') {
                        formData.quantities.meal = quantity
                    }
                }

                if (location === 'meal' || location === 'shopping-list') {
                    onSubmit(formData)
                    // Form reset and closing handled by parent component
                } else {
                    // Normal food item creation flow
                    const token = await storage.getItem('userToken')
                    const response = await axios.post(
                        getServerUrl('/food-items'),
                        formData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (response.data.success) {
                        onSubmit(response.data.foodItem)
                        reset()
                        // Reset quantities and locations except 'meal'
                        setQuantities({
                            meal: '',
                            'shopping-list': '',
                            pantry: '',
                        })
                        setSelectedLocations(['meal'])
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

        const formatDate = (date) => {
            try {
                return format(date, 'dd.MM.yyyy', { locale: fi })
            } catch (error) {
                console.error('Error formatting date:', error)
                return date.toLocaleDateString('fi-FI')
            }
        }

        const ShoppingListSelector = ({
            shoppingLists,
            selectedId,
            onSelect,
        }) => {
            const [isExpanded, setIsExpanded] = useState(false)
            const [animation] = useState(new Animated.Value(0))

            if (!shoppingLists || shoppingLists.length === 0) return null

            // Animation functions
            const animateIn = () => {
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                }).start()
            }

            const animateOut = (callback) => {
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }).start(callback)
            }

            // Toggle expansion
            const toggleExpansion = () => {
                if (isExpanded) {
                    animateOut(() => {
                        setIsExpanded(false)
                    })
                } else {
                    setIsExpanded(true)
                    animateIn()
                }
            }

            const selectedList = shoppingLists.find(
                (list) => list._id === selectedId
            )
            const displayText = selectedList
                ? selectedList.name
                : 'Valitse ostoslista...'

            return (
                <View style={styles.shoppingListContainer}>
                    <CustomText style={styles.label}>
                        Valitse ostoslista
                    </CustomText>
                    {/* Selection Button */}
                    <TouchableOpacity
                        style={[
                            styles.shoppingListButton,
                            isExpanded && styles.shoppingListButtonActive,
                        ]}
                        onPress={toggleExpansion}
                    >
                        <CustomText
                            style={[
                                styles.shoppingListButtonText,
                                selectedList &&
                                    styles.shoppingListButtonTextSelected,
                            ]}
                        >
                            {displayText}
                        </CustomText>
                        <MaterialIcons
                            name={
                                isExpanded
                                    ? 'keyboard-arrow-up'
                                    : 'keyboard-arrow-down'
                            }
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>

                    {/* Expandable Shopping List Selection */}
                    {isExpanded && (
                        <Animated.View
                            style={[
                                styles.shoppingListExpandableSection,
                                {
                                    maxHeight: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 300],
                                    }),
                                    opacity: animation,
                                },
                            ]}
                        >
                            <View style={styles.shoppingListHeader}>
                                <CustomText style={styles.shoppingListTitle}>
                                    Valitse ostoslista
                                </CustomText>
                                <TouchableOpacity
                                    onPress={toggleExpansion}
                                    style={styles.shoppingListCloseButton}
                                >
                                    <MaterialIcons
                                        name="close"
                                        size={24}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.shoppingListScrollContainer}
                                showsVerticalScrollIndicator={true}
                                nestedScrollEnabled={true}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.shoppingListOption,
                                        !selectedId &&
                                            styles.shoppingListOptionSelected,
                                    ]}
                                    onPress={() => {
                                        onSelect('')
                                        toggleExpansion()
                                    }}
                                >
                                    <CustomText
                                        style={[
                                            styles.shoppingListOptionText,
                                            !selectedId &&
                                                styles.shoppingListOptionTextSelected,
                                        ]}
                                    >
                                        Ei ostoslistaa
                                    </CustomText>
                                </TouchableOpacity>
                                {shoppingLists.map((list) => {
                                    const isSelected = selectedId === list._id
                                    return (
                                        <TouchableOpacity
                                            key={list._id}
                                            style={[
                                                styles.shoppingListOption,
                                                isSelected &&
                                                    styles.shoppingListOptionSelected,
                                            ]}
                                            onPress={() => {
                                                onSelect(list._id)
                                                toggleExpansion()
                                            }}
                                        >
                                            <CustomText
                                                style={[
                                                    styles.shoppingListOptionText,
                                                    isSelected &&
                                                        styles.shoppingListOptionTextSelected,
                                                ]}
                                            >
                                                {list.name}
                                            </CustomText>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>
                        </Animated.View>
                    )}
                </View>
            )
        }

        const renderForm = () => (
            <View style={styles.formContainer}>
                <CustomText style={styles.label}>
                    Elintarvikkeen nimi
                </CustomText>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.formInput}
                            placeholder="Esim. leivinpaperi"
                            placeholderTextColor="#999"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                    name="name"
                    {...register('name')}
                />
                {errors.name && (
                    <View style={styles.messageSection}>
                        <MaterialIcons name="error" color="red" size={14} />
                        <CustomText style={styles.errorMsg}>
                            Tämä on pakollinen tieto
                        </CustomText>
                    </View>
                )}

                <CustomText style={styles.label}>
                    Elintarvikkeen tyyppi
                </CustomText>
                <Controller
                    control={control}
                    rules={{
                        maxLength: 100,
                        required: true,
                    }}
                    render={({ field: { value, onChange } }) => (
                        <InlineCategorySelect
                            value={value}
                            onChange={onChange}
                            categories={categories}
                            placeholder="Valitse elintarvikkeen kategoriat"
                        />
                    )}
                    name="category"
                    {...register('category')}
                />
                {errors.category && (
                    <View style={styles.messageSection}>
                        <MaterialIcons name="error" color="red" size={14} />
                        <CustomText style={styles.errorMsg}>
                            Tämä on pakollinen tieto
                        </CustomText>
                    </View>
                )}

                <CustomText style={styles.label}>Kappalemäärä</CustomText>
                <View style={styles.inputAndIcon}>
                    <Controller
                        control={control}
                        rules={{
                            required: true,
                            valueAsNumber: true,
                            pattern: {
                                value: /^(0|[1-9]\d*)([.,]\d+)?$/,
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={styles.quantityFormInput}
                                placeholder="Esim. 0,5"
                                placeholderTextColor="#999"
                                onChangeText={(text) => {
                                    // Allow empty string or numbers with optional decimal point
                                    if (
                                        text === '' ||
                                        /^(0|[1-9]\d*)([.,]\d+)?$/.test(text)
                                    ) {
                                        onChange(text)
                                    }
                                }}
                                onBlur={onBlur}
                                value={value}
                                keyboardType="numeric"
                            />
                        )}
                        name="quantity"
                        {...register('quantity')}
                    />

                    <Controller
                        control={control}
                        rules={{
                            required: true,
                            validate: (value) => value.trim() !== '',
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                style={styles.unitFormInput}
                                placeholder="kpl/kg/l"
                                placeholderTextColor="#999"
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                        name="unit"
                        {...register('unit')}
                    />
                </View>
                {(errors.quantity || errors.unit) && (
                    <View style={styles.messageSection}>
                        <MaterialIcons name="error" color="red" size={14} />
                        <CustomText style={styles.errorMsg}>
                            Määrä ja yksikkö ovat pakollisia tietoja
                        </CustomText>
                    </View>
                )}

                <CustomText style={styles.label}>
                    Kalorit (per 100g/100ml)
                </CustomText>
                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View style={styles.inputAndIcon}>
                            <TextInput
                                style={styles.quantityFormInput}
                                placeholder="Esim. 250"
                                placeholderTextColor="#999"
                                onChangeText={onChange}
                                onBlur={onBlur}
                                value={value}
                                keyboardType="numeric"
                            />
                            <CustomText style={styles.inputMetric}>
                                kcal
                            </CustomText>
                        </View>
                    )}
                    name="calories"
                />

                {location === 'shopping-list' && (
                    <>
                        <CustomText style={styles.label}>
                            Arvioitu hinta
                        </CustomText>
                        <Controller
                            control={control}
                            rules={{
                                maxLength: 4,
                                valueAsNumber: true,
                                pattern: {
                                    value: /^(0|[1-9]\d*)(\.\d+)?$/,
                                },
                            }}
                            render={({
                                field: { onChange, onBlur, value },
                            }) => (
                                <View style={styles.inputAndIcon}>
                                    <TextInput
                                        style={styles.quantityFormInput}
                                        placeholder="Esim. 4"
                                        placeholderTextColor="#999"
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        keyboardType="numeric"
                                    />
                                    <CustomText style={styles.inputMetric}>
                                        €
                                    </CustomText>
                                </View>
                            )}
                            name="price"
                            {...register('price')}
                        />
                        {errors.price && (
                            <View style={styles.messageSection}>
                                <MaterialIcons
                                    name="error"
                                    color="red"
                                    size={14}
                                />
                                <CustomText style={styles.errorMsg}>
                                    Täytä arvioitu hinta numerona. Syötä
                                    vähintään 1 ja maksimissaan 4 lukua.
                                </CustomText>
                            </View>
                        )}
                    </>
                )}

                <CustomText style={styles.label}>
                    Viimeinen käyttöpäivä
                </CustomText>
                <View style={styles.inputAndIcon}>
                    <TouchableOpacity
                        style={styles.dateInputContainer}
                        onPress={showMode}
                    >
                        <TextInput
                            style={styles.dateInput}
                            value={formatDate(date)}
                            editable={false}
                            placeholder="Valitse päivämäärä"
                            placeholderTextColor="#999"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={showMode}
                        style={styles.dateIcon}
                    >
                        <Fontisto name="date" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
                {show && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={mode}
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (selectedDate) {
                                setDate(selectedDate)
                            }
                            setShow(Platform.OS === 'ios')
                        }}
                        minimumDate={new Date()}
                    />
                )}

                {showLocationSelector && location === 'meal' && (
                    <View style={styles.locationSelector}>
                        <CustomText style={styles.labelTitle}>
                            Valitse minne haluat samalla lisätä raaka-aineen ja
                            määrät
                        </CustomText>
                        <View style={styles.radioGroup}>
                            {['meal', 'shopping-list', 'pantry'].map((loc) => (
                                <View key={loc}>
                                    <View style={styles.locationRow}>
                                        <TouchableOpacity
                                            style={styles.radioOption}
                                            onPress={() =>
                                                handleLocationToggle(loc)
                                            }
                                        >
                                            <CustomRadioButton
                                                value={loc}
                                                status={
                                                    selectedLocations.includes(
                                                        loc
                                                    )
                                                        ? 'checked'
                                                        : 'unchecked'
                                                }
                                                onPress={() =>
                                                    handleLocationToggle(loc)
                                                }
                                                color="#9C86FC"
                                                disabled={loc === 'meal'} // Meal is always required
                                            />
                                            <CustomText
                                                style={styles.radioLabel}
                                            >
                                                {loc === 'meal'
                                                    ? 'Ateriaan kätettävä määrä'
                                                    : loc === 'shopping-list'
                                                      ? 'Ostoslistalle'
                                                      : 'Pentteriin'}
                                            </CustomText>
                                        </TouchableOpacity>
                                        {selectedLocations.includes(loc) && (
                                            <View style={styles.quantityInput}>
                                                <TextInput
                                                    style={styles.unitFormInput}
                                                    value={quantities[loc]}
                                                    onChangeText={(value) =>
                                                        handleQuantityChange(
                                                            loc,
                                                            value
                                                        )
                                                    }
                                                    placeholder="Määrä"
                                                    placeholderTextColor="#999"
                                                    keyboardType="numeric"
                                                />
                                                <CustomText
                                                    style={styles.unitLabel}
                                                >
                                                    {currentUnit || 'kpl'}
                                                </CustomText>
                                            </View>
                                        )}
                                    </View>
                                    {/* Show shopping list selector when shopping-list is selected */}
                                    {loc === 'shopping-list' &&
                                        selectedLocations.includes(
                                            'shopping-list'
                                        ) && (
                                            <View
                                                style={
                                                    styles.shoppingListSelectorContainer
                                                }
                                            >
                                                <ShoppingListSelector
                                                    shoppingLists={
                                                        shoppingLists
                                                    }
                                                    selectedId={
                                                        selectedShoppingListId
                                                    }
                                                    onSelect={
                                                        onShoppingListSelect
                                                    }
                                                />
                                            </View>
                                        )}
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                <View style={styles.buttonContainer}>
                    <Button
                        style={[
                            buttonStyle === 'secondary'
                                ? styles.secondaryButton
                                : styles.primaryButton,
                            isDesktop && styles.desktopButton,
                        ]}
                        textStyle={styles.buttonText}
                        title="Tallenna tuote"
                        onPress={handleSubmit(handleFormSubmit)}
                    />
                </View>
            </View>
        )

        return (
            <ScrollView
                ref={ref}
                contentContainerStyle={styles.formScroll}
                showsVerticalScrollIndicator={true}
                bounces={false}
            >
                {renderForm()}
            </ScrollView>
        )
    }
)

// Display name for better debugging
FormFoodItem.displayName = 'FormFoodItem'

const styles = StyleSheet.create({
    formContainer: {
        padding: 10,
        paddingBottom: 20,
    },
    formScroll: {
        flexGrow: 1,
    },
    form: {
        flex: 1,
        width: '100%',
        marginBottom: 15,
    },
    label: {
        paddingTop: 5,
        marginBottom: 3,
    },
    labelTitle: {
        paddingTop: 25,
        marginBottom: 15,
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 16,
    },
    formInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 36,
        padding: 8,
        borderRadius: 4,
        marginBottom: 5,
        width: '100%',
    },
    quantityFormInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 36,
        padding: 8,
        borderRadius: 4,
        marginBottom: 5,
        width: 120,
        flex: 0,
    },
    unitFormInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 36,
        padding: 8,
        borderRadius: 4,
        marginBottom: 5,
        width: 65,
        marginLeft: 10,
    },
    inputAndIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        width: '100%',
        minHeight: 36,
        position: 'relative',
    },
    messageSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'left',
        backgroundColor: '#fff',
    },
    inputMetric: {
        paddingLeft: 10,
        paddingVertical: 8,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
        marginVertical: 10,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        width: '100%',
    },
    desktopButton: {
        maxWidth: 300,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        width: '100%',
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        borderWidth: 3,
        borderColor: '#9C86FC',
    },
    primaryButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    cancelButton: {
        position: 'absolute',
        right: 20,
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    errorMsg: {
        color: 'red',
        marginLeft: 5,
    },
    multiSelectBackdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    multiSelectBox: {
        borderWidth: 1,
        borderRadius: 4,
        borderColor: '#bbb',
        padding: 10,
        marginBottom: 8,
        backgroundColor: 'white',
        minHeight: 40,
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        width: '100%',
    },
    unitInput: {
        flex: 1,
        width: '100%',
    },
    locationSelector: {
        marginBottom: 15,
    },
    radioGroup: {
        marginTop: 5,
        marginBottom: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    radioLabel: {
        marginLeft: 8,
        fontSize: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    quantityInput: {
        flexDirection: 'row',
        alignItems: 'right',
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
    },
    unitLabel: {
        marginLeft: 8,
        fontSize: 14,
        alignSelf: 'center',
    },
    dateInputContainer: {
        flex: 0,
        width: 120,
    },
    dateInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        height: 36,
        padding: 8,
        borderRadius: 4,
        width: 120,
    },
    dateIcon: {
        padding: 8,
        marginLeft: 130,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        height: 36,
    },
    iosDatePicker: {
        backgroundColor: 'white',
        width: '100%',
        height: 120,
        marginTop: 10,
        marginBottom: 10,
    },
    pickerContainer: {
        backgroundColor: 'white',
        marginTop: 5,
        marginBottom: 5,
    },
    picker: {
        width: '100%',
        height: 50,
        backgroundColor: 'white',
        borderRadius: 4,
        borderColor: '#bbb',
        padding: 5,
    },
    pickerItem: {
        height: 40,
        fontSize: 16,
    },
    shoppingListSelectorContainer: {
        marginLeft: 30,
        marginBottom: 5,
    },
    pickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        minHeight: 48,
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#000',
        flex: 1,
    },
    placeholderText: {
        color: '#666',
        fontStyle: 'italic',
    },
    // Shopping List Inline Selector Styles
    shoppingListContainer: {
        marginBottom: 10,
    },
    shoppingListButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        minHeight: 40,
    },
    shoppingListButtonActive: {
        borderColor: '#9C86FC',
        borderWidth: 2,
    },
    shoppingListButtonText: {
        flex: 1,
        color: '#999',
        fontSize: 16,
    },
    shoppingListButtonTextSelected: {
        color: '#333',
    },
    shoppingListExpandableSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginTop: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    shoppingListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        backgroundColor: '#fff',
    },
    shoppingListTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    shoppingListCloseButton: {
        padding: 5,
    },
    shoppingListScrollContainer: {
        maxHeight: 200,
        padding: 15,
    },
    shoppingListOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 6,
        marginBottom: 4,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    shoppingListOptionSelected: {
        backgroundColor: '#f8f5ff',
        borderColor: '#9C86FC',
    },
    shoppingListOptionText: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    shoppingListOptionTextSelected: {
        color: '#333',
        fontWeight: '500',
    },
})

export default FormFoodItem
