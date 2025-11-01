import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useResponsiveDimensions } from '../utils/responsive'
import CustomText from './CustomText'

const FilteredMealsCard = ({
    title,
    subtitle,
    image,
    filterDifficulty,
    filterMaxCookingTime,
    filterMealType,
    onPress,
}) => {
    const { isTablet, isDesktop } = useResponsiveDimensions()

    return (
        <TouchableOpacity
            style={[
                styles.card,
                isTablet && styles.tabletCard,
                isDesktop && styles.desktopCard,
            ]}
            onPress={onPress}
        >
            <Image
                source={image}
                style={[styles.image, isDesktop && styles.desktopImage]}
            />
            <View style={styles.content}>
                <CustomText
                    style={[styles.title, isDesktop && styles.desktopTitle]}
                >
                    {title}
                </CustomText>
                <CustomText
                    style={[
                        styles.subtitle,
                        isDesktop && styles.desktopSubtitle,
                    ]}
                >
                    {subtitle}
                </CustomText>
            </View>
            <MaterialIcons
                name="arrow-forward"
                size={isDesktop ? 28 : 24}
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
        marginHorizontal: 7,
    },
    tabletCard: {
        padding: 20,
        marginBottom: 20,
        marginHorizontal: 15,
    },
    desktopCard: {
        padding: 24,
        marginBottom: 24,
        marginHorizontal: 60,
        maxWidth: 730,
        alignSelf: 'center',
        width: '90%',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    desktopImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
        marginRight: 20,
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
    desktopTitle: {
        fontSize: 20,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    desktopSubtitle: {
        fontSize: 16,
    },
    arrow: {
        marginLeft: 8,
    },
})

export default FilteredMealsCard
