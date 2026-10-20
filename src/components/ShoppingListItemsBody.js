import { StyleSheet, View } from 'react-native'

import Button from './Button'
import CategorySectionHeader from './CategorySectionHeader'
import GenericFilterSection from './GenericFilterSection'
import ShoppingListSummaryHeader from './ShoppingListSummaryHeader'
import { SHOPPING_SORT_OPTIONS } from '../utils/listSort'

/**
 * Summary, category filters, sectioned rows, and bought-item actions.
 */
const ShoppingListItemsBody = ({
    shoppingList,
    filteredItems,
    searchQuery,
    selectedCategoryFilters,
    sortId,
    onSortChange,
    showFilters,
    onToggleShowFilters,
    onShowMissingPrices,
    ingredientCategories,
    onToggleCategoryFilter,
    onClearCategoryFilters,
    getCategoryItemCounts,
    itemSections,
    renderItem,
    boughtItemCount,
    onRestoreBought,
    onDeleteBought,
}) => (
    <View style={styles.itemsListContainer}>
        <ShoppingListSummaryHeader
            shoppingList={shoppingList}
            filteredItems={filteredItems}
            searchQuery={searchQuery}
            selectedCategoryFilters={selectedCategoryFilters}
            sortId={sortId}
            sortOptions={SHOPPING_SORT_OPTIONS}
            onSortChange={onSortChange}
            showFilters={showFilters}
            onToggleShowFilters={onToggleShowFilters}
            onShowMissingPrices={onShowMissingPrices}
        />
        <GenericFilterSection
            selectedFilters={selectedCategoryFilters}
            showFilters={showFilters}
            filterTitle="Suodata kategorioittain:"
            categories={ingredientCategories}
            onToggleFilter={onToggleCategoryFilter}
            onClearFilters={onClearCategoryFilters}
            getItemCounts={getCategoryItemCounts}
        />
        <View style={[styles.itemsList, styles.listContent]}>
            {itemSections.map((section) => (
                <View key={section.title || 'shopping-section'}>
                    <CategorySectionHeader
                        title={section.title}
                        count={section.data.length}
                    />
                    {section.data.map((item) => (
                        <View key={item._id}>{renderItem({ item })}</View>
                    ))}
                </View>
            ))}
        </View>
        {boughtItemCount > 0 && (
            <View style={styles.listEndActions}>
                <Button
                    title={`Palauta kerätyt (${boughtItemCount})`}
                    type="SECONDARY"
                    fullWidth
                    onPress={onRestoreBought}
                    style={styles.listEndActionButton}
                />
                <Button
                    title={`Poista kerätyt (${boughtItemCount})`}
                    type="TERTIARY"
                    fullWidth
                    onPress={onDeleteBought}
                    style={styles.listEndActionButton}
                />
            </View>
        )}
    </View>
)

const styles = StyleSheet.create({
    itemsListContainer: {
        flex: 1,
        minHeight: 400,
    },
    itemsList: {
        width: '100%',
        zIndex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    listEndActions: {
        width: '100%',
        gap: 10,
        marginTop: 16,
        marginBottom: 8,
    },
    listEndActionButton: {
        width: '100%',
        minHeight: 45,
        paddingVertical: 7,
        paddingHorizontal: 14,
    },
})

export default ShoppingListItemsBody
