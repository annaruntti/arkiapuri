import { StyleSheet, View } from 'react-native'
import CustomText from './CustomText'
import ListItem from './ListItem'
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
            <ListItem
                key={list._id}
                title={list.name}
                subtitle={`${list.items?.length || 0} tuotetta`}
                selected={selectedShoppingListId === list._id}
                disabled={loading}
                onPress={() => onSelect(list._id)}
            />
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
})

export default ShoppingListPickerModal
