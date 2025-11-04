import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'

const GenericFilterSection = ({
    selectedFilters,
    showFilters,
    filterTitle = 'Suodata:',
    categories = [],
    onToggleFilter,
    onClearFilters,
    getItemCounts = () => ({}),
    disabled = false,
    additionalFilterGroups = [],
}) => {
    const [expandedGroups, setExpandedGroups] = useState({
        main: true,
    })

    if (!showFilters) return null

    const itemCounts = getItemCounts()

    const toggleGroup = (groupKey) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }))
    }

    return (
        <View style={styles.filterSection}>
            <ScrollView
                style={styles.filterScrollView}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.filterContainer}>
                    {/* Main filter group (Diet) */}
                    <TouchableOpacity
                        style={styles.filterGroupHeader}
                        onPress={() => toggleGroup('main')}
                    >
                        <CustomText style={styles.filterTitle}>
                            {filterTitle}
                        </CustomText>
                        <MaterialIcons
                            name={
                                expandedGroups.main
                                    ? 'keyboard-arrow-up'
                                    : 'keyboard-arrow-down'
                            }
                            size={24}
                            color="#333"
                        />
                    </TouchableOpacity>

                    {expandedGroups.main && (
                        <>
                            <View style={styles.filterChipsContainer}>
                                {categories.map((category) => {
                                    // Normalize for comparison to handle number/string mismatches
                                    const isSelected = selectedFilters.some(
                                        (filterId) =>
                                            String(filterId) ===
                                            String(category.id)
                                    )
                                    const itemCount =
                                        itemCounts[category.id] || 0
                                    const isDisabled =
                                        itemCount === 0 || disabled

                                    return (
                                        <TouchableOpacity
                                            key={category.id}
                                            style={[
                                                styles.filterChip,
                                                isSelected &&
                                                    styles.filterChipSelected,
                                                isDisabled &&
                                                    styles.filterChipDisabled,
                                            ]}
                                            onPress={() =>
                                                onToggleFilter(category.id)
                                            }
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
                                                    style={
                                                        styles.filterChipIcon
                                                    }
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
                        </>
                    )}

                    {/* Additional filter groups */}
                    {additionalFilterGroups.map((group, index) => (
                        <View key={index} style={styles.additionalFilterGroup}>
                            <TouchableOpacity
                                style={styles.filterGroupHeader}
                                onPress={() => toggleGroup(`group_${index}`)}
                            >
                                <CustomText style={styles.filterGroupTitle}>
                                    {group.title}
                                </CustomText>
                                <MaterialIcons
                                    name={
                                        expandedGroups[`group_${index}`]
                                            ? 'keyboard-arrow-up'
                                            : 'keyboard-arrow-down'
                                    }
                                    size={24}
                                    color="#333"
                                />
                            </TouchableOpacity>

                            {expandedGroups[`group_${index}`] && (
                                <View style={styles.filterChipsContainer}>
                                    {group.options.map((option) => {
                                        const count = group.getItemCount
                                            ? group.getItemCount(option.value)
                                            : null
                                        return (
                                            <TouchableOpacity
                                                key={option.value}
                                                style={[
                                                    styles.filterChip,
                                                    group.selectedValue ===
                                                        option.value &&
                                                        styles.filterChipSelected,
                                                ]}
                                                onPress={() =>
                                                    group.onSelect(
                                                        group.selectedValue ===
                                                            option.value
                                                            ? null
                                                            : option.value
                                                    )
                                                }
                                            >
                                                <CustomText
                                                    style={[
                                                        styles.filterChipText,
                                                        group.selectedValue ===
                                                            option.value &&
                                                            styles.filterChipTextSelected,
                                                    ]}
                                                >
                                                    {option.label}
                                                </CustomText>
                                                {count !== null && (
                                                    <CustomText
                                                        style={[
                                                            styles.filterChipText,
                                                            group.selectedValue ===
                                                                option.value &&
                                                                styles.filterChipTextSelected,
                                                        ]}
                                                    >
                                                        ({count})
                                                    </CustomText>
                                                )}
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = {
    filterSection: {
        marginTop: 15,
        marginBottom: 15,
        width: '100%',
        maxHeight: 400,
    },
    filterScrollView: {
        maxHeight: 400,
    },
    filterContainer: {
        padding: 15,
        backgroundColor: 'rgb(248, 248, 248)',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
        borderRadius: 10,
    },
    filterGroupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: 'bold',
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
        color: '#fff',
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
    additionalFilterGroup: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    filterGroupTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
}

export default GenericFilterSection
