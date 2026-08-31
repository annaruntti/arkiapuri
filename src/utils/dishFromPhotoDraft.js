import { normalizeMealFoodItem } from './mealFoodItem'
import { parseMealCategories, parseMealRoles } from './mealUtils'
import { DEFAULT_SERVINGS, normalizeServings } from './mealServings'

export const SOURCE_LABELS = {
    catalog: 'Omasta tietokannasta',
    openfoodfacts: 'Open Food Facts',
    inferred: 'Arvio',
}

export const difficultyToSelectorValue = (level) => {
    const raw = String(level || '').toLowerCase()
    if (raw === 'easy') return '2'
    if (raw === 'hard') return '5'
    if (raw === 'medium') return '3'
    return ''
}

export const mapDishIngredientToFoodItem = (item) =>
    normalizeMealFoodItem({
        name: item.name,
        foodId: item.foodId || undefined,
        _id: item.foodId || undefined,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        calories: item.calories,
        nutrition: item.nutrition,
        barcode: item.barcode,
        image: item.imageUrl ? { url: item.imageUrl } : undefined,
        openFoodFactsData:
            item.barcode || item.imageUrl
                ? {
                      barcode: item.barcode,
                      imageUrl: item.imageUrl,
                      nutrition: item.nutrition,
                  }
                : undefined,
        matchSource: item.matchSource,
        visibleInPhoto: item.visibleInPhoto,
        confidence: item.confidence,
    })

export const mapDishScanToFormDraft = (result, imageAsset) => {
    const meal = result?.meal || {}
    return {
        name: meal.name || '',
        recipe: meal.recipe || '',
        cookingTime: meal.cookingTime ? String(meal.cookingTime) : '',
        difficultyLevel: difficultyToSelectorValue(meal.difficultyLevel),
        defaultRoles: parseMealRoles(meal.defaultRoles, ['dinner']),
        mealCategory: parseMealCategories(meal.mealCategory, []),
        servings: normalizeServings(meal.servings || DEFAULT_SERVINGS),
        foodItems: (result?.ingredients || []).map(mapDishIngredientToFoodItem),
        image: imageAsset || null,
    }
}
