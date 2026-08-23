import { useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import ClearFiltersButton from './ClearFiltersButton'
import CustomText from './CustomText'
import ExpandableListPanel, {
    ExpandableListChipRow,
} from './ExpandableListPanel'
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

    const itemCounts = getItemCounts()

    const toggleGroup = (groupKey) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }))
    }

    return (
        <ExpandableListPanel visible={showFilters} scrollable>
            <TouchableOpacity
                style={styles.filterGroupHeader}
                onPress={() => toggleGroup('main')}
            >
                <CustomText style={styles.filterTitle}>{filterTitle}</CustomText>
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
                    <ExpandableListChipRow>
                        {categories.map((category) => {
                            const isSelected = selectedFilters.some(
                                (filterId) =>
                                    String(filterId) === String(category.id)
                            )
                            const itemCount = itemCounts[category.id] || 0
                            const isDisabled = itemCount === 0 || disabled

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
                    </ExpandableListChipRow>
                    {selectedFilters.length > 0 && (
                        <ClearFiltersButton
                            onPress={onClearFilters}
                            text="Tyhjennä suodattimet"
                        />
                    )}
                </>
            )}

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
                        <ExpandableListChipRow>
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
                                            group.selectedValue === option.value
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
                        </ExpandableListChipRow>
                    )}
                </View>
            ))}
        </ExpandableListPanel>
    )
}

const styles = {
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
