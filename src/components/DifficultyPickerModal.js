import React from 'react'
import {
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import CustomText from './CustomText'

const difficultyLevels = [
    { value: 'easy', label: 'Helppo' },
    { value: 'medium', label: 'Keskitaso' },
    { value: 'hard', label: 'Vaikea' },
]

const DifficultyPickerModal = ({
    visible,
    onClose,
    onSelect,
    currentValue,
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <CustomText style={styles.modalTitle}>
                            Valitse vaikeus
                        </CustomText>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={onClose}
                        >
                            <CustomText style={styles.modalCloseText}>
                                ✕
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody}>
                        {difficultyLevels.map((level) => (
                            <TouchableOpacity
                                key={level.value}
                                style={styles.modalOption}
                                onPress={() => {
                                    onSelect(level.value)
                                    onClose()
                                }}
                            >
                                <CustomText
                                    style={[
                                        styles.modalOptionText,
                                        String(
                                            currentValue || 'medium'
                                        ).toLowerCase() === level.value &&
                                            styles.selectedOptionText,
                                    ]}
                                >
                                    {level.label}
                                </CustomText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 0,
        minWidth: 300,
        maxWidth: 400,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalCloseButton: {
        padding: 5,
    },
    modalCloseText: {
        fontSize: 20,
        color: '#666',
    },
    modalBody: {
        maxHeight: 300,
    },
    modalOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    selectedOptionText: {
        color: '#9C86FC',
        fontWeight: 'bold',
    },
})

export default DifficultyPickerModal
