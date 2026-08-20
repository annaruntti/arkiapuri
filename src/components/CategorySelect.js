import InlineCategorySelect from './InlineCategorySelect'

const CategorySelect = ({
    value,
    onChange,
    categories,
    placeholder = 'Valitse kategoriat',
}) => {
    const handleChange = (items) => {
        onChange?.(items.map((item) => item.subcategoryId ?? item.id))
    }

    return (
        <InlineCategorySelect
            value={value}
            onChange={handleChange}
            categories={categories}
            placeholder={placeholder}
        />
    )
}

export default CategorySelect
