import { useLogin } from '../context/LoginProvider'
import { getShowNutrition } from '../utils/userPreferences'

export const useShowNutrition = () => {
    const { profile } = useLogin()
    return getShowNutrition(profile)
}

export default useShowNutrition
