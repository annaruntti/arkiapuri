export const normalizeRecipeSteps = (value) => {
    if (!Array.isArray(value)) return []
    return value.map((step) => String(step || '').trim()).filter(Boolean)
}

export const joinRecipeSteps = (steps) =>
    (steps || [])
        .map((step) => String(step || '').trim())
        .filter(Boolean)
        .map((step, index) => `${index + 1}. ${step}`)
        .join('\n')

const stripStepPrefix = (line) =>
    String(line || '')
        .replace(/^\s*(?:\d+[\.\):]|[-*•])\s+/, '')
        .trim()

export const splitRecipeTextToSteps = (recipe) => {
    const text = String(recipe || '').trim()
    if (!text) return ['']
    const lines = text
        .split(/\r?\n/)
        .map(stripStepPrefix)
        .filter(Boolean)
    return lines.length ? lines : [text]
}

export const resolveRecipeSteps = (recipeSteps, recipe) => {
    const fromArray = normalizeRecipeSteps(recipeSteps)
    if (fromArray.length) return fromArray
    const fromText = splitRecipeTextToSteps(recipe)
    return fromText.length === 1 && !fromText[0] ? [''] : fromText
}
