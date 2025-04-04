import React, { useState } from 'react'
import {
    StyleSheet,
    ScrollView,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    Picker,
} from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import SectionedMultiSelect from 'react-native-sectioned-multi-select'
import { MaterialIcons as Icon } from '@expo/vector-icons'
import Fontisto from '@expo/vector-icons/Fontisto'
import DateTimePicker from '@react-native-community/datetimepicker'
import { RadioButton } from 'react-native-paper'
import axios from 'axios'
import storage from '../utils/storage'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'

import categories from '../data/categories'
import CustomText from './CustomText'
import Button from './Button'
import { getServerUrl } from '../utils/getServerUrl'
import ModalHeader from './ModalHeader'
import CategorySelect from './CategorySelect'

const formatNumber = (value) => {
    if (!value) return value
    // Replace comma with period for decimal numbers
    return value.toString().replace(',', '.')
}

const FoodItemForm = ({
    onSubmit,
    location = 'meal',
    showLocationSelector = false,
    initialValues = {},
    shoppingLists = [],
    selectedShoppingListId = null,
    onShoppingListSelect = () => {},
}) => {
    const [date, setDate] = useState(new Date())
    const [show, setShow] = useState(false)
    const [mode, setMode] = useState('date')
    const [selectedLocations, setSelectedLocations] = useState(['meal'])
    const [quantities, setQuantities] = useState({
        meal: '',
        'shopping-list': '',
        pantry: '',
    })
    const [isModalVisible, setIsModalVisible] = useState(false)

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
            quantity: initialValues.quantity
                ? String(initialValues.quantity)
                : '1',
            price: initialValues.price ? String(initialValues.price) : '0',
            expirationDate: initialValues.expirationDate
                ? new Date(initialValues.expirationDate)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            location: location,
            unit: initialValues.unit || 'kpl',
            calories: initialValues.calories
                ? String(initialValues.calories)
                : '0',
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
            // Filter out locations with empty quantities
            const activeLocations = selectedLocations.filter(
                (loc) =>
                    quantities[loc] !== '' || (loc === 'meal' && data.quantity)
            )

            const formData = {
                ...data,
                quantity: formatNumber(data.quantity),
                locations: activeLocations,
                quantities: {
                    meal:
                        location === 'meal'
                            ? parseFloat(formatNumber(data.quantity)) || 0
                            : 0,
                    'shopping-list':
                        parseFloat(formatNumber(quantities['shopping-list'])) ||
                        0,
                    pantry: parseFloat(formatNumber(quantities.pantry)) || 0,
                },
            }

            console.log('Form data before submit:', formData)

            if (location === 'meal') {
                onSubmit(formData)
                reset()
                setQuantities({ meal: '', 'shopping-list': '', pantry: '' })
                setSelectedLocations(['meal'])
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
                    setQuantities({ meal: '', 'shopping-list': '', pantry: '' })
                    setSelectedLocations(['meal'])
                } else {
                    Alert.alert('Virhe', 'Raaka-aineen lisääminen epäonnistui')
                }
            }
        } catch (error) {
            console.error('Error creating food item:', error)
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

    const ShoppingListSelector = ({ shoppingLists, selectedId, onSelect }) => {
        if (!shoppingLists || shoppingLists.length === 0) return null

        return (
            <View style={styles.selectorContainer}>
                <CustomText style={styles.label}>Valitse ostoslista</CustomText>
                <Picker
                    selectedValue={selectedId}
                    onValueChange={(itemValue) => onSelect(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Valitse ostoslista..." value={null} />
                    {shoppingLists.map((list) => (
                        <Picker.Item
                            key={list._id}
                            label={list.name}
                            value={list._id}
                        />
                    ))}
                </Picker>
            </View>
        )
    }

    const toggleModal = () => {
        setIsModalVisible(!isModalVisible)
    }

    return (
        <ScrollView style={styles.form}>
            <CustomText style={styles.label}>Elintarvikkeen nimi</CustomText>
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
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </CustomText>
                </View>
            )}

            <CustomText style={styles.label}>Elintarvikkeen tyyppi</CustomText>
            <Controller
                control={control}
                rules={{
                    maxLength: 100,
                    required: true,
                }}
                render={({ field: { value, onChange } }) => (
                    <CategorySelect
                        value={value}
                        onChange={onChange}
                        isModalVisible={isModalVisible}
                        setIsModalVisible={setIsModalVisible}
                        toggleModal={toggleModal}
                        categories={categories}
                    />
                )}
                name="category"
                {...register('category')}
            />
            {errors.category && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </CustomText>
                </View>
            )}

            <CustomText style={styles.label}>Kappalemäärä</CustomText>
            <View style={styles.quantityContainer}>
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
                            onChangeText={(text) => onChange(text)}
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
                    <Icon name="error" color="red" size={14} />
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
                        <CustomText style={styles.inputMetric}>kcal</CustomText>
                    </View>
                )}
                name="calories"
            />

            {location === 'shopping-list' && (
                <>
                    <CustomText style={styles.label}>Arvioitu hinta</CustomText>
                    <Controller
                        control={control}
                        rules={{
                            maxLength: 4,
                            valueAsNumber: true,
                            pattern: {
                                value: /^(0|[1-9]\d*)(\.\d+)?$/,
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={styles.inputAndIcon}>
                                <TextInput
                                    style={styles.formInput}
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
                            <Icon name="error" color="red" size={14} />
                            <CustomText style={styles.errorMsg}>
                                Täytä arvioitu hinta numerona. Syötä vähintään 1
                                ja maksimissaan 4 lukua.
                            </CustomText>
                        </View>
                    )}
                </>
            )}

            <CustomText style={styles.label}>Viimeinen käyttöpäivä</CustomText>
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
                <TouchableOpacity onPress={showMode} style={styles.dateIcon}>
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

            {showLocationSelector && (
                <View style={styles.locationSelector}>
                    <CustomText style={styles.labelTitle}>
                        Lisää raaka-aine myös:
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
                                        <RadioButton
                                            value={loc}
                                            status={
                                                selectedLocations.includes(loc)
                                                    ? 'checked'
                                                    : 'unchecked'
                                            }
                                            onPress={() =>
                                                handleLocationToggle(loc)
                                            }
                                            color="#9C86FC"
                                            disabled={loc === 'meal'} // Meal is always required
                                        />
                                        <CustomText style={styles.radioLabel}>
                                            {loc === 'meal'
                                                ? 'Vain ateriaan'
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
                                                shoppingLists={shoppingLists}
                                                selectedId={
                                                    selectedShoppingListId
                                                }
                                                onSelect={onShoppingListSelect}
                                            />
                                        </View>
                                    )}
                            </View>
                        ))}
                    </View>
                </View>
            )}
            <Button
                style={styles.primaryButton}
                title="Tallenna tuote"
                onPress={handleSubmit(handleFormSubmit)}
            />
        </ScrollView>
    )
}

