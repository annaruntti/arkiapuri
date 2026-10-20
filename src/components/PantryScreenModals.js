import { ActivityIndicator, StyleSheet, View } from 'react-native'

import CustomText from './CustomText'
import PantryItemDetails from './PantryItemDetails'
import PantryLocationsEditor from './PantryLocationsEditor'
import PantryRemovalSuggestionsModal from './PantryRemovalSuggestionsModal'
import PantryScanLocationPicker from './PantryScanLocationPicker'
import PantryScanLockedModal from './PantryScanLockedModal'
import PantryScanReview from './PantryScanReview'
import ResponsiveModal from './ResponsiveModal'

/**
 * Overlay modals for PantryScreen (scan, locations, suggestions, details).
 */
const PantryScreenModals = ({
    scanLockVisible,
    onCloseScanLock,
    onScanLockAddManually,
    scanLockReason,
    scanReviewVisible,
    onCloseScanReview,
    scanCandidates,
    scanRemovals,
    scanLocationName,
    scanUsage,
    scanSubmitting,
    onCommitScanItems,
    scanLocationPickerVisible,
    onCloseScanLocationPicker,
    pantryLocations,
    onSelectScanLocation,
    locationsEditorVisible,
    onCloseLocationsEditor,
    onAddLocation,
    onRenameLocation,
    onDeleteLocation,
    suggestionsModalVisible,
    onCloseSuggestions,
    removalSuggestions,
    suggestionsSubmitting,
    onRemoveSuggestions,
    onKeepSuggestions,
    scanLoading,
    selectedItem,
    detailsVisible,
    onCloseDetails,
    onUpdateItem,
}) => (
    <>
        <PantryScanLockedModal
            visible={scanLockVisible}
            onClose={onCloseScanLock}
            onAddManually={onScanLockAddManually}
            reason={scanLockReason}
        />
        <PantryScanReview
            visible={scanReviewVisible}
            onClose={onCloseScanReview}
            items={scanCandidates}
            suggestedRemovals={scanRemovals}
            locationName={scanLocationName}
            usage={scanUsage}
            submitting={scanSubmitting}
            onSubmit={onCommitScanItems}
        />
        <PantryScanLocationPicker
            visible={scanLocationPickerVisible}
            onClose={onCloseScanLocationPicker}
            locations={pantryLocations}
            onSelect={onSelectScanLocation}
        />
        <PantryLocationsEditor
            visible={locationsEditorVisible}
            onClose={onCloseLocationsEditor}
            locations={pantryLocations}
            onAdd={onAddLocation}
            onRename={onRenameLocation}
            onDelete={onDeleteLocation}
        />
        <PantryRemovalSuggestionsModal
            visible={suggestionsModalVisible}
            onClose={onCloseSuggestions}
            suggestions={removalSuggestions}
            submitting={suggestionsSubmitting}
            onRemove={onRemoveSuggestions}
            onKeep={onKeepSuggestions}
        />
        <ResponsiveModal
            visible={scanLoading}
            onClose={() => {}}
            title="Tunnistetaan tuotteita"
            maxWidth={400}
            showCloseButton={false}
        >
            <View style={styles.scanLoadingBox}>
                <ActivityIndicator size="large" color="#5844BB" />
                <CustomText style={styles.scanLoadingText}>
                    Analysoidaan kuvaa. Tämä voi kestää hetken.
                </CustomText>
            </View>
        </ResponsiveModal>
        <PantryItemDetails
            item={selectedItem}
            visible={detailsVisible}
            locations={pantryLocations}
            onClose={onCloseDetails}
            onUpdate={onUpdateItem}
        />
    </>
)

const styles = StyleSheet.create({
    scanLoadingBox: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    scanLoadingText: {
        marginTop: 12,
        textAlign: 'center',
        color: '#555',
    },
})

export default PantryScreenModals
