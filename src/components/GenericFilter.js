import React from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import ClearFiltersButton from './ClearFiltersButton'
import CustomText from './CustomText'
import FilterChip from './FilterChip'

const GenericFilter = ({
    selectedFilters,
    showFilters,
    onToggleShowFilters,
    buttonText = 'Suodata',
    disabled = false,
}) => {

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

export const GenericFilterSection = ({
    selectedFilters,
    showFilters,
    filterTitle = 'Suodata:',
    categories = [],
    onToggleFilter,
    onClearFilters,
    getItemCounts = () => ({}),
    additionalFilterGroups = [],
    disabled = false,
}) => {
    const [expandedGroups, setExpandedGroups] = React.useState({
        main: true,
    })

    const toggleGroup = (groupKey) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }))
    }

    const itemCounts = getItemCounts()

    if (!showFilters) return null

    return (
        <View style={styles.filterSection}>
            <ScrollView
                style={styles.filterScrollView}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
            >
                <View style={styles.filterContainer}>
                    {/* Main filter group */}
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
                                        <FilterChip
                                            key={category.id}
                                            label={category.name}
                                            count={itemCount}
                                            isSelected={isSelected}
                                            isDisabled={isDisabled}
                                            onPress={() =>
                                                onToggleFilter(category.id)
                                            }
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
                                            <FilterChip
                                                key={option.value}
                                                label={option.label}
                                                count={count}
                                                isSelected={
                                                    group.selectedValue ===
                                                    option.value
                                                }
                                                isDisabled={false}
                                                onPress={() =>
                                                    group.onSelect(
                                                        group.selectedValue ===
                                                            option.value
                                                            ? null
                                                            : option.value
                                                    )
                                                }
                                            />
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

const styles = StyleSheet.create({
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
    filterSection: {
        marginTop: 15,
        maxHeight: 400,
        width: '100%',
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
})

export default GenericFilter
