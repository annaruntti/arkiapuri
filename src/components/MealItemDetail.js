import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import CustomText from './CustomText'
import {
    getDifficultyText,
    getMealTypeText,
    formatDate,
} from '../utils/mealUtils'
import CustomModal from './CustomModal'

const MealItemDetail = ({ meal, visible, onClose }) => {
    if (!meal || !visible) {
        return null
    }

    return (
        <CustomModal visible={visible} onClose={onClose} title={meal.name}>
            <ScrollView style={styles.detailScroll}>
                <View style={styles.mealDetails}>
                    <View style={styles.detailRow}>
                        <CustomText style={styles.detailLabel}>
                            Vaikeustaso:
                        </CustomText>
                        <CustomText style={styles.detailValue}>
                            {getDifficultyText(meal.difficultyLevel)}
                        </CustomText>
                    </View>
                    <View style={styles.detailRow}>
                        <CustomText style={styles.detailLabel}>
                            Valmistusaika:
                        </CustomText>
                        <CustomText style={styles.detailValue}>
                            {meal.cookingTime} min
                        </CustomText>
                    </View>
                    <View style={styles.detailRow}>
                        <CustomText style={styles.detailLabel}>
                            Suunniteltu valmistuspäivä:
                        </CustomText>
                        <CustomText style={styles.detailValue}>
                            {formatDate(meal.plannedCookingDate)}
                        </CustomText>
                    </View>
                    <View style={styles.detailRow}>
                        <CustomText style={styles.detailLabel}>
                            Aterian tyyppi:
                        </CustomText>
                        <CustomText style={styles.detailValue}>
                            {getMealTypeText(meal.defaultRoles)}
                        </CustomText>
                    </View>

                    <View style={styles.detailSection}>
                        <CustomText style={styles.sectionTitle}>
                            Raaka-aineet:
                        </CustomText>
                        {meal.foodItems.map((item, index) => (
                            <View
                                key={item._id || index}
                                style={styles.foodItemRow}
                            >
                                <CustomText>
                                    {item.name} -{' '}
                                    {item.quantities?.meal || item.quantity}{' '}
                                    {item.unit}
                                </CustomText>
                            </View>
                        ))}
                    </View>

                    {meal.recipe && (
                        <View style={styles.detailSection}>
                            <CustomText style={styles.sectionTitle}>
                                Valmistusohje:
                            </CustomText>
                            <CustomText style={styles.recipeText}>
                                {meal.recipe}
                            </CustomText>
                        </View>
                    )}
                </View>
            </ScrollView>
        </CustomModal>
    )
}

const styles = StyleSheet.create({
    detailScroll: {
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    mealDetails: {
        paddingTop: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    detailLabel: {
        fontWeight: 'bold',
        flex: 1,
    },
    detailValue: {
        flex: 2,
    },
    detailSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    recipeText: {
        lineHeight: 24,
    },
    foodItemRow: {
        paddingVertical: 4,
    },
})

export default MealItemDetail
