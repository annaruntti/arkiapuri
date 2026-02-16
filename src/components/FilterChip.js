import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import CustomText from './CustomText'

const FilterChip = ({
    label,
    count,
    isSelected,
    isDisabled,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected,
                isDisabled && styles.filterChipDisabled,
            ]}
            onPress={onPress}
            disabled={isDisabled}
        >
            <CustomText
                style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                    isDisabled && styles.filterChipTextDisabled,
                ]}
            >
                {label}
            </CustomText>
            {count !== null && count !== undefined && (
                <CustomText
                    style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextSelected,
                        isDisabled && styles.filterChipTextDisabled,
                    ]}
                >
                    ({count})
                </CustomText>
            )}
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
}

const styles = {
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
        opacity: 0.7,
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
        color: '#666',
    },
    filterChipIcon: {
        marginLeft: 4,
    },
}

export default FilterChip
