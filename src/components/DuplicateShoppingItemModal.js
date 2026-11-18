import { StyleSheet, View } from 'react-native'
import Button from './Button'
import CustomText from './CustomText'
import ResponsiveModal from './ResponsiveModal'
import { buttonStyles } from '../styles/formStyles'
import { useResponsiveDimensions } from '../utils/responsive'
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
    const { isTablet } = useResponsiveDimensions()

    return (
        <ResponsiveModal
            visible={visible}
            onClose={onCancel}
            title="Tuote on jo listalla"
            maxWidth={480}
        >
            <CustomText style={styles.body}>
                {name} on jo ostoslistalla. Voit jättää lisäämättä tai yhdistää
                saman rivin määrään.
            </CustomText>
            <View style={styles.resultBox}>
                <CustomText style={styles.resultLabel}>Yhdistettynä</CustomText>
                <CustomText style={styles.resultValue}>{resultLabel}</CustomText>
            </View>
            <View style={isTablet ? buttonStyles.actionsRow : styles.actions}>
                <Button
                    title={`Lisää määrään (${quantityLabel})`}
                    type="PRIMARY"
                    onPress={onConfirm}
                    style={isTablet ? buttonStyles.contentButton : styles.fullWidthButton}
                    textStyle={styles.buttonText}
                />
                <Button
                    title="Älä lisää"
                    type="TERTIARY"
                    onPress={onCancel}
                    style={isTablet ? buttonStyles.contentButton : styles.fullWidthButton}
                    textStyle={styles.buttonText}
                />
            </View>
        </ResponsiveModal>
    )
}

const styles = StyleSheet.create({
    body: {
        fontSize: 15,
        lineHeight: 22,
        color: '#2D2640',
        textAlign: 'left',
        marginBottom: 12,
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
    actions: {
        gap: 10,
        marginTop: 12,
    },
    fullWidthButton: {
        width: '100%',
    },
    buttonText: {
        color: '#000000',
        fontWeight: '700',
    },
})

export default DuplicateShoppingItemModal
