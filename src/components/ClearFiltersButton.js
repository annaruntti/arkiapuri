import { TouchableOpacity } from 'react-native'
import CustomText from './CustomText'

const ClearFiltersButton = ({ onPress, text }) => {
    return (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={onPress}>
            <CustomText style={styles.clearFiltersText}>{text}</CustomText>
        </TouchableOpacity>
    )
}

const styles = {
    clearFiltersButton: {
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    clearFiltersText: {
        fontSize: 14,
        color: '#7c3aed',
        textDecorationLine: 'underline',
    },
}

export default ClearFiltersButton
