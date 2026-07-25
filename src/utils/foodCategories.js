import categoriesData from '../data/categories.json'

/** Preferred section order when an item has multiple food categories. */
export const FOOD_CATEGORY_PRIORITY = [
    'Pakasteet',
    'Säilykkeet',
    'Maitotuotteet',
    'Kala',
    'Liha',
    'Kasviproteiinit',
    'Kasvikset',
    'Kuiva-aineet',
    'Juomat',
    'Mausteet',
    'Valmisateriat',
    'Leivontatarvikkeet',
    'Kuivatuotteet',
    'Jääkaappituotteet',
]

/** Product categories used in pantry / shopping list grouping and filters. */
export const getFoodProductCategories = () =>
    categoriesData.find((cat) => cat.id === 'ingredients')?.children || []

export const categoryMatches = (itemCategory, category) => {
    const value = String(itemCategory)
    return (
        value === String(category.id) ||
        value.toLowerCase() === String(category.name).toLowerCase()
    )
}

export const resolveFoodCategorySection = (
    item,
    categories = getFoodProductCategories()
) => {
    if (!item?.category || item.category.length === 0) return null

    for (const priorityName of FOOD_CATEGORY_PRIORITY) {
        const category = categories.find((cat) => cat.name === priorityName)
        if (!category) continue
        if (item.category.some((itemCat) => categoryMatches(itemCat, category))) {
            return category.name
        }
    }

    for (const category of categories) {
        if (item.category.some((itemCat) => categoryMatches(itemCat, category))) {
            return category.name
        }
    }

    return null
}

export const groupItemsByFoodCategory = (items) => {
    const categories = getFoodProductCategories()
    const grouped = {}
    const uncategorized = []

    items.forEach((item) => {
        const sectionName = resolveFoodCategorySection(item, categories)
        if (sectionName) {
            if (!grouped[sectionName]) grouped[sectionName] = []
            grouped[sectionName].push(item)
        } else {
            uncategorized.push(item)
        }
    })

    const sections = Object.keys(grouped)
        .sort()
        .map((title) => ({
            title,
            data: grouped[title],
        }))

    if (uncategorized.length > 0) {
        sections.push({
            title: 'Muut',
            data: uncategorized,
        })
    }

    return sections
}
