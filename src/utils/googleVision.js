import axios from 'axios'
import { getServerUrl } from './getServerUrl'
import storage from './storage'
import * as ImageManipulator from 'expo-image-manipulator'

export const analyzeImage = async (base64Image) => {
    try {
        // Compress and resize the image more aggressively
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            `data:image/jpeg;base64,${base64Image}`,
            [
                { resize: { width: 500 } }, // Reduced from 800 to 500
            ],
            {
                compress: 0.3, // Increased compression (reduced from 0.5 to 0.3)
                format: ImageManipulator.SaveFormat.JPEG,
                base64: true,
            }
        )

        const token = await storage.getItem('userToken')
        const response = await axios.post(
            getServerUrl('/analyze-image'),
            { image: manipulatedImage.base64 },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                maxBodyLength: Infinity, // Add this to handle larger payloads
            }
        )
        return response.data
    } catch (error) {
        console.error('Error analyzing image:', error)
        throw error
    }
}
