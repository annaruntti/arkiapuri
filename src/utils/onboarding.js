import storage from './storage'

export const ONBOARDING_STORAGE_KEY = 'hasCompletedOnboarding'

export const readOnboardingComplete = async () => {
    const value = await storage.getItem(ONBOARDING_STORAGE_KEY)
    return value === true || value === 'true'
}

export const writeOnboardingComplete = async () => {
    await storage.setItem(ONBOARDING_STORAGE_KEY, true)
}
