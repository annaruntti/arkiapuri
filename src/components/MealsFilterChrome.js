import { View } from 'react-native'

import ActiveFilterBanner from './ActiveFilterBanner'
import CustomText from './CustomText'
import GenericFilter from './GenericFilter'
import GenericFilterSection from './GenericFilterSection'
import ListSortControl from './ListSortControl'
import ListStatsRow from './ListStatsRow'
import {
    getDifficultyText,
    mealRoles,
} from '../utils/mealUtils'
import {
    getMealCountByDifficulty,
    getMealCountByCookingTime,
    getMealCountByType,
} from '../utils/mealFilters'
import { getMealCountsForCategories } from '../utils/mealGrouping'
import { MEAL_SORT_OPTIONS } from '../utils/listSort'

/**
 * Search-adjacent filter/stats chrome for the meals list.
 */
const MealsFilterChrome = ({
    filterDifficulty,
    selectedDifficultyFilter,
    setSelectedDifficultyFilter,
    filterMaxCookingTime,
    selectedCookingTimeFilter,
    setSelectedCookingTimeFilter,
    activeMealTypeFilter,
    selectedMealTypeFilter,
    setSelectedMealTypeFilter,
    onClearNavigationFilters,
    sortId,
    setSortId,
    selectedDietFilters,
    setSelectedDietFilters,
    showFilters,
    setShowFilters,
    dietCategories,
    onToggleDietFilter,
    searchedMeals,
    filteredMealsCount,
    mealsCount,
    searchQuery,
    hasActiveFilters,
}) => (
    <View>
        <ActiveFilterBanner
            filterDifficulty={filterDifficulty}
            selectedDifficultyFilter={selectedDifficultyFilter}
            filterMaxCookingTime={filterMaxCookingTime}
            selectedCookingTimeFilter={selectedCookingTimeFilter}
            filterMealType={activeMealTypeFilter}
            onClear={onClearNavigationFilters}
        />
        <ListStatsRow
            actions={
                <>
                    <ListSortControl
                        options={MEAL_SORT_OPTIONS}
                        value={sortId}
                        onChange={setSortId}
                    />
                    <GenericFilter
                        selectedFilters={selectedDietFilters}
                        showFilters={showFilters}
                        onToggleShowFilters={() =>
                            setShowFilters(!showFilters)
                        }
                    />
                </>
            }
        >
            <CustomText>
                Aterioita:{' '}
                {searchQuery.length > 0 || hasActiveFilters
                    ? `${filteredMealsCount} / ${mealsCount}`
                    : `${filteredMealsCount} kpl`}
            </CustomText>
        </ListStatsRow>
        <GenericFilterSection
            selectedFilters={selectedDietFilters}
            showFilters={showFilters}
            filterTitle="Suodata ruokavalioin mukaan"
            categories={dietCategories}
            onToggleFilter={onToggleDietFilter}
            onClearFilters={() => setSelectedDietFilters([])}
            getItemCounts={() => getMealCountsForCategories(searchedMeals)}
            additionalFilterGroups={[
                {
                    title: 'Ateriatyyppi',
                    selectedValue: selectedMealTypeFilter,
                    onSelect: setSelectedMealTypeFilter,
                    getItemCount: (mealType) =>
                        getMealCountByType(searchedMeals, mealType),
                    options: Object.entries(mealRoles).map(
                        ([value, label]) => ({
                            value,
                            label,
                        })
                    ),
                },
                {
                    title: 'Vaikeustaso',
                    selectedValue: selectedDifficultyFilter,
                    onSelect: setSelectedDifficultyFilter,
                    getItemCount: (difficulty) =>
                        getMealCountByDifficulty(searchedMeals, difficulty),
                    options: [
                        {
                            value: 'easy',
                            label: getDifficultyText('easy'),
                        },
                        {
                            value: 'medium',
                            label: getDifficultyText('medium'),
                        },
                        {
                            value: 'hard',
                            label: getDifficultyText('hard'),
                        },
                    ],
                },
                {
                    title: 'Valmistusaika',
                    selectedValue: selectedCookingTimeFilter,
                    onSelect: setSelectedCookingTimeFilter,
                    getItemCount: (maxTime) =>
                        getMealCountByCookingTime(searchedMeals, maxTime),
                    options: [
                        { value: 15, label: '≤ 15 min' },
                        { value: 30, label: '≤ 30 min' },
                        { value: 45, label: '≤ 45 min' },
                        { value: 60, label: '≤ 60 min' },
                    ],
                },
            ]}
        />
    </View>
)

export default MealsFilterChrome
