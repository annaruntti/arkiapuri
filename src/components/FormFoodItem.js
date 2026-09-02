import axios from 'axios'
import { forwardRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
    Alert,
    Animated,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useShowNutrition } from '../hooks/useShowNutrition'
import { useResponsiveDimensions } from '../utils/responsive'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'
import CustomRadioButton from './CustomRadioButton'
import Button from './Button'
import CustomText from './CustomText'
import FormDateField from './FormDateField'
import CustomInput from './CustomInput'
import InlineCategorySelect from './InlineCategorySelect'
import CollapsibleFormSection from './CollapsibleFormSection'
import ToggleButton from './ToggleButton'
import UnifiedFoodSearch from './UnifiedFoodSearch'
import categories from '../data/categories'
import { formStyles } from '../styles/formStyles'
import { APP_UNITS } from '../utils/units'

const NUTRITION_FIELDS = [
    { name: 'calories', label: 'Kalorit', unit: 'kcal' },
    { name: 'proteins', label: 'Proteiini', unit: 'g' },
    { name: 'carbohydrates', label: 'Hiilihydraatit', unit: 'g' },
    { name: 'sugars', label: 'Sokerit', unit: 'g' },
    { name: 'fat', label: 'Rasva', unit: 'g' },
    { name: 'saturatedFat', label: 'Tyydyttynyt rasva', unit: 'g' },
    { name: 'fiber', label: 'Kuitu', unit: 'g' },
    { name: 'salt', label: 'Suola', unit: 'g' },
]

