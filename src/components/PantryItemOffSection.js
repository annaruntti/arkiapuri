import { StyleSheet, View } from 'react-native'

import CustomText from './CustomText'

const formatTagList = (value) => {
    if (!value) return ''
    const list = Array.isArray(value) ? value : String(value).split(',')
    return list
        .map((entry) =>
            String(entry)
                .replace(/^[a-z]{2}:/, '')
                .replace(/-/g, ' ')
                .trim()
        )
        .filter(Boolean)
        .join(', ')
}

/**
 * Read-only nutrition + Open Food Facts metadata for pantry/catalog details.
 */
const PantryItemOffSection = ({ showNutrition, nutritionRows, off }) => {
    const allergens = formatTagList(off?.allergens)
    const labels = formatTagList(off?.labels)
    const hasOff =
        off?.brands ||
        off?.barcode ||
        off?.nutritionGrade ||
        off?.quantityLabel ||
        allergens ||
        labels

    return (
        <>
            {showNutrition && nutritionRows?.length > 0 ? (
                <View style={styles.nutritionBlock}>
                    <CustomText style={styles.sectionLabel}>
                        Ravintoarvot (per 100 g / 100 ml)
                    </CustomText>
                    {nutritionRows
                        .filter((row) => row.key !== 'calories')
                        .map((row) => (
                            <View key={row.key} style={styles.nutritionRow}>
                                <CustomText style={styles.nutritionLabel}>
                                    {row.label}
                                </CustomText>
                                <CustomText style={styles.nutritionValue}>
                                    {row.value} {row.unit}
                                </CustomText>
                            </View>
                        ))}
                </View>
            ) : null}

            {hasOff ? (
                <View style={styles.offBlock}>
                    <CustomText style={styles.sectionLabel}>
                        Open Food Facts
                    </CustomText>
                    {off.brands ? (
                        <View style={styles.nutritionRow}>
                            <CustomText style={styles.nutritionLabel}>
                                Merkki
                            </CustomText>
                            <CustomText style={styles.nutritionValue}>
                                {off.brands}
                            </CustomText>
                        </View>
                    ) : null}
                    {off.barcode ? (
                        <View style={styles.nutritionRow}>
                            <CustomText style={styles.nutritionLabel}>
                                Viivakoodi
                            </CustomText>
                            <CustomText style={styles.nutritionValue}>
                                {off.barcode}
                            </CustomText>
                        </View>
                    ) : null}
                    {off.nutritionGrade ? (
                        <View style={styles.nutritionRow}>
                            <CustomText style={styles.nutritionLabel}>
                                Nutri-Score
                            </CustomText>
                            <CustomText style={styles.nutritionValue}>
                                {String(off.nutritionGrade).toUpperCase()}
                            </CustomText>
                        </View>
                    ) : null}
                    {off.quantityLabel ? (
                        <View style={styles.nutritionRow}>
                            <CustomText style={styles.nutritionLabel}>
                                Pakkauskoko
                            </CustomText>
                            <CustomText style={styles.nutritionValue}>
                                {off.quantityLabel}
                            </CustomText>
                        </View>
                    ) : null}
                    {allergens ? (
                        <View style={styles.offTextRow}>
                            <CustomText style={styles.nutritionLabel}>
                                Allergeenit
                            </CustomText>
                            <CustomText style={styles.offTextValue}>
                                {allergens}
                            </CustomText>
                        </View>
                    ) : null}
                    {labels ? (
                        <View style={styles.offTextRow}>
                            <CustomText style={styles.nutritionLabel}>
                                Merkinnät
                            </CustomText>
                            <CustomText style={styles.offTextValue}>
                                {labels}
                            </CustomText>
                        </View>
                    ) : null}
                </View>
            ) : null}
        </>
    )
}

const styles = StyleSheet.create({
    sectionLabel: {
        fontWeight: '600',
        fontSize: 15,
        color: '#1f2937',
        marginBottom: 8,
    },
    nutritionBlock: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    offBlock: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    nutritionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        gap: 12,
    },
    nutritionLabel: {
        color: '#4b5563',
        fontSize: 14,
        flexShrink: 0,
    },
    nutritionValue: {
        color: '#1f2937',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
    },
    offTextRow: {
        paddingVertical: 6,
        gap: 4,
    },
    offTextValue: {
        color: '#1f2937',
        fontSize: 14,
        lineHeight: 20,
    },
})

export default PantryItemOffSection
