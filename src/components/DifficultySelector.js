import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'

const DifficultySelector = ({ value, onSelect, showLabel = true }) => {
    const difficulties = [1, 2, 3, 4, 5]

    const getDifficultyLabel = (level) => {
        if (level <= 2) return 'Helppo'
        if (level <= 4) return 'Keskitaso'
        return 'Vaikea'
    }

    const getDifficultyColor = (level, isSelected) => {
        if (!isSelected) return '#E0E0E0'

        if (level <= 2) return '#4CAF50' // Green for easy
        if (level <= 4) return '#FF9800' // Orange for medium
        return '#F44336' // Red for hard
    }

    return (
        <View style={styles.container}>
            <View style={styles.iconsContainer}>
                {difficulties.map((level) => {
                    const isSelected = parseInt(value) >= level
                    return (
                        <TouchableOpacity
                            key={level}
                            style={[
                                styles.iconButton,
                                isSelected && styles.selectedIcon,
                            ]}
                            onPress={() => onSelect(level.toString())}
                        >
                            <MaterialIcons
                                name="restaurant"
                                size={32}
                                color={getDifficultyColor(level, isSelected)}
                            />
                        </TouchableOpacity>
                    )
                })}
            </View>
            {showLabel && value && (
                <CustomText style={styles.difficultyLabel}>
                    {getDifficultyLabel(parseInt(value))}
                </CustomText>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 10,
    },
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginVertical: 10,
    },
    iconButton: {
        padding: 8,
        borderRadius: 25,
        backgroundColor: '#F5F5F5',
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
    },
    selectedIcon: {
        backgroundColor: '#FFF',
        borderColor: '#DDD',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    difficultyLabel: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
})

export default DifficultySelector
