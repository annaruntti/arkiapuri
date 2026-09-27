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
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Button from './Button'
import CustomText from './CustomText'
import openFoodFactsApi from '../services/openFoodFactsApi'

const PRODUCT_BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128']

const ScannerBody = ({
    permission,
    requestPermission,
    scanned,
    setScanned,
    flashEnabled,
    setFlashEnabled,
    cameraReady,
    onScanSuccess,
    onCancel,
}) => {
    const insets = useSafeAreaInsets()
    const topPad = Math.max(insets.top, 12) + 8
    const bottomPad = Math.max(insets.bottom, 8) + 12

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
            <View style={[styles.centered, { paddingTop: topPad }]}>
                <TouchableOpacity
                    style={[styles.iconButton, styles.permissionClose]}
                    onPress={onCancel}
                    accessibilityRole="button"
                    accessibilityLabel="Sulje"
                >
                    <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>
                <CustomText style={styles.text}>
                    Kamera-oikeudet tarvitaan viivakoodin skannaamiseen
                </CustomText>
                <Button
                    title="Salli kamera"
                    type="PRIMARY"
                    onPress={requestPermission}
                    style={styles.permissionButton}
                />
                <Button
                    title="Sulje"
                    type="TERTIARY"
                    onPress={onCancel}
                />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {cameraReady ? (
                <CameraView
                    facing="back"
                    enableTorch={flashEnabled}
                    barcodeScannerSettings={{
                        barcodeTypes: PRODUCT_BARCODE_TYPES,
                    }}
                    onBarcodeScanned={
                        scanned ? undefined : handleBarCodeScanned
                    }
                    style={styles.camera}
                />
            ) : (
                <View style={styles.camera} />
            )}

            <View
                pointerEvents="box-none"
                style={[styles.topBar, { paddingTop: topPad }]}
            >
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onCancel}
                    accessibilityRole="button"
                    accessibilityLabel="Sulje"
                >
                    <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>
                {Platform.OS !== 'web' ? (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setFlashEnabled((enabled) => !enabled)}
                        accessibilityRole="button"
                        accessibilityLabel={
                            flashEnabled ? 'Sammuta salama' : 'Sytytä salama'
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

            <View pointerEvents="none" style={styles.frameWrap}>
                <CustomText style={styles.instructionText}>
                    Kohdista viivakoodi ruudun keskelle
                </CustomText>
                <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
            </View>

            <View
                pointerEvents="box-none"
                style={[styles.bottomBar, { paddingBottom: bottomPad }]}
            >
                {scanned ? (
                    <Button
                        title="Skannaa uudelleen"
                        type="SECONDARY"
                        onPress={() => setScanned(false)}
                        style={styles.actionButton}
                    />
                ) : null}
                <Button
                    title="Peruuta"
                    type="TERTIARY"
                    onPress={onCancel}
                    style={styles.actionButton}
                />
            </View>
        </View>
    )
}

const BarcodeScanner = ({ onScanSuccess, onCancel, isVisible }) => {
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)
    const [flashEnabled, setFlashEnabled] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)

    useEffect(() => {
        if (!isVisible) {
            setScanned(false)
            setFlashEnabled(false)
            setCameraReady(false)
            return undefined
        }

        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission()
        }

        const timer = setTimeout(() => setCameraReady(true), 50)
        return () => clearTimeout(timer)
    }, [isVisible, permission, requestPermission])

    if (!isVisible) {
        return null
    }

    return (
        <Modal
            visible
            animationType="fade"
            presentationStyle="fullScreen"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <ScannerBody
                permission={permission}
                requestPermission={requestPermission}
                scanned={scanned}
                setScanned={setScanned}
                flashEnabled={flashEnabled}
                setFlashEnabled={setFlashEnabled}
                cameraReady={cameraReady}
                onScanSuccess={onScanSuccess}
                onCancel={onCancel}
            />
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
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
    permissionClose: {
        position: 'absolute',
        top: 8,
        right: 12,
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingBottom: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        paddingHorizontal: 24,
        paddingTop: 16,
        gap: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    frameWrap: {
        position: 'absolute',
        top: '38%',
        left: 0,
        right: 0,
        zIndex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    iconButton: {
        padding: 10,
        minWidth: 50,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanFrame: {
        width: 250,
        height: 150,
        position: 'relative',
        marginTop: 16,
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    actionButton: {
        width: '100%',
    },
})

export default BarcodeScanner
