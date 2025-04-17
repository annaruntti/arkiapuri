import React, { forwardRef } from 'react'
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
} from 'react-native'
import { MaterialIcons as Icon } from '@expo/vector-icons'
import CustomText from './CustomText'

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
        const selectedCategories = value || []

        const getCategory = (id) => {
            for (const category of categories) {
                if (category.id === id) return category
                if (category.children) {
                    const subCategory = category.children.find(
                        (sub) => sub.id === id
                    )
                    if (subCategory) return subCategory
                }
            }
            return null
        }

        const handleRemoveCategory = (categoryId) => {
            const newSelected = selectedCategories.filter(
                (id) => id !== categoryId
            )
            onChange(newSelected)
        }

        const getCategoryNames = () => {
            return selectedCategories
                .map((id) => {
                    const category = categories.find((cat) => cat.id === id)
                    return category ? category.name : ''
                })
                .filter((name) => name)
                .join(', ')
        }

        const handleCategorySelect = (selectedItems) => {
            onChange(selectedItems)
        }

        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.selectButton}
                    onPress={toggleModal}
                >
                    <CustomText>
                        {selectedCategories.length > 0
                            ? 'Valitut kategoriat'
                            : 'Valitse kategoriat'}
                    </CustomText>
                </TouchableOpacity>

                {/* Selected Categories Tags */}
                {selectedCategories.length > 0 && (
                    <View style={styles.selectedTagsContainer}>
                        {selectedCategories.map((categoryId) => {
                            const category = getCategory(categoryId)
                            if (!category) return null

                            return (
                                <View
                                    key={categoryId}
                                    style={styles.tagContainer}
                                >
                                    <CustomText style={styles.tagText}>
                                        {category.name}
                                    </CustomText>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleRemoveCategory(categoryId)
                                        }
                                        style={styles.tagRemoveButton}
                                    >
                                        <Icon
                                            name="close"
                                            size={18}
                                            color="#666"
                                        />
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                    </View>
                )}

                <Modal
                    visible={isModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalView}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Icon
                                        name="close"
                                        size={24}
                                        color="black"
                                    />
                                </TouchableOpacity>
                                <CustomText style={styles.modalTitle}>
                                    Valitse kategoriat
                                </CustomText>
                            </View>

                            <View style={styles.categoriesContainer}>
                                <ScrollView>
                                    {categories.map((category) => (
                                        <View key={category.id}>
                                            <TouchableOpacity
                                                style={styles.categoryItem}
                                                onPress={() => {
                                                    const isSelected =
                                                        selectedCategories.includes(
                                                            category.id
                                                        )
                                                    const newSelected =
                                                        isSelected
                                                            ? selectedCategories.filter(
                                                                  (id) =>
                                                                      id !==
                                                                      category.id
                                                              )
                                                            : [
                                                                  ...selectedCategories,
                                                                  category.id,
                                                              ]
                                                    handleCategorySelect(
                                                        newSelected
                                                    )
                                                }}
                                            >
                                                <CustomText
                                                    style={[
                                                        styles.itemText,
                                                        selectedCategories.includes(
                                                            category.id
                                                        ) &&
                                                            styles.selectedItemText,
                                                    ]}
                                                >
                                                    {category.name}
                                                </CustomText>
                                                {selectedCategories.includes(
                                                    category.id
                                                ) && (
                                                    <Icon
                                                        name="check"
                                                        size={24}
                                                        color="#9C86FC"
                                                    />
                                                )}
                                            </TouchableOpacity>

                                            {category.children?.map(
                                                (subCategory) => (
                                                    <TouchableOpacity
                                                        key={subCategory.id}
                                                        style={
                                                            styles.subCategoryItem
                                                        }
                                                        onPress={() => {
                                                            const isSelected =
                                                                selectedCategories.includes(
                                                                    subCategory.id
                                                                )
                                                            const newSelected =
                                                                isSelected
                                                                    ? selectedCategories.filter(
                                                                          (
                                                                              id
                                                                          ) =>
                                                                              id !==
                                                                              subCategory.id
                                                                      )
                                                                    : [
                                                                          ...selectedCategories,
                                                                          subCategory.id,
                                                                      ]
                                                            handleCategorySelect(
                                                                newSelected
                                                            )
                                                        }}
                                                    >
                                                        <CustomText
                                                            style={[
                                                                styles.subItemText,
                                                                selectedCategories.includes(
                                                                    subCategory.id
                                                                ) &&
                                                                    styles.selectedItemText,
                                                            ]}
                                                        >
                                                            {subCategory.name}
                                                        </CustomText>
                                                        {selectedCategories.includes(
                                                            subCategory.id
                                                        ) && (
                                                            <Icon
                                                                name="check"
                                                                size={24}
                                                                color="#9C86FC"
                                                            />
                                                        )}
                                                    </TouchableOpacity>
                                                )
                                            )}
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <CustomText style={styles.confirmButtonText}>
                                    Vahvista
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
)

CategorySelect.displayName = 'CategorySelect'

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    selectButton: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        minHeight: 40,
        justifyContent: 'center',
        marginBottom: 5,
    },
    modalView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        width: '100%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        padding: 10,
    },
    categoriesContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    subCategoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingLeft: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemText: {
        fontSize: 16,
        color: '#000000',
    },
    subItemText: {
        fontSize: 14,
        color: '#000000',
    },
    selectedItemText: {
        color: '#9C86FC',
        fontWeight: 'bold',
    },
    confirmButton: {
        backgroundColor: '#9C86FC',
        padding: 15,
        margin: 20,
        borderRadius: 25,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
    selectedTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 5,
        marginTop: 5,
    },
    tagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        padding: 8,
        margin: 3,
    },
    tagText: {
        fontSize: 14,
        marginRight: 5,
    },
    tagRemoveButton: {
        padding: 2,
    },
})

export default CategorySelect
