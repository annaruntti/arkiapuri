import { MaterialIcons } from '@expo/vector-icons'
import { useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'
import ClearFiltersButton from './ClearFiltersButton'
import CustomText from './CustomText'
import FilterChip from './FilterChip'

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
