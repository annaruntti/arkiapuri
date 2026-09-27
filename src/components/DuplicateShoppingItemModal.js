import { Modal, Pressable, StyleSheet, View } from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import {
    alignShoppingItemsForMerge,
    formatShoppingQuantity,
    mergedShoppingQuantity,
} from '../utils/shoppingListDuplicate'
import { resolveAppUnit } from '../utils/units'

/**
 * App-styled confirm dialog when a scanned/added product is already on the list.
 */
const DuplicateShoppingItemModal = ({
    visible,
    existing,
    incoming,
    onConfirm,
    onCancel,
}) => {
    const aligned = alignShoppingItemsForMerge(existing, incoming)
    const unit = resolveAppUnit(
        aligned.existing?.unit || aligned.incoming?.unit
    )
    const name = existing?.name || incoming?.name || 'Tuote'
    const newQty = mergedShoppingQuantity(aligned.existing, aligned.incoming)
    const quantityLabel = formatShoppingQuantity(newQty, unit)
    const resultLabel = `${name} ${quantityLabel}`

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            presentationStyle="overFullScreen"
            statusBarTranslucent
            onRequestClose={onCancel}
        >
            <View style={styles.backdrop}>
                <Pressable
                    style={StyleSheet.absoluteFillObject}
                    onPress={onCancel}
                    accessibilityRole="button"
                    accessibilityLabel="Sulje"
                />
                <View
                    style={styles.card}
                    accessibilityViewIsModal
                    accessibilityRole="alertdialog"
                    accessibilityLabel="Tuote on jo listalla"
                >
                    <CustomText style={styles.title}>
                        Tuote on jo listalla
                    </CustomText>
                    <CustomText style={styles.body}>
                        {name} on jo ostoslistalla. Voit jättää lisäämättä tai
                        yhdistää saman rivin määrään.
                    </CustomText>
                    <View style={styles.resultBox}>
                        <CustomText style={styles.resultLabel}>
                            Yhdistettynä
                        </CustomText>
                        <CustomText style={styles.resultValue}>
                            {resultLabel}
                        </CustomText>
                    </View>
                    <Button
                        title={`Lisää määrään (${quantityLabel})`}
                        type="PRIMARY"
                        onPress={onConfirm}
                        style={styles.primaryButton}
                        textStyle={styles.primaryButtonText}
                    />
                    <Button
                        title="Älä lisää"
                        type="TERTIARY"
                        onPress={onCancel}
                        style={styles.tertiaryButton}
                        textStyle={styles.tertiaryButtonText}
                    />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(34, 27, 58, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#F3F0FF',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 18,
        borderWidth: 1,
        borderColor: '#D7CFFA',
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F1635',
        textAlign: 'center',
    },
    body: {
        fontSize: 15,
        lineHeight: 22,
        color: '#2D2640',
        textAlign: 'center',
    },
    resultBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C8BDF5',
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 4,
    },
    resultLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#5844BB',
        textAlign: 'center',
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F1635',
        textAlign: 'center',
    },
    primaryButton: {
        width: '100%',
    },
    primaryButtonText: {
        color: '#000000',
        fontWeight: '700',
    },
    tertiaryButton: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    tertiaryButtonText: {
        color: '#5844BB',
        fontWeight: '700',
    },
})

export default DuplicateShoppingItemModal
