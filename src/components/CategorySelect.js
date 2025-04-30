import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import CustomModal from './CustomModal'
import Button from './Button'

const CategorySelect = ({
    value,
    onChange,
    isModalVisible,
    setIsModalVisible,
    toggleModal,
    categories,
}) => {
    const [selectedCategories, setSelectedCategories] = useState([])

    useEffect(() => {
        console.log('CategorySelect value changed:', value)
        // Initialize selected categories from the current value
        if (value && value.length > 0) {
            const cats = value.map((cat) => {
                if (typeof cat === 'object') return cat.id
                return cat
            })
            console.log('Setting selected categories:', cats)
            setSelectedCategories(cats)
        } else {
            console.log('No categories to set')
            setSelectedCategories([])
        }
    }, [value])

    const getCategoryName = (id) => {
        // Search through all categories and their children to find the matching name
        for (const category of categories) {
            if (category.id === id) return category.name
            const subcategory = category.children.find((c) => c.id === id)
            if (subcategory) return subcategory.name
        }
        return id // Fallback to ID if name not found
    }

    const handleSubcategoryToggle = (subcategory) => {
        setSelectedCategories((prev) => {
            if (prev.includes(subcategory.id)) {
                return prev.filter((id) => id !== subcategory.id)
            } else {
                return [...prev, subcategory.id]
            }
        })
    }

    const handleSave = () => {
        console.log('Saving categories:', selectedCategories)
        // Return just the IDs of selected categories
        onChange(selectedCategories)
        setIsModalVisible(false)
    }

    return (
        <View style={styles.multiSelectBox}>
            <TouchableOpacity
                onPress={toggleModal}
                style={styles.multiSelectButton}
            >
                <View style={styles.selectedCategoriesContainer}>
                    {selectedCategories.length > 0 ? (
                        selectedCategories.map((id, index) => (
                            <View key={id} style={styles.categoryChip}>
                                <CustomText style={styles.categoryChipText}>
                                    {getCategoryName(id)}
                                </CustomText>
                            </View>
                        ))
                    ) : (
                        <CustomText>Valitse kategoriat</CustomText>
                    )}
                </View>
            </TouchableOpacity>

            <CustomModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                title="Valitse kategoriat"
            >
                <View style={styles.modalBody}>
                    <ScrollView style={styles.categoryContainer}>
                        {categories.map((category) => (
                            <View
                                key={category.id}
                                style={styles.categoryGroup}
                            >
                                <View style={styles.categoryHeader}>
                                    <CustomText style={styles.categoryTitle}>
                                        {category.name}
                                    </CustomText>
                                </View>
                                <View style={styles.subcategoryList}>
                                    {category.children.map((subcategory) => (
                                        <TouchableOpacity
                                            key={subcategory.id}
                                            style={styles.subcategoryItem}
                                            onPress={() =>
                                                handleSubcategoryToggle(
                                                    subcategory
                                                )
                                            }
                                        >
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    selectedCategories.includes(
                                                        subcategory.id
                                                    ) && styles.checkboxChecked,
                                                ]}
                                            >
                                                {selectedCategories.includes(
                                                    subcategory.id
                                                ) && (
                                                    <MaterialIcons
                                                        name="check"
                                                        size={16}
                                                        color="white"
                                                    />
                                                )}
                                            </View>
                                            <CustomText
                                                style={styles.subcategoryText}
                                            >
                                                {subcategory.name}
                                            </CustomText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    <View style={styles.modalButtonGroup}>
                        <Button
                            title="Tallenna"
                            onPress={handleSave}
                            style={styles.primaryButton}
                        />
                    </View>
                </View>
            </CustomModal>
        </View>
    )
}

const styles = StyleSheet.create({
    multiSelectBox: {
        marginBottom: 8,
        flex: 1,
    },
    multiSelectButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderRadius: 4,
        backgroundColor: 'white',
        minHeight: 40,
    },
    selectedCategoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    categoryChip: {
        backgroundColor: '#9C86FC',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 4,
        marginBottom: 4,
    },
    categoryChipText: {
        color: 'white',
        fontSize: 14,
    },
    modalBody: {
        flex: 1,
        padding: 15,
    },
    categoryContainer: {
        flex: 1,
    },
    categoryGroup: {
        marginBottom: 15,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        paddingVertical: 8,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    subcategoryList: {
        marginLeft: 10,
    },
    subcategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#9C86FC',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#9C86FC',
    },
    subcategoryText: {
        fontSize: 16,
        color: '#000000',
    },
    modalButtonGroup: {
        width: '100%',
        paddingTop: 15,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginVertical: 10,
    },
})

export default CategorySelect
