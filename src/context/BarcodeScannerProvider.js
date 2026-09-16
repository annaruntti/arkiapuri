import { createContext, useCallback, useContext, useRef, useState } from 'react'
import BarcodeScanner from '../components/BarcodeScanner'

const BarcodeScannerContext = createContext({
    isScannerOpen: false,
    openBarcodeScanner: () => {},
    registerScannerHost: () => () => {},
    completeScan: () => {},
    cancelScan: () => {},
})

export const BarcodeScannerProvider = ({ children }) => {
    const [isScannerOpen, setIsScannerOpen] = useState(false)
    const [hostCount, setHostCount] = useState(0)
    const callbacksRef = useRef({ onSuccess: null, onCancel: null })

    const openBarcodeScanner = useCallback(({ onSuccess, onCancel } = {}) => {
        callbacksRef.current = { onSuccess, onCancel }
        setIsScannerOpen(true)
    }, [])

    const registerScannerHost = useCallback(() => {
        setHostCount((count) => count + 1)
        return () => setHostCount((count) => Math.max(0, count - 1))
    }, [])

    const finish = useCallback((result) => {
        const { onSuccess, onCancel } = callbacksRef.current
        callbacksRef.current = { onSuccess: null, onCancel: null }
        setIsScannerOpen(false)
        if (result !== undefined) {
            onSuccess?.(result)
        } else {
            onCancel?.()
        }
    }, [])

    const completeScan = useCallback((barcode) => finish(barcode), [finish])
    const cancelScan = useCallback(() => finish(), [finish])

    return (
        <BarcodeScannerContext.Provider
            value={{
                isScannerOpen,
                openBarcodeScanner,
                registerScannerHost,
                completeScan,
                cancelScan,
            }}
        >
            {children}
            <BarcodeScanner
                isVisible={isScannerOpen && hostCount === 0}
                onScanSuccess={completeScan}
                onCancel={cancelScan}
            />
        </BarcodeScannerContext.Provider>
    )
}

export const useBarcodeScanner = () => useContext(BarcodeScannerContext)
