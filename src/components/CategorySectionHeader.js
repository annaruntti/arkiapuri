import { StyleSheet, View } from 'react-native'
import CustomText from './CustomText'

const CategorySectionHeader = ({ title, count, showCount = true }) => {
    return (
        <View style={styles.sectionHeader}>
            <CustomText style={styles.sectionHeaderText}>
                {title}
                {showCount && count !== undefined && ` (${count})`}
            </CustomText>
        </View>
    )
}

const styles = StyleSheet.create({
    sectionHeader: {
        marginTop: 16,
        marginBottom: 8,
    },
    sectionHeaderText: {
        fontSize: 16,
        color: '#1f2937',
    },
})

export default CategorySectionHeader
