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
    salad: 'Salaatti',
    pasta: 'Pasta',
    soup: 'Keitto',
    casserole: 'Uuniruoka',
    stew: 'Pataruoka',
    pizza: 'Pizza',
    texmex: 'TexMex',
    burger: 'Burgeri',
    steak: 'Pihvi',
    fish: 'Kalaruoka',
    vegetarian: 'Kasvisruoka',
    other: 'Muu',
}

export const getMealCategoryText = (category) => {
    if (!category) return 'Ei määritelty'
    return mealCategories[category.toLowerCase()] || 'Ei määritelty'
}