const getInitialNutritionValue = (initialValues, fieldName) => {
    if (fieldName === 'calories') {
        return (
            initialValues?.nutrition?.calories ??
            initialValues?.calories ??
            initialValues?.openFoodFactsData?.nutrition?.calories ??
            ''
        )
    }
    return (
        initialValues?.nutrition?.[fieldName] ??
        initialValues?.openFoodFactsData?.nutrition?.[fieldName] ??
        ''
    )
}

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
        const hasInitialNutrition = NUTRITION_FIELDS.some((field) => {
            const value = getInitialNutritionValue(initialValues, field.name)
            return value !== '' && value != null && Number(value) !== 0
        })
        const [nutritionExpanded, setNutritionExpanded] = useState(
            hasInitialNutrition
        )
        const [unitMenuOpen, setUnitMenuOpen] = useState(false)
        const [date, setDate] = useState(new Date())
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
                    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

        const unitOptions = APP_UNITS

        const openUnitMenu = () => {
            setUnitMenuOpen((open) => !open)
        }

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
            try {
                if (Platform.OS === 'web') {
                    // For web, only show library option
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ['images'],
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                    })

                    if (!result.canceled) {
                        setFoodItemImage(result.assets[0])
                    }
                    return
                }

                // For mobile, show action sheet with options
                Alert.alert(
                    'Select Image',
                    'Choose how you want to add an image',
                    [
                        {
                            text: 'Camera',
                            onPress: async () => {
                                try {
                                    console.log(
                                        'Requesting camera permissions...'
                                    )
                                    const { status } =
                                        await ImagePicker.requestCameraPermissionsAsync()
                                    console.log(
                                        'Camera permission status:',
                                        status
                                    )

                                    if (status !== 'granted') {
                                        Alert.alert(
                                            'Sorry, we need camera permissions to make this work!'
                                        )
                                        return
                                    }

                                    console.log('Launching camera...')
                                    const result =
                                        await ImagePicker.launchCameraAsync({
                                            mediaTypes: ['images'],
                                            allowsEditing: true,
                                            aspect: [4, 3],
                                            quality: 1,
                                        })

                                    console.log('Camera result:', result)
                                    if (!result.canceled) {
                                        setFoodItemImage(result.assets[0])
                                    }
                                } catch (error) {
                                    console.error('Camera error:', error)
                                    Alert.alert(
                                        'Error',
                                        'Failed to open camera: ' +
                                            error.message
                                    )
                                }
                            },
                        },
                        {
                            text: 'Photo Library',
                            onPress: async () => {
                                const { status } =
                                    await ImagePicker.requestMediaLibraryPermissionsAsync()
                                if (status !== 'granted') {
                                    Alert.alert(
                                        'Sorry, we need camera roll permissions to make this work!'
                                    )
                                    return
                                }

                                const result =
                                    await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ['images'],
                                        allowsEditing: true,
                                        aspect: [4, 3],
                                        quality: 1,
                                    })

                                if (!result.canceled) {
                                    setFoodItemImage(result.assets[0])
                                }
                            },
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                    ]
                )
            } catch (error) {
                console.error('Error picking image:', error)
                Alert.alert('Error', 'Failed to pick image')
            }
        }

        const uploadFoodItemImage = async (foodItemId, imageFile) => {
            try {
                console.log('Starting image upload for food item:', foodItemId)
                console.log('Image file received:', imageFile)

                const token = await storage.getItem('userToken')
                if (!token) {
                    throw new Error('No token found')
                }

                const formData = new FormData()

                // Handle web blob URLs differently
                if (
                    Platform.OS === 'web' &&
                    imageFile.uri.startsWith('blob:')
                ) {
                    console.log('Processing web blob image')
                    // For web, we need to fetch the blob and convert it to a File
                    const response = await fetch(imageFile.uri)
                    const blob = await response.blob()
                    const file = new File([blob], 'food-item.jpg', {
                        type: 'image/jpeg',
                    })
                    formData.append('mealImage', file)
                    console.log('Web blob processed, file created:', file)
                } else {
                    console.log('Processing mobile image')
                    // For mobile platforms
                    formData.append('mealImage', {
                        uri: imageFile.uri,
                        type: 'image/jpeg',
                        name: 'food-item.jpg',
                    })
                    console.log('Mobile image added to FormData')
                }

                const url = getServerUrl(`/food-items/${foodItemId}/image`)
                console.log('Uploading food item image to URL:', url)
                console.log('FormData contents:', formData)

                const response = await axios.post(url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                })

                console.log('Upload response:', response.data)
                if (response.data.success) {
                    console.log('Food item image uploaded successfully')
                    return response.data.foodItem // Return the updated food item with image
                } else {
                    throw new Error('Upload failed: ' + response.data.message)
                }
            } catch (error) {
                console.error('Error uploading food item image:', error)
                console.error('Error response:', error.response?.data)
                console.error('Error status:', error.response?.status)
                throw error
            }
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

                // Robust category processing - handle stringified arrays and objects
                let processedCategories = []
                if (data.category) {
                    if (Array.isArray(data.category)) {
                        // Already an array, process each item
                        processedCategories = data.category
                            .map((item) => {
                                if (typeof item === 'string') {
                                    return getCategoryName(item)
                                } else if (
                                    item &&
                                    typeof item === 'object' &&
                                    item.name
                                ) {
                                    return item.name
                                }
                                return getCategoryName(item)
                            })
                            .filter((name) => name && name.trim() !== '')
                    } else if (typeof data.category === 'string') {
                        try {
                            // Try to parse as JSON
                            const parsed = JSON.parse(data.category)
                            if (Array.isArray(parsed)) {
                                processedCategories = parsed
                                    .map((item) => {
                                        if (typeof item === 'string') {
                                            return getCategoryName(item)
                                        } else if (
                                            item &&
                                            typeof item === 'object' &&
                                            item.name
                                        ) {
                                            return item.name
                                        }
                                        return getCategoryName(item)
                                    })
                                    .filter(
                                        (name) => name && name.trim() !== ''
                                    )
                            }
                        } catch (e) {
                            // If parsing fails, treat as single category
                            processedCategories = [
                                getCategoryName(data.category),
                            ]
                        }
                    }
                }

                const nutrition =
                    data.isFood === false
                        ? undefined
                        : {
                              calories: parseFloat(data.calories) || 0,
                              proteins: parseFloat(data.proteins) || 0,
                              carbohydrates:
                                  parseFloat(data.carbohydrates) || 0,
                              sugars: parseFloat(data.sugars) || 0,
                              fat: parseFloat(data.fat) || 0,
                              saturatedFat: parseFloat(data.saturatedFat) || 0,
                              fiber: parseFloat(data.fiber) || 0,
                              salt: parseFloat(data.salt) || 0,
                          }

                const formData = {
                    name: data.name,
                    isFood: data.isFood !== false,
                    category:
                        data.isFood === false ? [] : processedCategories,
                    unit: data.unit,
                    price: parseFloat(data.price) || 0,
                    calories:
                        data.isFood === false
                            ? 0
                            : parseFloat(data.calories) || 0,
                    nutrition,
                    expirationDate:
                        data.isFood === false
                            ? undefined
                            : data.expirationDate,
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

                // Location quantity belongs on the pantry/list row, not the catalog.
                if (showLocationSelector) {
                    selectedLocations.forEach((loc) => {
                        const locQuantity = parseFloat(quantities[loc]) || 0
                        formData.quantities[loc] = locQuantity
                    })
                    formData.quantity =
                        parseFloat(quantities[location]) || quantity
                }

                if (location === 'meal' || location === 'shopping-list') {
                    onSubmit(formData)
                    // Form reset and closing handled by parent component
                } else {
                    const catalogPayload = {
                        name: formData.name,
                        isFood: formData.isFood,
                        category: formData.category,
                        unit: formData.unit,
                        price: formData.price,
                        calories: formData.calories,
                        nutrition: formData.nutrition,
                        expirationDate: formData.expirationDate,
                    }

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
                        console.log(
                            'Food item created successfully:',
                            createdFoodItem._id
                        )

                        // Upload image if one was selected
                        let finalFoodItem = createdFoodItem
                        if (foodItemImage) {
                            try {
                                console.log(
                                    'Uploading image for food item:',
                                    createdFoodItem._id
                                )
                                console.log('Image file details:', {
                                    uri: foodItemImage.uri,
                                    type: foodItemImage.type,
                                    name:
                                        foodItemImage.fileName ||
                                        'food-item.jpg',
                                })
                                const updatedFoodItem =
                                    await uploadFoodItemImage(
                                        createdFoodItem._id,
                                        foodItemImage
                                    )
                                console.log(
                                    'Image uploaded successfully:',
                                    updatedFoodItem
                                )
                                finalFoodItem = updatedFoodItem // Use the updated food item with image
                            } catch (imageError) {
                                console.error(
                                    'Error uploading food item image:',
                                    imageError
                                )
                                console.error('Full error details:', {
                                    message: imageError.message,
                                    response: imageError.response?.data,
                                    status: imageError.response?.status,
                                })
                                Alert.alert(
                                    'Warning',
                                    'Food item created but image upload failed: ' +
                                        imageError.message
                                )
                            }
                        } else {
                            console.log('No image selected for food item')
                        }

                        onSubmit({
                            ...finalFoodItem,
                            quantity: formData.quantity,
                            unit: formData.unit,
                            expirationDate: formData.expirationDate,
                        })
                        reset()
                        // Reset quantities and locations except 'meal'
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
                    <CustomText style={formStyles.label}>
                        Valitse ostoslista
                    </CustomText>
                    <ToggleButton
                        label={displayText}
                        expanded={isExpanded}
                        onPress={toggleExpansion}
                        muted={!selectedList}
                    />

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
                {onClose && showBackButton && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onClose}
                        accessibilityRole="button"
                        accessibilityLabel="Takaisin"
                    >
                        <MaterialIcons name="arrow-back" size={22} color="#5844BB" />
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
                                        categories={categories}
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
                                    <View
                                        style={[
                                            formStyles.inputTrailing,
                                            styles.unitSelectWrap,
                                            unitMenuOpen &&
                                                styles.unitSelectWrapOpen,
                                        ]}
                                    >
                                        <TouchableOpacity
                                            style={styles.unitSelectButton}
                                            onPress={openUnitMenu}
                                            activeOpacity={0.7}
                                        >
                                            <CustomText
                                                style={styles.unitSelectText}
                                                numberOfLines={1}
                                            >
                                                {value || 'kpl'}
                                            </CustomText>
                                            <MaterialIcons
                                                name={
                                                    unitMenuOpen
                                                        ? 'expand-less'
                                                        : 'expand-more'
                                                }
                                                size={14}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                        {unitMenuOpen && (
                                            <View style={styles.unitDropdown}>
                                                <ScrollView
                                                    style={
                                                        styles.unitDropdownScroll
                                                    }
                                                    nestedScrollEnabled
                                                    keyboardShouldPersistTaps="handled"
                                                    bounces={false}
                                                >
                                                    {unitOptions.map((unit) => {
                                                        const selected =
                                                            value === unit
                                                        return (
                                                            <TouchableOpacity
                                                                key={unit}
                                                                style={[
                                                                    styles.unitOption,
                                                                    selected &&
                                                                        styles.unitOptionSelected,
                                                                ]}
                                                                onPress={() => {
                                                                    onChange(
                                                                        unit
                                                                    )
                                                                    closeUnitMenu()
                                                                }}
                                                                activeOpacity={
                                                                    0.7
                                                                }
                                                            >
                                                                <CustomText
                                                                    style={[
                                                                        styles.unitOptionText,
                                                                        selected &&
                                                                            styles.unitOptionTextSelected,
                                                                    ]}
                                                                >
                                                                    {unit}
                                                                </CustomText>
                                                            </TouchableOpacity>
                                                        )
                                                    })}
                                                </ScrollView>
                                            </View>
                                        )}
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
                            minimumDate={new Date()}
                            style={
                                unitMenuOpen
                                    ? styles.unitColumnBehind
                                    : undefined
                            }
                            testID="expiryDate"
                        />
                    )}

                    {showFoodFields && showNutrition && (
                        <CollapsibleFormSection
                            label="Ravintoarvot (per 100g/100ml)"
                            placeholder="Valinnainen"
                            expanded={nutritionExpanded}
                            onExpandedChange={setNutritionExpanded}
                            style={[
                                formStyles.fieldGroup,
                                styles.nutritionFieldGroup,
                                unitMenuOpen && styles.unitColumnBehind,
                            ]}
                        >
                            {NUTRITION_FIELDS.map((field) => (
                                <View
                                    key={field.name}
                                    style={styles.nutritionField}
                                >
                                    <CustomText style={formStyles.label}>
                                        {field.label}
                                    </CustomText>
                                    <View style={formStyles.inputRow}>
                                        <CustomInput
                                            control={control}
                                            name={field.name}
                                            placeholder="Valinnainen"
                                            variant="form"
                                            style={formStyles.inputInRow}
                                        />
                                        <View
                                            style={formStyles.inputTrailing}
                                        >
                                            <CustomText
                                                style={formStyles.inputMetric}
                                            >
                                                {field.unit}
                                            </CustomText>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </CollapsibleFormSection>
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
                    <View
                        style={[
                            styles.locationSelector,
                            unitMenuOpen && styles.unitColumnBehind,
                        ]}
                    >
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
                                                color="#5844BB"
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
    nutritionFieldGroup: {
       paddingTop: 10,
    },
    nutritionField: {
        marginTop: 12,
    },
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
    labelTitle: {
        paddingTop: 25,
        marginBottom: 15,
        fontWeight: 'bold',
        textAlign: 'left',
        fontSize: 16,
    },
    // inputAndIcon: rivi jossa input + yksikköteksti vierekkäin
    inputAndIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    // unitFormInput: pieni numerosyöttö lokaatiorivillä
    unitFormInput: {
        backgroundColor: 'white',
        borderColor: '#d1d5db',
        borderWidth: 1,
        height: 48,
        paddingHorizontal: 14,
        borderRadius: 8,
        fontSize: 16,
        width: 65,
        marginLeft: 10,
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
    shoppingListSelectorContainer: {
        marginLeft: 30,
        marginBottom: 5,
    },
    // Shopping List Inline Selector Styles
    shoppingListContainer: {
        marginBottom: 10,
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
        borderColor: '#5844BB',
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
    // Unit select in the same 48px trailing slot as € / kcal / calendar
    unitSelectWrap: {
        position: 'relative',
        zIndex: 1,
    },
    unitSelectWrapOpen: {
        zIndex: 200,
        elevation: 200,
    },
    unitFieldElevated: {
        position: 'relative',
        zIndex: 100,
        elevation: 100,
        ...(Platform.OS === 'web' && { overflow: 'visible' }),
    },
    unitSelectButton: {
        width: '100%',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 2,
    },
    unitSelectText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        lineHeight: 16,
        textAlign: 'center',
    },
    unitDropdown: {
        position: 'absolute',
        top: 44,
        right: 0,
        width: 88,
        zIndex: 300,
        elevation: 300,
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        ...(Platform.OS === 'web' && {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }),
    },
    unitDropdownScroll: {
        maxHeight: 220,
    },
    unitOption: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    unitOptionSelected: {
        backgroundColor: '#f3f0ff',
    },
    unitOptionText: {
        fontSize: 15,
        color: '#4b5563',
        textAlign: 'center',
    },
    unitOptionTextSelected: {
        color: '#5844BB',
        fontWeight: '600',
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
