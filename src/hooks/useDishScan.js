import { useState } from 'react'
import { Alert, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

import {
    compressPantryScanImage,
    getAiEntitlement,
    scanDishImage,
} from '../services/aiApi'
import { pickScanImageFromLibrary } from '../utils/scanImage'
import storage from '../utils/storage'

const SCAN_DENY_CODES = new Set([
    'upgrade_required',
    'quota_exceeded',
    'household_too_large',
    'not_configured',
    'budget_exceeded',
])

/**
 * Meal dish-from-photo scan: entitlement gate + camera/library picker.
 */
const useDishScan = ({
    aiEntitlement,
    setAiEntitlement,
    setAiDraft,
    setModalVisible,
    showLoginPrompt,
    mapDishScanToFormDraft,
}) => {
    const [scanLockVisible, setScanLockVisible] = useState(false)
    const [scanLockReason, setScanLockReason] = useState('upgrade_required')
    const [scanLoading, setScanLoading] = useState(false)

    const showScanDenied = (reason) => {
        setScanLockReason(reason || 'upgrade_required')
        setScanLockVisible(true)
    }

    const runDishScan = async (asset) => {
        setScanLoading(true)
        try {
            const image = await compressPantryScanImage(asset)
            const result = await scanDishImage(image)
            setAiDraft(
                mapDishScanToFormDraft(result, image.previewAsset || asset)
            )
            setModalVisible(true)
            if (result.usage) {
                setAiEntitlement((prev) =>
                    prev
                        ? {
                              ...prev,
                              remainingCredits: result.usage.remainingCredits,
                              creditsUsed:
                                  (prev.creditLimit || 0) -
                                  result.usage.remainingCredits,
                          }
                        : prev
                )
            }
        } catch (error) {
            const code = error.code || error.response?.data?.code
            const message =
                error.response?.data?.message ||
                error.message ||
                'Skannaus epäonnistui'
            if (SCAN_DENY_CODES.has(code)) {
                showScanDenied(code)
                return
            }
            Alert.alert('Virhe', message)
        } finally {
            setScanLoading(false)
        }
    }

    const pickDishScanImage = async (fromCamera) => {
        try {
            if (fromCamera) {
                const { status } =
                    await ImagePicker.requestCameraPermissionsAsync()
                if (status !== 'granted') {
                    Alert.alert(
                        'Lupa tarvitaan',
                        'Tämä toiminto vaatii kameran käyttöoikeuden.'
                    )
                    return
                }
                const result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                })
                if (!result.canceled && result.assets?.[0]) {
                    await runDishScan(result.assets[0])
                }
                return
            }

            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert(
                    'Lupa tarvitaan',
                    'Tämä toiminto vaatii kuvakirjaston käyttöoikeuden.'
                )
                return
            }
            const picked = await pickScanImageFromLibrary()
            if (picked.error) {
                Alert.alert('Tiedostotyyppi ei kelpaa', picked.error)
                return
            }
            if (!picked.canceled && picked.asset) {
                await runDishScan(picked.asset)
            }
        } catch (error) {
            Alert.alert(
                'Virhe',
                'Kuvan valitseminen epäonnistui: ' +
                    (error.message || 'Tuntematon virhe')
            )
        }
    }

    const handleOpenDishScan = async () => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) {
                showLoginPrompt?.('meal_create', () => handleOpenDishScan())
                return
            }

            const entitlement =
                aiEntitlement || (await getAiEntitlement()).entitlement
            setAiEntitlement(entitlement)
            if (!entitlement?.hasAccess) {
                showScanDenied(entitlement?.denyCode)
                return
            }

            const openLibrary = () => pickDishScanImage(false)
            const openCamera = () => pickDishScanImage(true)

            if (Platform.OS === 'web') {
                await openLibrary()
                return
            }

            Alert.alert(
                'Lisää ateria kuvasta',
                'Ota kuva annoksesta tai valitse kuva galleriasta. AI ehdottaa nimeä, raaka-aineita ja valmistusohjetta.',
                [
                    { text: 'Kamera', onPress: openCamera },
                    { text: 'Galleria', onPress: openLibrary },
                    { text: 'Peruuta', style: 'cancel' },
                ]
            )
        } catch (error) {
            const code = error.response?.data?.code || error.code
            if (SCAN_DENY_CODES.has(code)) {
                showScanDenied(code)
                return
            }
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.message ||
                    'AI-skannausta ei voitu avata'
            )
        }
    }

    return {
        scanLockVisible,
        setScanLockVisible,
        scanLockReason,
        scanLoading,
        handleOpenDishScan,
    }
}

export default useDishScan
