import ListItem from './ListItem'
import { MEAL_PLACEHOLDER_IMAGE_URL } from '../constants/images'
import { getDifficultyText, getMealCategoryText } from '../utils/mealUtils'

const mealSubtitle = (item) => {
    const parts = [
        getMealCategoryText(item.mealCategory),
        getDifficultyText(item.difficultyLevel),
    ]
    if (item.cookingTime != null && item.cookingTime !== '') {
        parts.push(`${item.cookingTime} min`)
    }
    return parts.filter(Boolean).join(' • ')
}

const MealItem = ({ item, onPress, onDelete, trailing, style }) => (
    <ListItem
        image={{ uri: item.image?.url || MEAL_PLACEHOLDER_IMAGE_URL }}
        title={item.name}
        subtitle={mealSubtitle(item)}
        onPress={onPress ? () => onPress(item) : undefined}
        onDelete={onDelete ? () => onDelete(item._id) : undefined}
        deleteAccessibilityLabel={`Poista ${item.name}`}
        trailing={trailing}
        style={[{ backgroundColor: '#ffffff' }, style]}
    />
)

export default MealItem
