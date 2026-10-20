import { useState } from 'react'
import { Alert, Platform } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

import {
    compressPantryScanImage,
    getAiEntitlement,
    scanPantryImage,
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
 * Pantry AI-scan picker + entitlement gate.
 */
const usePantryScan = ({
    pantryLocations,
    aiEntitlement,
    setAiEntitlement,
    showLoginPrompt,
    setLocationsEditorVisible,
}) => {
    const [scanLocationPickerVisible, setScanLocationPickerVisible] =
        useState(false)
    const [scanLocation, setScanLocation] = useState(null)
    const [scanRemovals, setScanRemovals] = useState([])
    const [scanLockVisible, setScanLockVisible] = useState(false)
    const [scanLockReason, setScanLockReason] = useState('upgrade_required')
    const [scanReviewVisible, setScanReviewVisible] = useState(false)
    const [scanCandidates, setScanCandidates] = useState([])
    const [scanUsage, setScanUsage] = useState(null)
    const [scanLoading, setScanLoading] = useState(false)

    const showScanDenied = (reason) => {
        setScanLockReason(reason || 'upgrade_required')
        setScanLockVisible(true)
    }

    const runPantryScan = async (asset, location) => {
        if (!location?._id) {
            Alert.alert('Virhe', 'Valitse ensin säilytyspaikka.')
            return
        }
        setScanLoading(true)
        try {
            const image = await compressPantryScanImage(asset)
            const result = await scanPantryImage(image, {
                locationId: location._id,
            })
            setScanLocation(location)
            setScanCandidates(result.items || [])
            setScanRemovals(result.suggestedRemovals || [])
            setScanUsage(result.usage || null)
            setScanReviewVisible(true)
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

    const pickPantryScanImage = async (fromCamera, location) => {
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
                    await runPantryScan(result.assets[0], location)
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
                await runPantryScan(picked.asset, location)
            }
        } catch (error) {
            Alert.alert(
                'Virhe',
                'Kuvan valitseminen epäonnistui: ' +
                    (error.message || 'Tuntematon virhe')
            )
        }
    }

    const handleOpenPantryScan = async () => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) {
                showLoginPrompt?.('save', () => handleOpenPantryScan())
                return
            }

            const entitlement =
                aiEntitlement || (await getAiEntitlement()).entitlement
            setAiEntitlement(entitlement)
            if (!entitlement?.hasAccess) {
                showScanDenied(entitlement?.denyCode)
                return
            }

            if (!pantryLocations.length) {
                Alert.alert(
                    'Säilytyspaikka puuttuu',
                    'Lisää ensin jääkaappi, pakastin tai kuivakaappi.'
                )
                setLocationsEditorVisible?.(true)
                return
            }

            setScanLocationPickerVisible(true)
        } catch (error) {
            const code = error.response?.data?.code
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

    const startScanForLocation = async (location) => {
        setScanLocationPickerVisible(false)
        setScanLocation(location)
        const openLibrary = () => pickPantryScanImage(false, location)
        const openCamera = () => pickPantryScanImage(true, location)

        if (Platform.OS === 'web') {
            await openLibrary()
            return
        }

        Alert.alert(
            `Skannaa: ${location.name}`,
            'Ota kuva tästä paikasta tai valitse kuva galleriasta.',
            [
                { text: 'Kamera', onPress: openCamera },
                { text: 'Galleria', onPress: openLibrary },
                { text: 'Peruuta', style: 'cancel' },
            ]
        )
    }

    return {
        scanLocationPickerVisible,
        setScanLocationPickerVisible,
        scanLocation,
        setScanLocation,
        scanRemovals,
        setScanRemovals,
        scanLockVisible,
        setScanLockVisible,
        scanLockReason,
        scanReviewVisible,
        setScanReviewVisible,
        scanCandidates,
        setScanCandidates,
        scanUsage,
        setScanUsage,
        scanLoading,
        handleOpenPantryScan,
        startScanForLocation,
    }
}

export default usePantryScan
