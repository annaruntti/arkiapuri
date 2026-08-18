import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Button from './Button'
import CustomText from './CustomText'
import ResponsiveModal from './ResponsiveModal'
import ToggleButton from './ToggleButton'

const CategorySelect = ({
    value,
    onChange,
    isModalVisible,
    setIsModalVisible,
    toggleModal,
    categories,
}) => {
    const [selectedCategories, setSelectedCategories] = useState([])

    const getCategoryName = (id) => {
        // Search through all categories and their children to find the matching name
        for (const category of categories) {
            const subcategory = category.children.find(
                (c) => String(c.id) === String(id)
            )
            if (subcategory) return subcategory.name
        }
        return id // Fallback to ID if name not found
    }

    const getCategoryId = (name) => {
        // Search through all categories and their children to find the matching ID
        for (const category of categories) {
            const subcategory = category.children.find((c) => c.name === name)
            if (subcategory) return subcategory.id
        }
        return name // Fallback to name if ID not found
    }

    useEffect(() => {
        // Initialize selected categories from the current value
        if (value && value.length > 0) {
            // Convert names to IDs if needed
            const cats = value.map((cat) => {
                if (typeof cat === 'object') return cat.id
                if (typeof cat === 'string' && !isNaN(cat)) return cat // It's already an ID
                return getCategoryId(cat) // It's a name, convert to ID
            })
            setSelectedCategories(cats)
        } else {
            setSelectedCategories([])
        }
    }, [value])

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
        // Return just the IDs of selected categories
        onChange(selectedCategories)
        setIsModalVisible(false)
    }

    const displayText =
        selectedCategories.length === 0
            ? 'Valitse kategoriat'
            : selectedCategories.length === 1
              ? getCategoryName(selectedCategories[0])
              : `${selectedCategories.length} kategoriaa valittu`

    return (
        <View style={styles.multiSelectBox}>
            <ToggleButton
                label={displayText}
                expanded={isModalVisible}
                onPress={toggleModal}
                muted={selectedCategories.length === 0}
            />

            <ResponsiveModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                title="Valitse kategoriat"
                maxWidth={500}
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
            </ResponsiveModal>
        </View>
    )
}

const styles = StyleSheet.create({
    multiSelectBox: {
        marginBottom: 8,
        flex: 1,
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
        borderColor: '#5844BB',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#AE9CFC',
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
        backgroundColor: '#AE9CFC',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginVertical: 10,
    },
})

export default CategorySelect
