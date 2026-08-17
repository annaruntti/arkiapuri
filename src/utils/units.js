export const APP_UNITS = ['kpl', 'g', 'kg', 'l', 'dl', 'ml', 'tl', 'rkl']

export const resolveAppUnit = (unit) => {
    const normalized = String(unit || 'kpl').trim().toLowerCase()
    if (normalized === 'pcs' || normalized === 'piece' || normalized === 'pieces') {
        return 'kpl'
    }
    if (APP_UNITS.includes(normalized)) return normalized
    return 'kpl'
}
