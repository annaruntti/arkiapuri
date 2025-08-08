import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

/**
 * Open Food Facts API client for the mobile app
 */
class OpenFoodFactsApi {
    constructor() {
        this.baseUrl = getServerUrl('')
    }

    /**
     * Get authentication headers
     */
    async getAuthHeaders() {
        const token = await storage.getItem('userToken')
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        }
    }

    /**
     * Search product by barcode
     * @param {string} barcode - Product barcode
     * @returns {Promise<Object>} Product data
     */
    async searchByBarcode(barcode) {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/openfoodfacts/barcode/${barcode}`,
                {
                    method: 'GET',
                    headers: await this.getAuthHeaders(),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch product')
            }

            return data
        } catch (error) {
            console.error('Error searching by barcode:', error)
            throw error
        }
    }

    /**
     * Search products by text query
     * @param {string} query - Search query
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Search results
     */
    async searchByText(query, page = 1, limit = 20) {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/openfoodfacts/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: await this.getAuthHeaders(),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to search products')
            }

            return data
        } catch (error) {
            console.error('Error searching by text:', error)
            throw error
        }
    }

    /**
     * Search products by category
     * @param {string} category - Category name
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Search results
     */
    async searchByCategory(category, page = 1, limit = 20) {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/openfoodfacts/category/${category}?page=${page}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: await this.getAuthHeaders(),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to search by category')
            }

            return data
        } catch (error) {
            console.error('Error searching by category:', error)
            throw error
        }
    }

    /**
     * Get popular categories
     * @returns {Promise<Array>} Categories list
     */
    async getCategories() {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/openfoodfacts/categories`,
                {
                    method: 'GET',
                    headers: await this.getAuthHeaders(),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch categories')
            }

            return data
        } catch (error) {
            console.error('Error fetching categories:', error)
            throw error
        }
    }

    /**
     * Get product suggestions for autocomplete
     * @param {string} query - Partial product name
     * @param {number} limit - Maximum suggestions
     * @returns {Promise<Array>} Suggestions list
     */
    async getSuggestions(query, limit = 10) {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/openfoodfacts/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: await this.getAuthHeaders(),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch suggestions')
            }

            return data
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            throw error
        }
    }

    /**
     * Add Open Food Facts product to user's food items
     * @param {string} barcode - Product barcode
     * @param {string} location - Where to add (meal, shopping-list, pantry)
     * @param {number} quantity - Quantity to add
     * @param {string} unit - Unit of measurement
     * @returns {Promise<Object>} Added food item
     */
    async addToFoodItems(
        barcode,
        location = 'shopping-list',
        quantity = 1,
        unit = 'pcs'
    ) {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/openfoodfacts/add/${barcode}`,
                {
                    method: 'POST',
                    headers: await this.getAuthHeaders(),
                    body: JSON.stringify({
                        location,
                        quantity,
                        unit,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to add product')
            }

            return data
        } catch (error) {
            console.error('Error adding product to food items:', error)
            throw error
        }
    }

    /**
     * Enrich existing food item with Open Food Facts data
     * @param {string} foodItemId - Food item ID
     * @param {string} barcode - Product barcode
     * @returns {Promise<Object>} Enriched food item
     */
    async enrichFoodItem(foodItemId, barcode) {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/openfoodfacts/enrich/${foodItemId}`,
                {
                    method: 'POST',
                    headers: await this.getAuthHeaders(),
                    body: JSON.stringify({
                        barcode,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to enrich food item')
            }

            return data
        } catch (error) {
            console.error('Error enriching food item:', error)
            throw error
        }
    }

    /**
     * Validate barcode format
     * @param {string} barcode - Barcode to validate
     * @returns {boolean} True if valid
     */
    isValidBarcode(barcode) {
        // Remove any spaces or hyphens
        const cleanBarcode = barcode.replace(/[\s-]/g, '')
        // Check if it's a valid EAN-13, UPC-A, or EAN-8
        return /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(cleanBarcode)
    }

    /**
     * Clean barcode format
     * @param {string} barcode - Raw barcode
     * @returns {string} Cleaned barcode
     */
    cleanBarcode(barcode) {
        return barcode.replace(/[\s-]/g, '')
    }
}

export default new OpenFoodFactsApi()
