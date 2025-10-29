import React from 'react'
import { View } from 'react-native'
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

const styles = {
    sectionHeader: {
        backgroundColor: '#F0EBFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#9C86FC',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
    },
    sectionHeaderText: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 0.5,
    },
}

export default CategorySectionHeader
