import { MaterialIcons } from '@expo/vector-icons'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'
import { getDifficultyText, getMealRoleText } from '../utils/mealUtils'

const ActiveFilterBanner = ({
    filterDifficulty,
    selectedDifficultyFilter,
    filterMaxCookingTime,
    selectedCookingTimeFilter,
    filterMealType,
    onClear,
}) => {
    // Don't render if no filters are active
    if (
        !filterDifficulty &&
        !selectedDifficultyFilter &&
        !filterMaxCookingTime &&
        !selectedCookingTimeFilter &&
        !filterMealType
    ) {
        return null
    }

    return (
        <View style={styles.activeFilterBanner}>
            <MaterialIcons name="filter-list" size={20} color="#9C86FC" />
            <CustomText style={styles.activeFilterText}>
                Näytetään:{' '}
                {(filterDifficulty || selectedDifficultyFilter) &&
                    `${getDifficultyText(
                        filterDifficulty || selectedDifficultyFilter
                    )}`}
                {(filterDifficulty || selectedDifficultyFilter) &&
                    (filterMaxCookingTime ||
                        selectedCookingTimeFilter ||
                        filterMealType) &&
                    ', '}
                {(filterMaxCookingTime || selectedCookingTimeFilter) &&
                    `Valmistusaika ≤ ${
                        filterMaxCookingTime || selectedCookingTimeFilter
                    } min`}
                {(filterMaxCookingTime || selectedCookingTimeFilter) &&
                    filterMealType &&
                    ', '}
                {filterMealType && `${getMealRoleText(filterMealType)}`}
            </CustomText>
            <TouchableOpacity
                onPress={onClear}
                style={styles.activeFilterCloseButton}
            >
                <MaterialIcons name="close" size={20} color="#666" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    activeFilterBanner: {
        backgroundColor: '#F3F0FF',
        borderLeftWidth: 4,
        borderLeftColor: '#9C86FC',
        padding: 12,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    activeFilterText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    activeFilterCloseButton: {
        padding: 4,
        marginLeft: 8,
    },
})

export default ActiveFilterBanner
