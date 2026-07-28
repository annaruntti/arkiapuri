const DEFAULT_PREFERENCES = {
    showNutrition: true,
    personalizationCompleted: false,
}

export const getUserPreferences = (profile) => {
    const prefs = profile?.preferences || {}
    return {
        showNutrition:
            typeof prefs.showNutrition === 'boolean'
                ? prefs.showNutrition
                : DEFAULT_PREFERENCES.showNutrition,
        personalizationCompleted:
            typeof prefs.personalizationCompleted === 'boolean'
                ? prefs.personalizationCompleted
                : DEFAULT_PREFERENCES.personalizationCompleted,
    }
}

export const getShowNutrition = (profile) =>
    getUserPreferences(profile).showNutrition

export const hasCompletedPersonalization = (profile) =>
    getUserPreferences(profile).personalizationCompleted
