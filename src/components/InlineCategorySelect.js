import { MaterialIcons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from './Button'
import CustomText from './CustomText'

const InlineCategorySelect = ({
    value = [],
    onChange,
    categories = [],
    placeholder = 'Valitse kategoriat',
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState(value)
    const [animation] = useState(new Animated.Value(0))

    // Animation functions
    const animateIn = () => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start()
    }

    const animateOut = (callback) => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start(callback)
    }

    // Toggle expansion
    const toggleExpansion = () => {
        if (isExpanded) {
            animateOut(() => {
                setIsExpanded(false)
            })
        } else {
            setIsExpanded(true)
            animateIn()
        }
    }

    // Handle subcategory selection
    const handleSubcategoryToggle = (categoryId, subcategoryId) => {
        setSelectedCategories((prev) => {
            const categoryKey = `${categoryId}-${subcategoryId}`
            const isSelected = prev.some((cat) => cat.id === categoryKey)

            if (isSelected) {
                return prev.filter((cat) => cat.id !== categoryKey)
            } else {
                const category = categories.find((cat) => cat.id === categoryId)
                const subcategory = category?.children?.find(
                    (sub) => sub.id === subcategoryId
                )

                if (subcategory) {
                    return [
                        ...prev,
                        {
                            id: categoryKey,
                            name: subcategory.name,
                            parentId: categoryId,
                            subcategoryId: subcategoryId,
                        },
                    ]
                }
                return prev
            }
        })
    }

    // Save selection
    const handleSave = () => {
        onChange(selectedCategories)
        toggleExpansion()
    }

    // Cancel selection
    const handleCancel = () => {
        setSelectedCategories(value)
        toggleExpansion()
    }

    // Get display text
    const getDisplayText = () => {
        if (selectedCategories.length === 0) {
            return placeholder
        }
        if (selectedCategories.length === 1) {
            return selectedCategories[0].name
        }
        return `${selectedCategories.length} kategoriaa valittu`
    }

    return (
        <View style={styles.container}>
            {/* Selection Button */}
            <TouchableOpacity
                style={[
                    styles.selectButton,
                    isExpanded && styles.selectButtonActive,
                ]}
                onPress={toggleExpansion}
            >
                <CustomText
                    style={[
                        styles.selectText,
                        selectedCategories.length > 0 &&
                            styles.selectTextSelected,
                    ]}
                >
                    {getDisplayText()}
                </CustomText>
                <MaterialIcons
                    name={
                        isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                    }
                    size={24}
                    color="#666"
                />
            </TouchableOpacity>

            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && !isExpanded && (
                <View style={styles.selectedCategoriesContainer}>
                    {selectedCategories.map((category) => (
                        <View
                            key={category.id}
                            style={styles.selectedCategoryTag}
                        >
                            <CustomText style={styles.selectedCategoryText}>
                                {category.name}
                            </CustomText>
                            <TouchableOpacity
                                onPress={() => {
                                    const updated = selectedCategories.filter(
                                        (cat) => cat.id !== category.id
                                    )
                                    setSelectedCategories(updated)
                                    onChange(updated)
                                }}
                                style={styles.removeTagButton}
                            >
                                <MaterialIcons
                                    name="clear"
                                    size={16}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* Expandable Category Selection */}
            {isExpanded && (
                <Animated.View
                    style={[
                        styles.expandableSection,
                        {
                            maxHeight: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 400],
                            }),
                            opacity: animation,
                        },
                    ]}
                >
                    <View style={styles.sectionHeader}>
                        <CustomText style={styles.sectionTitle}>
                            Valitse kategoriat
                        </CustomText>
                        <Pressable
                            onPress={toggleExpansion}
                            style={styles.closeButton}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="#666"
                            />
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.categoryScrollContainer}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
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
                                    {category.children?.map((subcategory) => {
                                        const categoryKey = `${category.id}-${subcategory.id}`
                                        const isSelected =
                                            selectedCategories.some(
                                                (cat) => cat.id === categoryKey
                                            )

                                        return (
                                            <TouchableOpacity
                                                key={subcategory.id}
                                                style={[
                                                    styles.subcategoryItem,
                                                    isSelected &&
                                                        styles.subcategoryItemSelected,
                                                ]}
                                                onPress={() =>
                                                    handleSubcategoryToggle(
                                                        category.id,
                                                        subcategory.id
                                                    )
                                                }
                                            >
                                                <View
                                                    style={
                                                        styles.checkboxContainer
                                                    }
                                                >
                                                    <MaterialIcons
                                                        name={
                                                            isSelected
                                                                ? 'check-box'
                                                                : 'check-box-outline-blank'
                                                        }
                                                        size={20}
                                                        color={
                                                            isSelected
                                                                ? '#9C86FC'
                                                                : '#666'
                                                        }
                                                    />
                                                </View>
                                                <CustomText
                                                    style={[
                                                        styles.subcategoryText,
                                                        isSelected &&
                                                            styles.subcategoryTextSelected,
                                                    ]}
                                                >
                                                    {subcategory.name}
                                                </CustomText>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.actionButtons}>
                        <Button
                            title="Peruuta"
                            onPress={handleCancel}
                            style={styles.cancelButton}
                            textStyle={styles.cancelButtonText}
                        />
                        <Button
                            title="Tallenna"
                            onPress={handleSave}
                            style={styles.saveButton}
                        />
                    </View>
                </Animated.View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        minHeight: 40,
    },
    selectButtonActive: {
        borderColor: '#9C86FC',
        borderWidth: 2,
    },
    selectText: {
        flex: 1,
        color: '#999',
        fontSize: 16,
    },
    selectTextSelected: {
        color: '#333',
    },
    selectedCategoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 6,
    },
    selectedCategoryTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 4,
    },
    selectedCategoryText: {
        fontSize: 14,
        color: '#333',
        marginRight: 6,
    },
    removeTagButton: {
        padding: 2,
    },

    // Expandable section styles
    expandableSection: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginTop: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        backgroundColor: '#fff',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    categoryScrollContainer: {
        maxHeight: 250,
        padding: 15,
    },
    categoryGroup: {
        marginBottom: 20,
    },
    categoryHeader: {
        marginBottom: 10,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    subcategoryList: {
        paddingLeft: 10,
    },
    subcategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 6,
        marginBottom: 4,
    },
    subcategoryItemSelected: {
        backgroundColor: '#f8f5ff',
    },
    checkboxContainer: {
        marginRight: 10,
    },
    subcategoryText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    subcategoryTextSelected: {
        color: '#333',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        backgroundColor: '#fff',
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#dee2e6',
    },
    cancelButtonText: {
        color: '#666',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#9C86FC',
    },
})

export default InlineCategorySelect
