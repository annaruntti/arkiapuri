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

export const getMealRoleText = (role) => {
    if (!role) return 'Ei määritelty'
    return mealRoles[role.toLowerCase()] || role
}

export const getMealTypeText = (roles) => {
    if (!roles) return 'Ei määritelty'

    // Handle both single value and array
    const roleArray = Array.isArray(roles) ? roles : [roles]
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
