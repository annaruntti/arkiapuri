import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'

const GenericFilter = ({
    selectedFilters,
    showFilters,
    onToggleShowFilters,
    buttonText = 'Suodata',
    filterTitle = 'Suodata:',
    categories = [],
    onToggleFilter,
    onClearFilters,
    getItemCounts = () => ({}),
    disabled = false,
}) => {
    const renderFilterSection = () => {
        if (!showFilters) return null

        const itemCounts = getItemCounts()

        return (
            <View style={styles.filterSection}>
                <View style={styles.filterContainer}>
                    <CustomText style={styles.filterTitle}>
                        {filterTitle}
                    </CustomText>
                    <View style={styles.filterChipsContainer}>
                        {categories.map((category) => {
                            // Normalize for comparison to handle number/string mismatches
                            const isSelected = selectedFilters.some(
                                (filterId) =>
                                    String(filterId) === String(category.id)
                            )
                            const itemCount = itemCounts[category.id] || 0
                            const isDisabled = itemCount === 0 || disabled

                            return (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.filterChip,
                                        isSelected && styles.filterChipSelected,
                                        isDisabled && styles.filterChipDisabled,
                                    ]}
                                    onPress={() => onToggleFilter(category.id)}
                                    disabled={isDisabled}
                                >
                                    <CustomText
                                        style={[
                                            styles.filterChipText,
                                            isSelected &&
                                                styles.filterChipTextSelected,
                                            isDisabled &&
                                                styles.filterChipTextDisabled,
                                        ]}
                                    >
                                        {category.name}
                                    </CustomText>
                                    <CustomText
                                        style={[
                                            styles.filterChipText,
                                            isSelected &&
                                                styles.filterChipTextSelected,
                                            isDisabled &&
                                                styles.filterChipTextDisabled,
                                        ]}
                                    >
                                        ({itemCount})
                                    </CustomText>
                                    {isSelected && (
                                        <MaterialIcons
                                            name="close"
                                            size={16}
                                            color="#fff"
                                            style={styles.filterChipIcon}
                                        />
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    {selectedFilters.length > 0 && (
                        <TouchableOpacity
                            style={styles.clearFiltersButton}
                            onPress={onClearFilters}
                        >
                            <CustomText style={styles.clearFiltersText}>
                                Tyhjennä suodattimet
                            </CustomText>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }

    return (
        <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={onToggleShowFilters}
            disabled={disabled}
        >
            <MaterialIcons name="filter-list" size={20} color="#000" />
            <CustomText style={styles.tertiaryButtonText}>
                {buttonText}
            </CustomText>
            {selectedFilters.length > 0 && (
                <View style={styles.filterBadge}>
                    <CustomText style={styles.filterBadgeText}>
                        {selectedFilters.length}
                    </CustomText>
                </View>
            )}
            <MaterialIcons
                name={showFilters ? 'expand-less' : 'expand-more'}
                size={20}
                color="#000"
            />
        </TouchableOpacity>
    )
}

const styles = {
    tertiaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#9C86FC',
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 6,
        minHeight: 48,
    },
    tertiaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    filterBadge: {
        backgroundColor: '#9C86FC',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    filterBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
}

export default GenericFilter
