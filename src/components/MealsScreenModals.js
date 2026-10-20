import { ActivityIndicator, StyleSheet, View } from 'react-native'

import AddMealForm from './FormAddMeal'
import CustomText from './CustomText'
import LoginPromptModal from './LoginPromptModal'
import MealItemDetail from './MealItemDetail'
import PantryScanLockedModal from './PantryScanLockedModal'
import ResponsiveModal from './ResponsiveModal'

/**
 * Overlay modals for MealsScreen (add, detail, scan lock/loading).
 */
const MealsScreenModals = ({
    modalVisible,
    onCloseAddMeal,
    addMealNested,
    aiDraft,
    onSubmitAddMeal,
    addMealBackRef,
    onAddMealHeaderChange,
    loginPromptProps,
    selectedMeal,
    detailModalVisible,
    onCloseDetail,
    onUpdateMeal,
    scanLockVisible,
    onCloseScanLock,
    onScanLockAddManually,
    scanLockReason,
    scanLoading,
}) => (
    <>
        <ResponsiveModal
            visible={modalVisible}
            onClose={onCloseAddMeal}
            title={
                addMealNested
                    ? 'Valitse ostoslista'
                    : aiDraft
                      ? 'Tarkista AI:n ehdotus'
                      : 'Lisää uusi ateria'
            }
            showBackButton={addMealNested}
            maxWidth={640}
        >
            <AddMealForm
                key={aiDraft ? 'ai-draft' : 'manual'}
                onSubmit={onSubmitAddMeal}
                aiDraft={aiDraft}
                backHandlerRef={addMealBackRef}
                onHeaderStateChange={onAddMealHeaderChange}
            />
        </ResponsiveModal>

        <LoginPromptModal {...loginPromptProps} />

        <MealItemDetail
            meal={selectedMeal}
            visible={detailModalVisible}
            onClose={onCloseDetail}
            onUpdate={onUpdateMeal}
        />
        <PantryScanLockedModal
            visible={scanLockVisible}
            onClose={onCloseScanLock}
            onAddManually={onScanLockAddManually}
            reason={scanLockReason}
            manualButtonTitle="Lisää ateria manuaalisesti"
            upgradeMessage="Aterian tunnistus kuvasta kuuluu maksulliseen sopimukseen. Ilmaisella tilillä voit lisätä aterian manuaalisesti."
        />
        <ResponsiveModal
            visible={scanLoading}
            onClose={() => {}}
            title="Tunnistetaan ateriaa"
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
    </>
)

const styles = StyleSheet.create({
    scanLoadingBox: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    scanLoadingText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        color: '#374151',
    },
})

export default MealsScreenModals
