export const getDifficultyText = (level) => {
    if (!level) return 'Ei määritelty'

    // Convert to lowercase for consistent comparison
    const lowerLevel = String(level).toLowerCase()

    switch (lowerLevel) {
        case 'easy':
            return 'Helppo'
        case 'medium':
            return 'Keskitaso'
        case 'hard':
            return 'Vaikea'
        default:
            return 'Ei määritelty'
    }
}

export const getDifficultyEnum = (level) => {
    const numLevel = parseInt(level)
    if (isNaN(numLevel) || numLevel < 1 || numLevel > 5) {
        return 'medium' // default value if invalid
    }
    if (numLevel <= 2) return 'easy'
    if (numLevel <= 4) return 'medium'
    return 'hard'
}

export const mealRoles = {
    breakfast: 'Aamiainen',
    lunch: 'Lounas',
    snack: 'Välipala',
    dinner: 'Päivällinen',
    supper: 'Iltapala',
    dessert: 'Jälkiruoka',
    other: 'Muu',
}

export const MEAL_ROLE_ORDER = Object.keys(mealRoles)

export const parseMealRoles = (raw, fallback = ['other']) => {
    const roles = []

    const visit = (value) => {
        if (value == null || value === '') return
        if (Array.isArray(value)) {
            value.forEach(visit)
            return
        }
        if (typeof value !== 'string') return

        const trimmed = value.trim()
        if (
            (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))
        ) {
            try {
                visit(JSON.parse(trimmed))
                return
            } catch (_error) {
                // Treat as a plain role string
            }
        }

        roles.push(trimmed)
    }

    visit(raw)
    return roles.length > 0 ? roles : fallback
}

export const getMealRoleText = (role) => {
    const [first] = parseMealRoles(role, [])
    if (!first) return 'Ei määritelty'
    return mealRoles[first.toLowerCase()] || first
}

export const getMealTypeText = (roles) => {
    const roleArray = parseMealRoles(roles, [])
    if (roleArray.length === 0) return 'Ei määritelty'
    return roleArray.map((role) => getMealRoleText(role)).join(', ')
}

export const formatDate = (dateString) => {
    if (!dateString) return 'Ei määritelty'
    const date = new Date(dateString)
    return date.toLocaleDateString('fi-FI', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
    })
}

export const mealCategories = {
    porridge: 'Puuro',
    pie: 'Piirakka',
    sandwich: 'Voileipä',
    salad: 'Salaatti',
    soup: 'Keitto',
    pasta: 'Pasta',
    pizza: 'Pizza',
    burger: 'Burgeri',
    wrap: 'Wrap',
    stew: 'Pataruoka',
    casserole: 'Uuniruoka',
    asian: 'Itämainen ruoka',
    texmex: 'TexMex',
    wok: 'Wokki',
    curry: 'Curry',
    steak: 'Pihvi',
    mincedMeat: 'Jauheliharuoka',
    vegetarian: 'Kasvisruoka',
    egg: 'Munaruoka',
    grill: 'Grilliruoka',
    fish: 'Kalaruoka',
    chicken: 'Kana, kalkkuna',
    lamb: 'Lammas',
    pork: 'Porsas',
    game: 'Riista',
    dessert: 'Jälkiruoka',
    other: 'Muu',
}

export const MEAL_CATEGORY_VALUES = Object.keys(mealCategories)

const mealCategoryByLower = Object.fromEntries(
    MEAL_CATEGORY_VALUES.map((key) => [key.toLowerCase(), key])
)

export const parseMealCategories = (raw, fallback = []) => {
    const categories = []

    const visit = (value) => {
        if (value == null || value === '') return
        if (Array.isArray(value)) {
            value.forEach(visit)
            return
        }
        if (typeof value !== 'string') return

        const trimmed = value.trim()
        if (
            (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))
        ) {
            try {
                visit(JSON.parse(trimmed))
                return
            } catch (_error) {
                // Treat as a plain category string
            }
        }

        categories.push(trimmed)
    }

    visit(raw)
    const unique = []
    const seen = new Set()
    for (const item of categories) {
        const canonical = mealCategoryByLower[String(item).toLowerCase()]
        if (!canonical || seen.has(canonical)) continue
        seen.add(canonical)
        unique.push(canonical)
    }
    return unique.length > 0 ? unique : fallback
}

export const getMealCategoryText = (category) => {
    const categories = parseMealCategories(category, [])
    if (categories.length === 0) return 'Ei määritelty'
    return categories.map((item) => mealCategories[item] || item).join(', ')
}
