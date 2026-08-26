/** Parse amounts from number or string, including Finnish decimals (0,33). */
export const parseQuantityInput = (value, fallback = 1) => {
    if (value === undefined || value === null || value === '') {
        return fallback
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : fallback
    }
    const normalized = String(value)
        .trim()
        .replace(/\s/g, '')
        .replace(',', '.')
    const parsed = parseFloat(normalized)
    if (!Number.isFinite(parsed) || parsed < 0) {
        return fallback
    }
    return parsed
}
