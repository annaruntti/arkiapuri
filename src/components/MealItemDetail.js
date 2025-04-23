import React from 'react'
import { View, StyleSheet, ScrollView, Modal, Pressable } from 'react-native'
import CustomText from './CustomText'
import {
    getDifficultyText,
    getMealTypeText,
    formatDate,
} from '../utils/mealUtils'
import { AntDesign } from '@expo/vector-icons'

const MealItemDetail = ({ meal, visible, onClose }) => {
    if (!meal || !visible) {
        return null
    }

    const handleClose = () => {
        console.log('Handling close')
        if (onClose) {
            onClose()
        }
    }

    console.log(meal, 'meal')

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={handleClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Pressable
                        onPress={handleClose}
                        style={({ pressed }) => [
                            styles.closeButton,
                            pressed && { opacity: 0.7 },
                        ]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <AntDesign name="close" size={24} color="black" />
                    </Pressable>
                    <ScrollView style={styles.detailScroll}>
                        <View style={styles.mealDetails}>
                            <View style={styles.detailRow}>
                                <CustomText style={styles.detailLabel}>
                                    Nimi:
                                </CustomText>
                                <CustomText style={styles.detailValue}>
                                    {meal.name}
                                </CustomText>
                            </View>
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
                                            {item.quantities?.meal ||
                                                item.quantity}{' '}
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
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    detailScroll: {
        paddingTop: 60,
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
        paddingTop: '10%',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 20,
        minHeight: '90%',
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 999,
        padding: 10,
        backgroundColor: 'white',
        elevation: 1,
    },
})

export default MealItemDetail
