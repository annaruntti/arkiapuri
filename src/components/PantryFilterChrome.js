import { View } from 'react-native'

import CustomText from './CustomText'
import GenericFilter from './GenericFilter'
import GenericFilterSection from './GenericFilterSection'
import ListSortControl from './ListSortControl'
import ListStatsRow from './ListStatsRow'
import PantryLocationChips from './PantryLocationChips'
import { PANTRY_SORT_OPTIONS } from '../utils/listSort'

/**
 * Location chips + sort/filter chrome for the pantry list.
 */
const PantryFilterChrome = ({
    pantryLocations,
    selectedLocationId,
    onSelectLocation,
    onManageLocations,
    unlocatedCount,
    sortId,
    onSortChange,
    selectedCategoryFilters,
    showFilters,
    onToggleShowFilters,
    filteredCount,
    totalCount,
    searchQuery,
    ingredientCategories,
    onToggleCategoryFilter,
    onClearCategoryFilters,
    getCategoryItemCounts,
}) => (
    <View>
        <PantryLocationChips
            locations={pantryLocations}
            selectedLocationId={selectedLocationId}
            onSelect={onSelectLocation}
            onManage={onManageLocations}
            unlocatedCount={unlocatedCount}
        />
        <ListStatsRow
            actions={
                <>
                    <ListSortControl
                        options={PANTRY_SORT_OPTIONS}
                        value={sortId}
                        onChange={onSortChange}
                    />
                    <GenericFilter
                        selectedFilters={selectedCategoryFilters}
                        showFilters={showFilters}
                        onToggleShowFilters={onToggleShowFilters}
                    />
                </>
            }
        >
            <CustomText>Tuotteita:</CustomText>
            <CustomText>
                {searchQuery.length > 0 || selectedCategoryFilters.length > 0
                    ? `${filteredCount} / ${totalCount}`
                    : `${totalCount} kpl`}
            </CustomText>
        </ListStatsRow>
        <GenericFilterSection
            selectedFilters={selectedCategoryFilters}
            showFilters={showFilters}
            filterTitle="Suodata kategorioittain:"
            categories={ingredientCategories}
            onToggleFilter={onToggleCategoryFilter}
            onClearFilters={onClearCategoryFilters}
            getItemCounts={getCategoryItemCounts}
        />
    </View>
)

export default PantryFilterChrome
