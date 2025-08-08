import { Ionicons } from '@expo/vector-icons'
import { BarCodeScanner } from 'expo-barcode-scanner'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from './Button'
import CustomText from './CustomText'

const BarcodeScanner = ({ onScanSuccess, onCancel, isVisible }) => {
    const [hasPermission, setHasPermission] = useState(null)
    const [scanned, setScanned] = useState(false)
    const [flashEnabled, setFlashEnabled] = useState(false)

    useEffect(() => {
        ;(async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync()
            setHasPermission(status === 'granted')
        })()
    }, [])

    const handleBarCodeScanned = ({ type, data }) => {
        if (scanned) return

        setScanned(true)
        console.log('Barcode scanned:', { type, data })

        // Validate barcode
        if (isValidBarcode(data)) {
            onScanSuccess(data)
        } else {
            Alert.alert(
                'Virheellinen viivakoodi',
                'Skannattu viivakoodi ei ole kelvollinen. Yritä uudelleen.',
                [
                    {
                        text: 'OK',
                        onPress: () => setScanned(false),
                    },
                ]
            )
        }
    }

    const isValidBarcode = (barcode) => {
        // Remove any spaces or hyphens
        const cleanBarcode = barcode.replace(/[\s-]/g, '')
        // Check if it's a valid EAN-13, UPC-A, or EAN-8
        return /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(cleanBarcode)
    }

    const resetScanner = () => {
        setScanned(false)
    }

    const toggleFlash = () => {
        setFlashEnabled(!flashEnabled)
    }

    if (!isVisible) {
        return null
    }

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <CustomText style={styles.text}>
                    Pyydetään kamera-oikeuksia...
                </CustomText>
            </View>
        )
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <CustomText style={styles.text}>
                    Kamera-oikeudet tarvitaan viivakoodin skannaamiseen
                </CustomText>
                <Button
                    title="Avaa asetukset"
                    onPress={() => {
                        if (Platform.OS === 'ios') {
                            Alert.alert(
                                'Kamera-oikeudet',
                                'Mene Asetukset > Arkiapuri > Kamera ja salli kameran käyttö.',
                                [{ text: 'OK' }]
                            )
                        } else {
                            Alert.alert(
                                'Kamera-oikeudet',
                                'Mene Asetukset > Sovellukset > Arkiapuri > Oikeudet ja salli kameran käyttö.',
                                [{ text: 'OK' }]
                            )
                        }
                    }}
                />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
                flashMode={
                    flashEnabled
                        ? BarCodeScanner.Constants.FlashMode.torch
                        : BarCodeScanner.Constants.FlashMode.off
                }
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Top overlay */}
                <View style={styles.overlayTop}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onCancel}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.flashButton}
                        onPress={toggleFlash}
                    >
                        <Ionicons
                            name={flashEnabled ? 'flash' : 'flash-off'}
                            size={30}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>

                {/* Scanning area */}
                <View style={styles.scanArea}>
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <CustomText style={styles.instructionText}>
                        Kohdista viivakoodi ruudun keskelle
                    </CustomText>
                </View>

                {/* Bottom overlay */}
                <View style={styles.overlayBottom}>
                    {scanned && (
                        <Button
                            title="Skannaa uudelleen"
                            onPress={resetScanner}
                            style={styles.rescanButton}
                        />
                    )}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        margin: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50,
    },
    closeButton: {
        padding: 10,
    },
    flashButton: {
        padding: 10,
    },
    scanArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 150,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#fff',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
    instructionText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    rescanButton: {
        backgroundColor: '#9C86FC',
        marginBottom: 20,
    },
})

export default BarcodeScanner
