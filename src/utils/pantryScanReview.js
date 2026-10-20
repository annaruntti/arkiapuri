import { shouldAutoSelectScanItem } from './scanReviewSelect'

export const SOURCE_LABELS = {
    catalog: 'Omasta tietokannasta',
    openfoodfacts: 'Open Food Facts',
    inferred: null,
}

export const itemMergeKey = (name) =>
    String(name || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\p{L}\p{N}]+/gu, '')

export const isSameCatalogProduct = (typedName, catalogName) => {
    const typedKey = itemMergeKey(typedName)
    const catalogKey = itemMergeKey(catalogName)
    return Boolean(typedKey && catalogKey && typedKey === catalogKey)
}

export const isHttpUrl = (value) =>
    /^https?:\/\//i.test(String(value || '').trim())

export const formatScanNumber = (value) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return ''
    return String(Math.round(parsed * 10) / 10).replace('.', ',')
}

export const formatNutritionLine = (nutrition, calories) => {
    const kcal = nutrition?.calories ?? calories
    if (!kcal) return null
    const parts = [`${Math.round(kcal)} kcal / 100 g`]
    if (nutrition?.proteins) {
        parts.push(`P ${formatScanNumber(nutrition.proteins)} g`)
    }
    if (nutrition?.carbohydrates) {
        parts.push(`H ${formatScanNumber(nutrition.carbohydrates)} g`)
    }
    if (nutrition?.fat) {
        parts.push(`R ${formatScanNumber(nutrition.fat)} g`)
    }
    return parts.join(' · ')
}

export const mapScanItemToRow = (item, index) => ({
    key: `${item.foodId || item.name}-${index}`,
    selected: shouldAutoSelectScanItem(item),
    name: item.name || '',
    quantity: String(item.quantity || 1),
    unit: item.unit || 'kpl',
    category: item.category || [],
    foodId: item.foodId,
    confidence: item.confidence,
    alreadyInPantry: Boolean(item.alreadyInPantry),
    notes: item.notes,
    calories: item.calories,
    nutrition: item.nutrition,
    matchSource: item.matchSource,
    matchName: item.matchName,
    barcode: item.barcode,
    imageUrl: item.imageUrl,
    lookingUp:
        String(item.name || '').trim().length >= 2 &&
        !item.matchSource &&
        !(item.calories || item.nutrition?.calories) &&
        !item.imageUrl,
})

export const applyLookupResult = (row, result) => {
    if (!result) return { ...row, lookingUp: false }
    const adoptedName = result.matchName || result.name
    const fromKnownSource =
        result.source === 'catalog' || result.source === 'openfoodfacts'
    if (!fromKnownSource) {
        return {
            ...row,
            lookingUp: false,
            barcode: result.barcode || row.barcode,
            imageUrl: result.imageUrl || row.imageUrl,
        }
    }
    const next = {
        ...row,
        lookingUp: false,
        name: adoptedName || row.name,
        category: result.category?.length ? result.category : row.category,
        calories: result.calories ?? row.calories,
        nutrition: result.nutrition ?? row.nutrition,
        foodId: result.source === 'catalog' ? result.foodId : null,
        matchSource: result.source,
        matchName: adoptedName,
        barcode: result.barcode || row.barcode,
        imageUrl: result.imageUrl || row.imageUrl,
    }
    return {
        ...next,
        selected: shouldAutoSelectScanItem(next),
    }
}
