import AddFoodItemPanel from './AddFoodItemPanel'
import DuplicateShoppingItemModal from './DuplicateShoppingItemModal'
import MissingPriceItemsPanel from './MissingPriceItemsPanel'
import PantryItemDetails from './PantryItemDetails'
import ResponsiveModal from './ResponsiveModal'
import { lineAmount } from '../utils/shoppingListPrice'

/**
 * Overlay modals for ShoppingListDetail (details, add, missing prices, merge).
 */
const ShoppingListDetailModals = ({
    modalView,
    itemDetailsView,
    selectedItem,
    onCloseListView,
    onUpdateItem,
    showAddItem,
    addItemSession,
    shoppingListId,
    onSelectSearchItem,
    onSubmitNewItem,
    autoOpenScanner,
    showMissingPrices,
    onCloseMissingPrices,
    shoppingListItems,
    getListItemId,
    onOpenItemDetails,
    duplicateMerge,
    onConfirmDuplicateMerge,
    onCancelDuplicateMerge,
}) => (
    <>
        <ResponsiveModal
            visible={modalView === itemDetailsView && Boolean(selectedItem)}
            onClose={onCloseListView}
            title={selectedItem?.name || 'Tuotteen tiedot'}
            maxWidth={640}
        >
            {selectedItem ? (
                <PantryItemDetails
                    item={selectedItem}
                    embedded
                    onClose={onCloseListView}
                    onUpdate={onUpdateItem}
                />
            ) : null}
        </ResponsiveModal>

        <ResponsiveModal
            visible={showAddItem}
            onClose={onCloseListView}
            title="Lisää tuote"
            maxWidth={640}
        >
            <AddFoodItemPanel
                key={addItemSession}
                location="shopping-list"
                shoppingListId={shoppingListId}
                onSelectItem={onSelectSearchItem}
                onSubmitNewItem={onSubmitNewItem}
                onCloseForm={onCloseListView}
                showFormBackButton={false}
                autoOpenScanner={autoOpenScanner}
            />
        </ResponsiveModal>

        <ResponsiveModal
            visible={showMissingPrices}
            onClose={onCloseMissingPrices}
            title="Puuttuvat hinnat"
            maxWidth={640}
        >
            <MissingPriceItemsPanel
                items={(shoppingListItems || []).filter(
                    (item) => lineAmount(item).missing
                )}
                onSavePrice={async (item, price) => {
                    await onUpdateItem(getListItemId(item), { price }, {
                        keepView: true,
                    })
                }}
                onOpenDetails={(item) => {
                    onCloseMissingPrices()
                    onOpenItemDetails(item)
                }}
                onClose={onCloseMissingPrices}
            />
        </ResponsiveModal>

        <DuplicateShoppingItemModal
            visible={Boolean(duplicateMerge)}
            existing={duplicateMerge?.existing}
            incoming={duplicateMerge?.incoming}
            onConfirm={onConfirmDuplicateMerge}
            onCancel={onCancelDuplicateMerge}
        />
    </>
)

export default ShoppingListDetailModals
