import { StyleSheet, TouchableOpacity, View } from 'react-native'
import CustomText from './CustomText'
import ResponsiveModal from './ResponsiveModal'

const ShoppingListPickerContent = ({
    shoppingLists = [],
    selectedShoppingListId,
    pendingItemName,
    loading = false,
    onSelect,
}) => (
    <View style={styles.content}>
        <CustomText style={styles.hint}>
            {pendingItemName
                ? `Mille listalle lisätään "${pendingItemName}"?`
                : 'Valitse ostoslista'}
        </CustomText>
        {shoppingLists.map((list) => (
            <TouchableOpacity
                key={list._id}
                style={[
                    styles.option,
                    selectedShoppingListId === list._id && styles.optionSelected,
                ]}
                disabled={loading}
                onPress={() => onSelect(list._id)}
            >
                <CustomText style={styles.optionText}>{list.name}</CustomText>
                <CustomText style={styles.optionMeta}>
                    {list.items?.length || 0} tuotetta
                </CustomText>
            </TouchableOpacity>
        ))}
    </View>
)

const ShoppingListPickerModal = ({
    visible,
    shoppingLists = [],
    selectedShoppingListId,
    pendingItemName,
    loading = false,
    onClose,
    onSelect,
    embedded = false,
}) => {
    const content = (
        <ShoppingListPickerContent
            shoppingLists={shoppingLists}
            selectedShoppingListId={selectedShoppingListId}
            pendingItemName={pendingItemName}
            loading={loading}
            onSelect={onSelect}
        />
    )

    if (embedded) {
        return content
    }

    return (
        <ResponsiveModal
            visible={visible}
            onClose={() => {
                if (loading) return
                onClose()
            }}
            title="Valitse ostoslista"
            maxWidth={420}
        >
            {content}
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        gap: 10,
    },
    hint: {
        fontSize: 15,
        color: '#374151',
        marginBottom: 8,
    },
    option: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#F9FAFB',
    },
    optionSelected: {
        borderColor: '#5844BB',
        backgroundColor: '#F3F0FF',
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    optionMeta: {
        marginTop: 4,
        fontSize: 13,
        color: '#6B7280',
    },
})

export default ShoppingListPickerModal