export default FoodItemForm

const styles = StyleSheet.create({
    form: {
        flex: 1,
        width: '100%',
        marginBottom: 15,
    },
    label: {
        paddingTop: 10,
        marginBottom: 5,
    },
    labelTitle: {
        paddingTop: 10,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    formInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 5,
        width: '100%',
    },
    quantityFormInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 5,
        width: '60%',
    },
    unitFormInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 5,
        width: '35%',
        marginLeft: 10,
    },
    inputAndIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    messageSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'left',
        backgroundColor: '#fff',
    },
    inputMetric: {
        padding: 10,
        fontSize: 20,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
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
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
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
        marginBottom: 20,
    },
    radioGroup: {
        marginTop: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioLabel: {
        marginLeft: 8,
        fontSize: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quantityInput: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        width: '50%',
    },
    unitLabel: {
        marginLeft: 8,
        fontSize: 14,
    },
    dateInputContainer: {
        flex: 1,
        marginRight: 10,
    },
    dateInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
    },
    dateIcon: {
        padding: 5,
    },
    iosDatePicker: {
        backgroundColor: 'white',
        width: '100%',
        height: 120,
        marginTop: 10,
        marginBottom: 10,
    },
    selectorContainer: {
        backgroundColor: 'white',
        padding: 5,
    },
    picker: {
        width: '100%',
        height: 40,
        padding: 5,
    },
    shoppingListSelectorContainer: {
        marginLeft: 40,
        marginBottom: 10,
    },
})
