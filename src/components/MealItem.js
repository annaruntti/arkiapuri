import ListItem from './ListItem'
import { MEAL_PLACEHOLDER_IMAGE_URL } from '../constants/images'
import { getDifficultyText, getMealCategoryText } from '../utils/mealUtils'

const MealItem = ({ item, onPress, onDelete }) => (
    <ListItem
        image={{ uri: item.image?.url || MEAL_PLACEHOLDER_IMAGE_URL }}
        title={item.name}
        subtitle={`${getMealCategoryText(item.mealCategory)} • ${getDifficultyText(item.difficultyLevel)} • ${item.cookingTime} min`}
        onPress={() => onPress(item)}
        onDelete={() => onDelete(item._id)}
        deleteAccessibilityLabel={`Poista ${item.name}`}
        style={{ backgroundColor: '#ffffff' }}
    />
)

export default MealItem
