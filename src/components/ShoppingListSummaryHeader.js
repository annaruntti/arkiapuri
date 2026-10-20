import { StyleSheet, View } from 'react-native'
import {
    formatEuro,
    lineAmount,
    sumLineAmounts,
} from '../utils/shoppingListPrice'
import Button from './Button'
import CustomText from './CustomText'
import GenericFilter from './GenericFilter'
import ListSortControl from './ListSortControl'
import ListStatsRow from './ListStatsRow'

/**
 * Total price, missing-price CTA, sort/filter chrome, and Open Prices notice.
 */
const ShoppingListSummaryHeader = ({
    shoppingList,
    filteredItems,
    searchQuery,
    selectedCategoryFilters,
    sortId,
    sortOptions,
    onSortChange,
    showFilters,
    onToggleShowFilters,
    onShowMissingPrices,
}) => {
    const listItems = shoppingList?.items || []
    const missingPriceItems = listItems.filter(
        (item) => lineAmount(item).missing
    )
    const showsOpenPrices = listItems.some((item) => lineAmount(item).openPrices)
    const visibleSum = sumLineAmounts(filteredItems)
    const isFiltered =
        searchQuery.length > 0 || selectedCategoryFilters.length > 0
    const totalPrice = isFiltered
        ? visibleSum
        : visibleSum || shoppingList?.totalEstimatedPrice || 0
    const hasMissingPrices = missingPriceItems.length > 0
    const itemCountLabel =
        searchQuery.length > 0 || selectedCategoryFilters.length > 0
            ? `${filteredItems.length} / ${listItems.length}`
            : `${listItems.length} kpl`

    return (
        <>
            <View style={styles.totalPriceRow}>
                <CustomText style={styles.totalPriceText}>
                    Kokonaishinta: {formatEuro(totalPrice)}
                </CustomText>
                {hasMissingPrices ? (
                    <Button
                        title={`Lisää puuttuvia hintoja (${missingPriceItems.length})`}
                        type="SECONDARY"
                        size="small"
                        onPress={onShowMissingPrices}
                        style={styles.missingPricesButton}
                        textStyle={styles.missingPricesButtonText}
                    />
                ) : null}
            </View>
            <ListStatsRow
                actions={
                    <>
                        <ListSortControl
                            options={sortOptions}
                            value={sortId}
                            onChange={onSortChange}
                        />
                        <GenericFilter
                            selectedFilters={selectedCategoryFilters}
                            showFilters={showFilters}
                            onToggleShowFilters={onToggleShowFilters}
                        />
                    </>
                }
            >
                <CustomText>Tuotteita:</CustomText>
                <CustomText>{itemCountLabel}</CustomText>
            </ListStatsRow>
            {showsOpenPrices ? (
                <View style={styles.priceNotice}>
                    <CustomText style={styles.priceNoticeText}>
                        Osa hinta-arvioista on Open Prices -aineistosta (ODbL).
                    </CustomText>
                </View>
            ) : null}
        </>
    )
}

const styles = StyleSheet.create({
    totalPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        width: '100%',
        marginBottom: 14,
    },
    totalPriceText: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        textAlign: 'left',
    },
    missingPricesButton: {
        flexGrow: 0,
        flexShrink: 1,
        maxWidth: '58%',
        minHeight: 40,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
    },
    missingPricesButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    priceNotice: {
        marginTop: 0,
        marginBottom: 8,
        gap: 8,
    },
    priceNoticeText: {
        fontSize: 14,
        textAlign: 'left',
        color: '#333',
    },
})

export default ShoppingListSummaryHeader
