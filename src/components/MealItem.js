import ListItem from './ListItem'
import { getDifficultyText, getMealCategoryText } from '../utils/mealUtils'

const PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/3b9imD6TDC4i68V4uHVgL1/1ac1194dccb086bb52ebd674c59983e3/undraw_breakfast_rgx5.png'

const MealItem = ({ item, onPress, onDelete }) => (
    <ListItem
        image={{ uri: item.image?.url || PLACEHOLDER_IMAGE_URL }}
        title={item.name}
        subtitle={`${getMealCategoryText(item.mealCategory)} • ${getDifficultyText(item.difficultyLevel)} • ${item.cookingTime} min`}
        onPress={() => onPress(item)}
        onDelete={() => onDelete(item._id)}
        deleteAccessibilityLabel={`Poista ${item.name}`}
    />
)

export default MealItem
