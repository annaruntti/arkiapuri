import { View } from 'react-native'
import ClearFiltersButton from './ClearFiltersButton'
import CustomText from './CustomText'
import FilterChip from './FilterChip'

const CategoryFilterSection = ({
    categories,
    selectedFilters,
    onToggleFilter,
    onClearFilters,
    showFilters,
    filterTitle = 'Suodata kategorioittain:',
    itemCounts = {},
}) => {
    if (!showFilters) return null

    return (
        <View style={styles.filterSection}>
            <View style={styles.filterContainer}>
                <CustomText style={styles.filterTitle}>
                    {filterTitle}
                </CustomText>
                <View style={styles.filterChipsContainer}>
                    {categories.map((category) => {
                        const isSelected = selectedFilters.some(
                            (filterId) =>
                                String(filterId) === String(category.id)
                        )
                        const itemCount = itemCounts[category.id] || 0
                        const isDisabled = itemCount === 0

                        return (
                            <FilterChip
                                key={category.id}
                                label={category.name}
                                count={itemCount}
                                isSelected={isSelected}
                                isDisabled={isDisabled}
                                onPress={() => onToggleFilter(category.id)}
                            />
                        )
                    })}
                </View>
                {selectedFilters.length > 0 && (
                    <ClearFiltersButton
                        onPress={onClearFilters}
                        text="Tyhjennä suodattimet"
                    />
                )}
            </View>
        </View>
    )
}

const styles = {
    filterSection: {
        marginTop: 15,
        marginBottom: 15,
    },
    filterContainer: {
        padding: 15,
        backgroundColor: 'rgb(248, 248, 248)',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
        borderRadius: 10,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    filterChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
}

export default CategoryFilterSection
