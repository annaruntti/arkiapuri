import { Feather, MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import {
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import CustomText from './CustomText'

const difficultyLevels = [
    { value: 'easy', label: 'Helppo' },
    { value: 'medium', label: 'Keskitaso' },
    { value: 'hard', label: 'Vaikea' },
]

const mealTypes = [
    { value: 'breakfast', label: 'Aamiainen' },
    { value: 'lunch', label: 'Lounas' },
    { value: 'snack', label: 'Välipala' },
    { value: 'dinner', label: 'Päivällinen' },
    { value: 'supper', label: 'Iltapala' },
    { value: 'dessert', label: 'Jälkiruoka' },
    { value: 'other', label: 'Muu' },
]

const EditableField = ({
    field,
    label,
    value,
    isEditing,
    editedValue,
    onToggleEdit,
    onChange,
    onDifficultyPickerOpen,
    type = 'text',
}) => {
    // Difficulty level field with scroll picker
    if (field === 'difficultyLevel') {
        if (isEditing) {
            const normalizedValue = editedValue
                ? String(editedValue).toLowerCase()
                : 'medium'

            return (
                <View style={styles.detailRow}>
                    <CustomText style={styles.detailLabel}>{label}:</CustomText>
                    <View style={styles.valueContainer}>
                        <View style={styles.scrollPickerContainer}>
                            {/* Top scroll indicator */}
                            <View style={styles.scrollIndicatorTop}>
                                <MaterialIcons
                                    name="keyboard-arrow-up"
                                    size={16}
                                    color="#999"
                                />
                            </View>

                            <ScrollView
                                style={styles.scrollPickerView}
                                contentContainerStyle={styles.scrollPickerContent}
                                showsVerticalScrollIndicator={false}
                                snapToInterval={32}
                                decelerationRate="fast"
                                onMomentumScrollEnd={(event) => {
                                    const y = event.nativeEvent.contentOffset.y
                                    const index = Math.round(y / 32)
                                    const selectedDifficulty =
                                        difficultyLevels[index] || difficultyLevels[1]
                                    onChange(selectedDifficulty.value)
                                }}
                            >
                                {difficultyLevels.map((level) => (
                                    <TouchableOpacity
                                        key={level.value}
                                        style={[
                                            styles.scrollPickerOption,
                                            normalizedValue === level.value &&
                                                styles.scrollPickerOptionSelected,
                                        ]}
                                        onPress={() => onChange(level.value)}
                                    >
                                        <CustomText
                                            style={[
                                                styles.scrollPickerOptionText,
                                                normalizedValue === level.value &&
                                                    styles.scrollPickerOptionTextSelected,
                                            ]}
                                        >
                                            {level.label}
                                        </CustomText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Bottom scroll indicator */}
                            <View style={styles.scrollIndicatorBottom}>
                                <MaterialIcons
                                    name="keyboard-arrow-down"
                                    size={16}
                                    color="#999"
                                />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={onToggleEdit}
                        >
                            <Feather name="check" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        } else {
            // Not editing - show value with edit icon
            return (
                <View style={styles.detailRow}>
                    <CustomText style={styles.detailLabel}>{label}:</CustomText>
                    <View style={styles.valueContainer}>
                        <TouchableOpacity onPress={onToggleEdit}>
                            <CustomText>{value}</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={onToggleEdit}
                        >
                            <Feather name="edit-2" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    // Meal type field with scroll picker
    if (field === 'defaultRoles') {
        if (isEditing) {
            const currentValue = Array.isArray(editedValue)
                ? editedValue[0]
                : editedValue || (Array.isArray(value) ? value[0] : value)

            return (
                <View style={styles.detailRow}>
                    <CustomText style={styles.detailLabel}>{label}:</CustomText>
                    <View style={styles.valueContainer}>
                        <View style={styles.mealTypeScrollPicker}>
                            {/* Top scroll indicator */}
                            <View style={styles.mealTypeScrollIndicatorTop}>
                                <MaterialIcons
                                    name="keyboard-arrow-up"
                                    size={16}
                                    color="#999"
                                />
                            </View>

                            <ScrollView
                                style={styles.mealTypeScrollView}
                                contentContainerStyle={
                                    styles.mealTypeScrollContent
                                }
                                showsVerticalScrollIndicator={false}
                                snapToInterval={32}
                                decelerationRate="fast"
                                onMomentumScrollEnd={(event) => {
                                    const y = event.nativeEvent.contentOffset.y
                                    const index = Math.round(y / 32)
                                    const selectedType =
                                        mealTypes[index] || mealTypes[0]
                                    onChange([selectedType.value])
                                }}
                            >
                                {mealTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[
                                            styles.mealTypeScrollOption,
                                            currentValue === type.value &&
                                                styles.mealTypeScrollOptionSelected,
                                        ]}
                                        onPress={() => onChange([type.value])}
                                    >
                                        <CustomText
                                            style={[
                                                styles.mealTypeScrollOptionText,
                                                currentValue === type.value &&
                                                    styles.mealTypeScrollOptionTextSelected,
                                            ]}
                                        >
                                            {type.label}
                                        </CustomText>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Bottom scroll indicator */}
                            <View style={styles.mealTypeScrollIndicatorBottom}>
                                <MaterialIcons
                                    name="keyboard-arrow-down"
                                    size={16}
                                    color="#999"
                                />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={onToggleEdit}
                        >
                            <Feather name="check" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        } else {
            // Not editing - show value with edit icon
            return (
                <View style={styles.detailRow}>
                    <CustomText style={styles.detailLabel}>{label}:</CustomText>
                    <View style={styles.valueContainer}>
                        <TouchableOpacity onPress={onToggleEdit}>
                            <CustomText>{value}</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.editIcon}
                            onPress={onToggleEdit}
                        >
                            <Feather name="edit-2" size={18} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    // Default text/number field
    return (
        <View style={styles.detailRow}>
            <CustomText style={styles.detailLabel}>{label}:</CustomText>
            <View style={styles.valueContainer}>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={
                            editedValue !== undefined
                                ? String(editedValue)
                                : String(value)
                        }
                        onChangeText={onChange}
                        keyboardType={type === 'number' ? 'numeric' : 'default'}
                        placeholder={label}
                    />
                ) : (
                    <TouchableOpacity onPress={onToggleEdit}>
                        <CustomText>{value}</CustomText>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={styles.editIcon}
                    onPress={onToggleEdit}
                >
                    <Feather
                        name={isEditing ? 'check' : 'edit-2'}
                        size={18}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
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
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 2,
        justifyContent: 'flex-end',
    },
    editIcon: {
        padding: 5,
        marginLeft: 10,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#9C86FC',
        padding: 2,
        minWidth: 50,
        textAlign: 'right',
    },
    pickerButton: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    pickerButtonText: {
        fontSize: 16,
        color: '#333',
    },
    // Scroll picker styles (used for both difficulty and meal type)
    scrollPickerContainer: {
        width: 120,
        height: 40,
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        position: 'relative',
    },
    scrollIndicatorTop: {
        position: 'absolute',
        top: 2,
        right: 2,
        zIndex: 1,
        padding: 1,
    },
    scrollIndicatorBottom: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        zIndex: 1,
        padding: 1,
    },
    scrollPickerView: {
        flex: 1,
    },
    scrollPickerContent: {
        paddingVertical: 4,
    },
    scrollPickerOption: {
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    scrollPickerOptionSelected: {
        backgroundColor: '#f0f0f0',
    },
    scrollPickerOptionText: {
        fontSize: 14,
        color: '#666',
    },
    scrollPickerOptionTextSelected: {
        color: '#000',
        fontWeight: 'bold',
    },
    mealTypeScrollPicker: {
        width: 120,
        height: 40,
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        position: 'relative',
    },
    mealTypeScrollIndicatorTop: {
        position: 'absolute',
        top: 2,
        right: 2,
        zIndex: 1,
        padding: 1,
    },
    mealTypeScrollIndicatorBottom: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        zIndex: 1,
        padding: 1,
    },
    mealTypeScrollView: {
        flex: 1,
    },
    mealTypeScrollContent: {
        paddingVertical: 4,
    },
    mealTypeScrollOption: {
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    mealTypeScrollOptionSelected: {
        backgroundColor: '#f0f0f0',
    },
    mealTypeScrollOptionText: {
        fontSize: 14,
        color: '#666',
    },
    mealTypeScrollOptionTextSelected: {
        color: '#000',
        fontWeight: 'bold',
    },
})

export default EditableField

