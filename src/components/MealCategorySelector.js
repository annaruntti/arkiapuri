import { mealCategories, parseMealCategories } from '../utils/mealUtils'
import CheckboxOptionGrid from './CheckboxOptionGrid'

const MealCategorySelector = ({ value, onSelect }) => (
    <CheckboxOptionGrid
        options={Object.entries(mealCategories).map(
            ([categoryValue, label]) => ({
                value: categoryValue,
                label,
            })
        )}
        value={parseMealCategories(value, [])}
        onSelect={onSelect}
    />
)

export default MealCategorySelector
