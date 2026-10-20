/**
 * Normalize category values from forms, OFF drafts, and API payloads
 * into a flat string array suitable for find-or-create / list APIs.
 */
export const normalizeCategoryArray = (category) => {
    let catArray = category
    if (typeof catArray === 'string') {
        try {
            catArray = JSON.parse(catArray)
        } catch {
            catArray = catArray.trim() ? [catArray] : []
        }
    }
    if (!Array.isArray(catArray)) return []
    return catArray
        .map((cat) => {
            if (typeof cat === 'object' && cat !== null) {
                return cat.name || cat.id || String(cat)
            }
            return String(cat)
        })
        .filter((cat) => cat && String(cat).trim() !== '')
}
