import { Platform, StyleSheet, View } from 'react-native'
import Button from './Button'

/**
 * Sticky bottom actions when shopping-list rows are checked.
 */
const ShoppingListFloatingActions = ({
    checkedCount,
    checkedFoodCount,
    onMoveToPantry,
    onDeleteChecked,
}) => {
    if (!checkedCount) return null

    return (
        <View
            style={[styles.floatingActionBar, { pointerEvents: 'box-none' }]}
        >
            <View style={styles.floatingActionBarInner}>
                {checkedFoodCount > 0 && (
                    <Button
                        title={`Siirrä pentteriin (${checkedFoodCount})`}
                        type="PRIMARY"
                        fullWidth
                        onPress={onMoveToPantry}
                        style={styles.floatingActionButton}
                    />
                )}
                <Button
                    title={`Poista valitut (${checkedCount})`}
                    type="TERTIARY"
                    fullWidth
                    onPress={onDeleteChecked}
                    style={[
                        styles.floatingActionButton,
                        styles.floatingTertiaryButton,
                    ]}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    floatingActionBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        paddingHorizontal: 0,
        paddingTop: 8,
        paddingBottom: Platform.OS === 'ios' ? 16 : 10,
        backgroundColor: 'transparent',
    },
    floatingActionBarInner: {
        width: '100%',
        gap: 10,
        alignItems: 'stretch',
    },
    floatingActionButton: {
        width: '100%',
        alignSelf: 'stretch',
        marginTop: 0,
        marginBottom: 0,
        minHeight: 45,
        paddingVertical: 7,
        paddingHorizontal: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 4,
        ...(Platform.OS === 'web' && {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
        }),
    },
    floatingTertiaryButton: {
        backgroundColor: '#fff',
    },
})

export default ShoppingListFloatingActions
