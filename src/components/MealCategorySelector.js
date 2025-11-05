import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { mealCategories } from '../utils/mealUtils'
import CustomText from './CustomText'

const MealCategorySelector = ({ value, onSelect }) => {
    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {Object.entries(mealCategories).map(([categoryValue, label]) => (
                    <Pressable
                        key={categoryValue}
                        style={styles.gridItem}
                        onPress={() => onSelect(categoryValue)}
                    >
                        <View
                            style={[
                                styles.radioButton,
                                value === categoryValue &&
                                    styles.radioButtonChecked,
                            ]}
                        >
                            {value === categoryValue && (
                                <View style={styles.radioButtonInner} />
                            )}
                        </View>
                        <CustomText style={styles.label}>{label}</CustomText>
                    </Pressable>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 5,
        marginBottom: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        width: '48%',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#9C86FC',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonChecked: {
        borderColor: '#9C86FC',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#9C86FC',
    },
    label: {
        fontSize: 16,
        color: '#000000',
    },
})

export default MealCategorySelector

