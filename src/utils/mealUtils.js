export const getDifficultyText = (level) => {
    if (!level) return 'Ei määritelty'

    switch (level.toUpperCase()) {
        case 'EASY':
            return 'Helppo'
        case 'MEDIUM':
            return 'Keskitaso'
        case 'HARD':
            return 'Vaikea'
        default:
            return 'Ei määritelty'
    }
}

export const getMealTypeText = (roles) => {
    if (!roles || roles.length === 0) return 'Ei määritelty'

    return roles
        .map((role) => {
            switch (role.toLowerCase()) {
                case 'dinner':
                    return 'Päivällinen'
                case 'lunch':
                    return 'Lounas'
                case 'breakfast':
                    return 'Aamupala'
                case 'snack':
                    return 'Välipala'
                case 'dessert':
                    return 'Jälkiruoka'
                default:
                    return role
            }
        })
        .join(', ')
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
