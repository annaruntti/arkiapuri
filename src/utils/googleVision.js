import axios from 'axios'
import { getServerUrl } from './getServerUrl'
import storage from './storage'
import * as ImageManipulator from 'expo-image-manipulator'

export const analyzeImage = async (base64Image) => {
    try {
        if (!base64Image) {
            throw new Error('No image data provided')
        }

        // Compress and resize the image
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            `data:image/jpeg;base64,${base64Image}`,
            [{ resize: { width: 600 } }],
            {
                compress: 0.5,
                format: ImageManipulator.SaveFormat.JPEG,
                base64: true,
            }
        )

        const token = await storage.getItem('userToken')

        if (!token) {
            throw new Error('Authentication token not found')
        }


        // Remove data URI prefix from base64
        const imageData = manipulatedImage.base64.replace(
            /^data:image\/\w+;base64,/,
            ''
        )


        try {
            const response = await axios.post(
                getServerUrl('/analyze-image'),
                {
                    image: imageData,
                    detectBarcodes: true,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    maxBodyLength: Infinity,
                    timeout: 15000,
                }
            )


            if (!response.data || !response.data.success) {
                throw new Error('Vision API request failed')
            }

            // Extract text from textAnnotations
            const textAnnotations = response.data.textAnnotations || []
            let text = ''

            if (textAnnotations.length > 0) {
                // First annotation contains the entire text
                text = textAnnotations[0].description || ''
            }

            // Format response to match what the app expects
            return {
                text: text,
                success: true,
                responses: [
                    {
                        textAnnotations,
                        labelAnnotations: response.data.labelAnnotations || [],
                        localizedObjectAnnotations:
                            response.data.localizedObjectAnnotations || [],
                    },
                ],
                textAnnotations: textAnnotations,
            }
        } catch (axiosError) {
            console.error('Axios error details:', {
                status: axiosError.response?.status,
                statusText: axiosError.response?.statusText,
                data: axiosError.response?.data,
                headers: axiosError.response?.headers,
            })
            throw axiosError
        }
    } catch (error) {
        console.error('Error analyzing image:', error)
        throw error
    }
}
