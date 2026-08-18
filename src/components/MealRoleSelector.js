import { mealRoles, parseMealRoles } from '../utils/mealUtils'
import CheckboxOptionGrid from './CheckboxOptionGrid'

const MealRoleSelector = ({ value, onSelect }) => (
    <CheckboxOptionGrid
        options={Object.entries(mealRoles).map(([roleValue, label]) => ({
            value: roleValue,
            label,
        }))}
        value={parseMealRoles(value, [])}
        onSelect={onSelect}
    />
)

export default MealRoleSelector
