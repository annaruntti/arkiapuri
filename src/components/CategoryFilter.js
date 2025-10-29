import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'

const CategoryFilter = ({
    selectedFilters,
    showFilters,
    onToggleShowFilters,
    buttonText = 'Suodata',
}) => {
    return (
        <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={onToggleShowFilters}
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
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
}

export default CategoryFilter
