export const NUTRITION_FIELDS = [
    { name: 'calories', label: 'Kalorit', unit: 'kcal' },
    { name: 'proteins', label: 'Proteiini', unit: 'g' },
    { name: 'carbohydrates', label: 'Hiilihydraatit', unit: 'g' },
    { name: 'sugars', label: 'Sokerit', unit: 'g' },
    { name: 'fat', label: 'Rasva', unit: 'g' },
    { name: 'saturatedFat', label: 'Tyydyttynyt rasva', unit: 'g' },
    { name: 'fiber', label: 'Kuitu', unit: 'g' },
    { name: 'salt', label: 'Suola', unit: 'g' },
]

export const getItemNutrition = (item) =>
    item?.nutrition || item?.openFoodFactsData?.nutrition || {}

/** Non-zero nutrition rows for read-only detail views. */
export const getVisibleNutritionRows = (item) => {
    const nutrition = getItemNutrition(item)
    const offNutrition = item?.openFoodFactsData?.nutrition || {}
    const caloriesValue =
        item?.calories || nutrition.calories || offNutrition.calories || '0'

    return NUTRITION_FIELDS.map((field) => {
        const value =
            field.name === 'calories'
                ? caloriesValue
                : nutrition[field.name] ?? offNutrition[field.name]
        const numeric = parseFloat(value)
        return {
            key: field.name,
            label: field.label,
            unit: field.unit,
            value: Number.isFinite(numeric) && numeric !== 0 ? numeric : null,
        }
    }).filter((row) => row.value != null)
}

export const getInitialNutritionValue = (initialValues, fieldName) => {
    if (fieldName === 'calories') {
        return (
            initialValues?.nutrition?.calories ??
            initialValues?.calories ??
            initialValues?.openFoodFactsData?.nutrition?.calories ??
            ''
        )
    }
    return (
        initialValues?.nutrition?.[fieldName] ??
        initialValues?.openFoodFactsData?.nutrition?.[fieldName] ??
        ''
    )
}

export const hasAnyInitialNutrition = (initialValues) =>
    NUTRITION_FIELDS.some((field) => {
        const value = getInitialNutritionValue(initialValues, field.name)
        return value !== '' && value != null && Number(value) !== 0
    })

/** Build nutrition payload from react-hook-form food-item fields. */
export const buildNutritionFromFormData = (data) => {
    if (data?.isFood === false) return undefined
    return {
        calories: parseFloat(data.calories) || 0,
        proteins: parseFloat(data.proteins) || 0,
        carbohydrates: parseFloat(data.carbohydrates) || 0,
        sugars: parseFloat(data.sugars) || 0,
        fat: parseFloat(data.fat) || 0,
        saturatedFat: parseFloat(data.saturatedFat) || 0,
        fiber: parseFloat(data.fiber) || 0,
        salt: parseFloat(data.salt) || 0,
    }
}
