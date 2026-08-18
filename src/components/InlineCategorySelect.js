import { useState } from 'react'
import { View } from 'react-native'
import CheckboxOptionGrid from './CheckboxOptionGrid'
import ToggleButton from './ToggleButton'

const toCategoryItem = (parent, subcategory) => ({
    id: `${parent.id}-${subcategory.id}`,
    name: subcategory.name,
    parentId: parent.id,
    subcategoryId: subcategory.id,
})

const buildGroups = (categories = []) =>
    categories.map((parent) => ({
        title: parent.name,
        options: (parent.children || []).map((subcategory) => ({
            value: `${parent.id}-${subcategory.id}`,
            label: subcategory.name,
            item: toCategoryItem(parent, subcategory),
        })),
    }))

const normalizeSelected = (value = [], groups = []) => {
    const allOptions = groups.flatMap((group) => group.options)
    const items = Array.isArray(value) ? value : []

    return items
        .map((entry) => {
            if (entry && typeof entry === 'object' && entry.id) {
                return (
                    allOptions.find(
                        (option) => option.value === String(entry.id)
                    )?.item || entry
                )
            }
            const match = allOptions.find(
                (option) =>
                    option.value === String(entry) ||
                    option.label === String(entry) ||
                    String(option.item.subcategoryId) === String(entry)
            )
            return match?.item || null
        })
        .filter(Boolean)
}

const InlineCategorySelect = ({
    value = [],
    onChange,
    categories = [],
    placeholder = 'Valitse kategoriat',
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const groups = buildGroups(categories)
    const selectedCategories = normalizeSelected(value, groups)
    const selectedIds = selectedCategories.map((item) => String(item.id))

    const displayText =
        selectedCategories.length === 0
            ? placeholder
            : selectedCategories.map((item) => item.name).join(', ')

    const handleSelect = (ids) => {
        const allOptions = groups.flatMap((group) => group.options)
        const next = ids
            .map(
                (id) =>
                    allOptions.find((option) => option.value === String(id))
                        ?.item
            )
            .filter(Boolean)
        onChange?.(next)
    }

    return (
        <View>
            <ToggleButton
                label={displayText}
                expanded={isExpanded}
                onPress={() => setIsExpanded((open) => !open)}
                muted={selectedCategories.length === 0}
            />
            {isExpanded ? (
                <CheckboxOptionGrid
                    groups={groups}
                    value={selectedIds}
                    onSelect={handleSelect}
                />
            ) : null}
        </View>
    )
}

export default InlineCategorySelect
