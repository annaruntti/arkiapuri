/** Pre-select when Gemini is reasonably sure or a known product was matched. */
export const SCAN_AUTO_SELECT_CONFIDENCE = 0.35

export const shouldAutoSelectScanItem = (item) => {
    const confidence = Number(item?.confidence)
    const source = item?.matchSource
    if (source === 'catalog' || source === 'openfoodfacts') {
        return true
    }
    return Number.isFinite(confidence) && confidence >= SCAN_AUTO_SELECT_CONFIDENCE
}
