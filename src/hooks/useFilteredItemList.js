import { useCallback, useMemo, useState } from 'react'
import {
    categoryMatches,
    getFoodProductCategories,
    groupItemsByFoodCategory,
} from '../utils/foodCategories'
import { SORT_OPTION_IDS, sortListItems } from '../utils/listSort'

/**
 * Shared search + category filter + sort state for pantry and shopping list screens.
 */
export const useFilteredItemList = ({
    items = [],
    postFilter = (filtered) => filtered,
    groupItems = groupItemsByFoodCategory,
    defaultSortId = SORT_OPTION_IDS.NAME_ASC,
}) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategoryFilters, setSelectedCategoryFilters] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [sortId, setSortId] = useState(defaultSortId)

    const ingredientCategories = useMemo(
        () => getFoodProductCategories(),
        []
    )

    const filterItemsBySearch = useCallback(
        (list) => {
            if (!searchQuery.trim()) {
                return list
            }

            const query = searchQuery.toLowerCase().trim()
            return list.filter((item) =>
                item.name.toLowerCase().includes(query)
            )
        },
        [searchQuery]
    )

    const filterItemsByCategory = useCallback(
        (list) => {
            if (selectedCategoryFilters.length === 0) {
                return list
            }

            return list.filter((item) => {
                if (!item.category || item.category.length === 0) {
                    return false
                }

                return selectedCategoryFilters.some((filterId) => {
                    const category = ingredientCategories.find(
                        (cat) => String(cat.id) === String(filterId)
                    )
                    if (!category) return false
                    return item.category.some((itemCat) =>
                        categoryMatches(itemCat, category)
                    )
                })
            })
        },
        [ingredientCategories, selectedCategoryFilters]
    )

    const toggleCategoryFilter = useCallback((categoryId) => {
        setSelectedCategoryFilters((prev) => {
            const normalizedId = String(categoryId)
            const isSelected = prev.some((id) => String(id) === normalizedId)

            if (isSelected) {
                return prev.filter((id) => String(id) !== normalizedId)
            }

            return [...prev, normalizedId]
        })
    }, [])

    const getCategoryItemCounts = useCallback(() => {
        const counts = {}
        const searchedItems = filterItemsBySearch(items)

        ingredientCategories.forEach((category) => {
            counts[category.id] = searchedItems.filter((item) => {
                if (!item.category || item.category.length === 0) {
                    return false
                }
                return item.category.some((itemCat) =>
                    categoryMatches(itemCat, category)
                )
            }).length
        })

        return counts
    }, [filterItemsBySearch, ingredientCategories, items])

    const filteredItems = useMemo(
        () =>
            sortListItems(
                postFilter(filterItemsByCategory(filterItemsBySearch(items))),
                sortId
            ),
        [
            filterItemsByCategory,
            filterItemsBySearch,
            items,
            postFilter,
            sortId,
        ]
    )

    const itemSections = useMemo(
        () => groupItems(filteredItems),
        [filteredItems, groupItems]
    )

    return {
        searchQuery,
        setSearchQuery,
        selectedCategoryFilters,
        setSelectedCategoryFilters,
        showFilters,
        setShowFilters,
        sortId,
        setSortId,
        ingredientCategories,
        toggleCategoryFilter,
        getCategoryItemCounts,
        filteredItems,
        itemSections,
    }
}
