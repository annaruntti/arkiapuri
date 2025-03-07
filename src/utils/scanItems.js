import * as ImagePicker from 'expo-image-picker'
import axios from 'axios'
import { Alert } from 'react-native'
import { analyzeImage } from './googleVision'
import storage from './storage'
import { getServerUrl } from './getServerUrl'

// Process the Google Vision API results
export const processVisionResults = (visionResponse) => {
    try {
        console.log(
            'Processing vision response:',
            JSON.stringify(visionResponse, null, 2)
        )

        // Extract all available information
        const text = visionResponse.text || ''
        const labels = visionResponse.responses[0]?.labelAnnotations || []
        const objects =
            visionResponse.responses[0]?.localizedObjectAnnotations || []

        // Helper function to clean and normalize text
        const normalizeText = (text) => {
            return text.toLowerCase().replace(/\s+/g, ' ').trim()
        }

        // Identify product type from labels and objects
        const productType = identifyProductType(labels, objects)

        // Process text to get product name
        const productName = identifyProductName(text, labels, productType)

        // Determine category based on product type and labels
        const category = determineCategory(productType, labels)

        // Determine unit based on product type
        const unit = determineUnit(productType)

        return [
            {
                name: productName || 'Tunnistamaton tuote',
                quantity: 1,
                unit: unit,
                price: 0,
                confidence: 0.8,
                category: category,
            },
        ]
    } catch (error) {
        console.error('Error processing vision results:', error)
        return [
            {
                name: 'Tunnistamaton tuote',
                quantity: 1,
                unit: 'kpl',
                price: 0,
                confidence: 0.5,
                category: ['Kuiva-aineet'],
            },
        ]
    }
}

// Helper functions
const identifyProductType = (labels, objects) => {
    // Check labels first (they're usually more specific)
    const labelDescriptions = labels.map((l) => l.description.toLowerCase())

    // Specific product type detection
    if (
        labelDescriptions.includes('drink can') ||
        labelDescriptions.includes('carbonated soft drinks') ||
        labelDescriptions.includes('soft drink')
    ) {
        return 'soft_drink'
    }
    if (
        labelDescriptions.includes('milk') ||
        labelDescriptions.includes('dairy')
    ) {
        return 'dairy'
    }
    if (
        labelDescriptions.includes('bread') ||
        labelDescriptions.includes('bakery')
    ) {
        return 'bakery'
    }
    if (
        labelDescriptions.includes('fruit') ||
        labelDescriptions.includes('vegetable')
    ) {
        return 'produce'
    }
    if (
        labelDescriptions.includes('meat') ||
        labelDescriptions.includes('fish')
    ) {
        return 'meat'
    }
    if (labelDescriptions.includes('food')) {
        return 'food'
    }

    // Check objects if no specific label found
    const objectNames = objects.map((o) => o.name.toLowerCase())
    if (objectNames.includes('drink') || objectNames.includes('bottle')) {
        return 'beverage'
    }

    return 'unknown'
}

const identifyProductName = (text, labels, productType) => {
    const words = text.split(/[\n\s]+/)
    const normalizedText = text.toLowerCase()

    // Brand-specific recognition
    const brands = {
        soft_drink: {
            'pepsi max': ['pepsi', 'max'],
            'coca-cola': ['coca', 'cola'],
            fanta: ['fanta'],
            sprite: ['sprite'],
            'mountain dew': ['mountain', 'dew'],
            'dr pepper': ['dr', 'pepper'],
        },
        dairy: {
            valio: ['valio'],
            arla: ['arla'],
            oatly: ['oatly'],
            alpro: ['alpro'],
        },
        food: {
            fazer: ['fazer'],
            rainbow: ['rainbow'],
            pirkka: ['pirkka'],
            kotimaista: ['kotimaista'],
            atria: ['atria'],
            hk: ['hk'],
            snellman: ['snellman'],
        },
    }

    // Check for brand matches based on product type
    if (productType in brands) {
        for (const [brand, keywords] of Object.entries(brands[productType])) {
            if (keywords.every((keyword) => normalizedText.includes(keyword))) {
                // Try to extract additional product info after brand name
                const brandIndex = normalizedText.indexOf(keywords[0])
                const restOfText = text.slice(brandIndex + keywords[0].length)
                const additionalInfo = restOfText.trim()

                return additionalInfo ? `${brand} ${additionalInfo}` : brand
            }
        }
    }

    // Default to using the first meaningful text
    return words.filter((w) => w.length > 2).join(' ') || null
}

