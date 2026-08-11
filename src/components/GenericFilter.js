import { TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'

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
            <MaterialIcons name="filter-list" size={18} color="#000" />
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
                size={18}
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
        borderColor: '#5844BB',
        borderRadius: 25,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 4,
        minHeight: 40,
    },
    tertiaryButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    filterBadge: {
        backgroundColor: '#AE9CFC',
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

export default GenericFilter
