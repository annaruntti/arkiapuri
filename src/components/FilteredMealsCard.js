import React from 'react'
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import { useResponsiveDimensions } from '../utils/responsive'

const FilteredMealsCard = ({
    title,
    subtitle,
    image,
    filterDifficulty,
    filterMaxCookingTime,
    filterMealType,
    onPress,
}) => {
    const { isTablet } = useResponsiveDimensions()

    return (
        <TouchableOpacity
            style={[styles.card, isTablet && styles.tabletCard]}
            onPress={onPress}
        >
            <Image source={image} style={styles.image} />
            <View style={styles.content}>
                <CustomText style={styles.title}>{title}</CustomText>
                <CustomText style={styles.subtitle}>{subtitle}</CustomText>
            </View>
            <MaterialIcons
                name="arrow-forward"
                size={24}
                color="#9C86FC"
                style={styles.arrow}
            />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tabletCard: {
        padding: 20,
        marginBottom: 20,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    arrow: {
        marginLeft: 8,
    },
})

export default FilteredMealsCard