const determineCategory = (productType, labels) => {
    // Map product types to categories
    const categoryMap = {
        soft_drink: ['Juomat'],
        dairy: ['Maitotuotteet'],
        bakery: ['Leipä'],
        produce: ['Hedelmät ja vihannekset'],
        meat: ['Liha ja kala'],
        beverage: ['Juomat'],
        food: ['Kuiva-aineet'],
    }

    // Return mapped category or try to determine from labels
    if (productType in categoryMap) {
        return categoryMap[productType]
    }

    // Try to determine from labels
    const labelDescriptions = labels.map((l) => l.description.toLowerCase())

    if (
        labelDescriptions.includes('drink') ||
        labelDescriptions.includes('beverage')
    ) {
        return ['Juomat']
    }
    if (
        labelDescriptions.includes('snack') ||
        labelDescriptions.includes('candy')
    ) {
        return ['Herkut']
    }
    if (labelDescriptions.includes('frozen')) {
        return ['Pakasteet']
    }

    return ['Kuiva-aineet']
}

const determineUnit = (productType) => {
    switch (productType) {
        case 'soft_drink':
            return 'kpl'
        case 'food':
            return 'kpl'
        default:
            return 'kpl'
    }
}

// Add scanned item to a specific location (pantry, meal, or shopping list)
export const addScannedItem = async (item, location = 'pantry') => {
    try {
        const token = await storage.getItem('userToken')
        const axiosConfig = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 second timeout
        }

        // 1. Create the FoodItem
        const foodItemData = {
            name: item.name,
            category: item.category || ['Kuiva-aineet'],
            unit: item.unit || 'kpl',
            price: item.price || 0,
            calories: item.calories || 0,
            locations: [location],
            quantities: {
                meal: location === 'meal' ? item.quantity || 1 : 0,
                'shopping-list':
                    location === 'shopping-list' ? item.quantity || 1 : 0,
                pantry: location === 'pantry' ? item.quantity || 1 : 0,
            },
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }

        const foodItemResponse = await axios.post(
            getServerUrl('/food-items'),
            foodItemData,
            axiosConfig
        )

        if (!foodItemResponse.data.success) {
            throw new Error('Failed to create food item')
        }

        // 2. Add item to the specific location
        const locationItemData = {
            name: item.name,
            quantity: item.quantity || 1,
            unit: item.unit || 'kpl',
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            foodId: foodItemResponse.data.foodItem._id,
            category: item.category || ['Kuiva-aineet'],
            calories: item.calories || 0,
            price: item.price || 0,
            addedFrom: location,
        }

        const endpoint =
            location === 'pantry'
                ? '/pantry/items'
                : location === 'meal'
                  ? '/meals/items'
                  : '/shopping-list/items'

        const locationResponse = await axios.post(
            getServerUrl(endpoint),
            locationItemData,
            axiosConfig
        )

        return locationResponse.data
    } catch (error) {
        console.error('Error adding scanned item:', error)
        throw error
    }
}

// Main scanning function
export const scanItems = async (location = 'pantry') => {
    try {
        // Request camera permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert(
                'Virhe',
                'Tarvitsemme kameran käyttöoikeuden skannataksemme tuotteita'
            )
            return null
        }

        // Take a photo
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: 'images',
            quality: 0.8,
            base64: true,
            allowsEditing: true,
        })

        if (result.canceled) {
            return null
        }

        if (!result.assets?.[0]?.base64) {
            throw new Error('No image data received from camera')
        }

        console.log('Image captured, analyzing...')

        // Analyze the image
        const visionResponse = await analyzeImage(result.assets[0].base64)

        console.log('Vision response:', JSON.stringify(visionResponse, null, 2))

        if (!visionResponse || !visionResponse.success) {
            throw new Error('Image analysis failed')
        }

        // Process the results
        const detectedProducts = processVisionResults(visionResponse)

        console.log(
            'Detected products:',
            JSON.stringify(detectedProducts, null, 2)
        )

        if (!detectedProducts || !detectedProducts.length) {
            throw new Error('No products detected in image')
        }

        // Add items to the specified location
        const addItemResponse = await addScannedItem(
            detectedProducts[0],
            location
        )

        console.log(
            'Add item response:',
            JSON.stringify(addItemResponse, null, 2)
        )

        if (!addItemResponse || !addItemResponse.success) {
            throw new Error('Failed to add scanned item')
        }

        return addItemResponse
    } catch (error) {
        console.error('Error scanning items:', error)
        throw error
    }
}
