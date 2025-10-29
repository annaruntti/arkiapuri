import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'

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
                        // Normalize for comparison to handle number/string mismatches
                        const isSelected = selectedFilters.some(
                            (filterId) =>
                                String(filterId) === String(category.id)
                        )
                        const itemCount = itemCounts[category.id] || 0
                        const isDisabled = itemCount === 0

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
                                        color="#000"
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
    filterChip: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterChipSelected: {
        backgroundColor: '#9C86FC',
        borderColor: '#9C86FC',
    },
    filterChipDisabled: {
        backgroundColor: '#f5f5f5',
        opacity: 0.5,
    },
    filterChipText: {
        fontSize: 14,
        color: '#333',
        marginRight: 4,
    },
    filterChipTextSelected: {
        color: '#000',
        fontWeight: 'bold',
    },
    filterChipTextDisabled: {
        color: '#999',
    },
    filterChipIcon: {
        marginLeft: 4,
    },
    clearFiltersButton: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    clearFiltersText: {
        fontSize: 12,
        color: '#9C86FC',
        textDecorationLine: 'underline',
    },
}

export default CategoryFilterSection
