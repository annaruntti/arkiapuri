import React, { forwardRef, useState, useEffect } from 'react'
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import CustomModal from './CustomModal'
import Button from './Button'

const CategorySelect = forwardRef(
    (
        {
            value,
            onChange,
            isModalVisible,
            setIsModalVisible,
            toggleModal,
            categories,
        },
        ref
    ) => {
        const [selectedCategories, setSelectedCategories] = useState([])

        useEffect(() => {
            // Initialize selected categories from the current value
            if (value && value.length > 0) {
                const cats = value.map((cat) => {
                    if (typeof cat === 'object') return cat.id
                    return cat
                })
                setSelectedCategories(cats)
            }
        }, [value])

        const handleCategoryToggle = (category) => {
            setSelectedCategories((prev) => {
                if (prev.includes(category.id)) {
                    return prev.filter((id) => id !== category.id)
                } else {
                    return [...prev, category.id]
                }
            })
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
            const selectedItems = selectedCategories.map((id) => {
                // Find the subcategory in any category's children
                for (const category of categories) {
                    const subcat = category.children.find((c) => c.id === id)
                    if (subcat) return subcat
                }
                return id
            })
            onChange(selectedItems)
            setIsModalVisible(false)
        }

        return (
            <View style={styles.multiSelectBox}>
                <TouchableOpacity
                    onPress={toggleModal}
                    style={styles.multiSelectButton}
                >
                    <CustomText>
                        {value && value.length > 0
                            ? value
                                  .map((cat) =>
                                      typeof cat === 'object' ? cat.name : cat
                                  )
                                  .join(', ')
                            : 'Valitse kategoriat'}
                    </CustomText>
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
                                    <TouchableOpacity
                                        style={styles.categoryHeader}
                                        onPress={() =>
                                            handleCategoryToggle(category)
                                        }
                                    >
                                        <CustomText
                                            style={styles.categoryTitle}
                                        >
                                            {category.name}
                                        </CustomText>
                                    </TouchableOpacity>
                                    <View style={styles.subcategoryList}>
                                        {category.children.map(
                                            (subcategory) => (
                                                <TouchableOpacity
                                                    key={subcategory.id}
                                                    style={
                                                        styles.subcategoryItem
                                                    }
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
                                                            ) &&
                                                                styles.checkboxChecked,
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
                                                        style={
                                                            styles.subcategoryText
                                                        }
                                                    >
                                                        {subcategory.name}
                                                    </CustomText>
                                                </TouchableOpacity>
                                            )
                                        )}
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
)

CategorySelect.displayName = 'CategorySelect'

const styles = StyleSheet.create({
    multiSelectBox: {
        marginBottom: 8,
    },
    multiSelectButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderRadius: 4,
        backgroundColor: 'white',
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
