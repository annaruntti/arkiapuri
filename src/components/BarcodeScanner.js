import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { CameraView, useCameraPermissions } from 'expo-camera'
import {
    Alert,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import openFoodFactsApi from '../services/openFoodFactsApi'

const PRODUCT_BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128']

const BarcodeScanner = ({ onScanSuccess, onCancel, isVisible }) => {
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)
    const [flashEnabled, setFlashEnabled] = useState(false)

    useEffect(() => {
        if (!isVisible) {
            setScanned(false)
            setFlashEnabled(false)
            return
        }

        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission()
        }
    }, [isVisible, permission, requestPermission])

    const handleBarCodeScanned = ({ data }) => {
        if (scanned) return

        setScanned(true)
        if (openFoodFactsApi.isValidBarcode(data)) {
            onScanSuccess(openFoodFactsApi.cleanBarcode(data))
            return
        }

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

    if (!isVisible) {
        return null
    }

    const renderBody = () => {
        if (!permission) {
            return (
                <View style={styles.centered}>
                    <CustomText style={styles.text}>
                        Pyydetään kamera-oikeuksia...
                    </CustomText>
                </View>
            )
        }

        if (!permission.granted) {
            return (
                <View style={styles.centered}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onCancel}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    <CustomText style={styles.text}>
                        Kamera-oikeudet tarvitaan viivakoodin skannaamiseen
                    </CustomText>
                    <Button
                        title="Salli kamera"
                        onPress={requestPermission}
                        style={styles.permissionButton}
                    />
                    <Button title="Sulje" onPress={onCancel} />
                </View>
            )
        }

        return (
            <View style={styles.container}>
                <CameraView
                    facing="back"
                    enableTorch={flashEnabled}
                    barcodeScannerSettings={{
                        barcodeTypes: PRODUCT_BARCODE_TYPES,
                    }}
                    onBarcodeScanned={
                        scanned ? undefined : handleBarCodeScanned
                    }
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.overlay}>
                    <View style={styles.overlayTop}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onCancel}
                        >
                            <Ionicons name="close" size={30} color="#fff" />
                        </TouchableOpacity>
                        {Platform.OS !== 'web' ? (
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() =>
                                    setFlashEnabled((enabled) => !enabled)
                                }
                            >
                                <Ionicons
                                    name={flashEnabled ? 'flash' : 'flash-off'}
                                    size={30}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.iconButton} />
                        )}
                    </View>

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

                    <View style={styles.overlayBottom}>
                        {scanned ? (
                            <Button
                                title="Skannaa uudelleen"
                                onPress={() => setScanned(false)}
                                style={styles.rescanButton}
                            />
                        ) : null}
                    </View>
                </View>
            </View>
        )
    }

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            onRequestClose={onCancel}
        >
            {renderBody()}
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    centered: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        margin: 20,
    },
    permissionButton: {
        marginBottom: 12,
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
    iconButton: {
        padding: 10,
        minWidth: 50,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
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
