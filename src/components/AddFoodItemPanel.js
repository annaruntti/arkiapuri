import { useState } from 'react'
import { Platform, ScrollView, StyleSheet, View } from 'react-native'
import { DEFAULT_SERVINGS } from '../utils/mealServings'
import CustomText from './CustomText'
import FormFoodItem from './FormFoodItem'
import GuestWarningBanner from './GuestWarningBanner'
import UnifiedFoodSearch from './UnifiedFoodSearch'

/**
 * Shared "search existing food OR create manually" panel used by pantry and meals.
 */
const AddFoodItemPanel = ({
    location = 'meal',
    onSelectItem,
    onSubmitNewItem,
    onCloseForm,
    mealId = null,
    shoppingListId = null,
    allowDuplicates = false,
    showGuestWarning = false,
    guestWarningMessage,
    searchTitle = 'Etsi tuote tietokannasta',
    formTitle = 'Luo uusi tuote manuaalisesti',
    showFormBackButton = false,
    servings = DEFAULT_SERVINGS,
}) => {
    const [askingMealQuantity, setAskingMealQuantity] = useState(false)

    return (
        <ScrollView
            style={styles.modalScrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.addItemModalContainer}
            keyboardShouldPersistTaps="handled"
        >
            {showGuestWarning && (
                <GuestWarningBanner
                    style={styles.guestWarning}
                    message={
                        guestWarningMessage ||
                        'Tietosi eivät tallennu pysyvästi ilman käyttäjätunnusta. Kirjaudu sisään tallentaaksesi tiedot.'
                    }
                />
            )}

            <View style={styles.searchSection}>
                {!askingMealQuantity && (
                    <CustomText style={styles.sectionTitle}>{searchTitle}</CustomText>
                )}
                <UnifiedFoodSearch
                    onSelectItem={onSelectItem}
                    location={location}
                    mealId={mealId}
                    shoppingListId={shoppingListId}
                    allowDuplicates={allowDuplicates}
                    onMealQuantityPromptChange={setAskingMealQuantity}
                    servings={servings}
                />
            </View>

            {location === 'meal' && askingMealQuantity ? null : (
                <>
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <CustomText style={styles.dividerText}>TAI</CustomText>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.formSection}>
                        <CustomText style={styles.sectionTitle}>{formTitle}</CustomText>
                        <FormFoodItem
                            onSubmit={onSubmitNewItem}
                            onClose={onCloseForm}
                            location={location}
                            allowNonFood={location === 'shopping-list'}
                            showBackButton={showFormBackButton}
                        />
                    </View>
                </>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    modalScrollView: {
        maxHeight: Platform.OS === 'web' ? '80vh' : undefined,
        flex: 1,
    },
    addItemModalContainer: {
        padding: 10,
        paddingBottom: 24,
    },
    guestWarning: {
        marginBottom: 20,
    },
    searchSection: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'left',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: 14,
        color: '#666',
        fontWeight: 'bold',
    },
    formSection: {
        marginTop: 5,
        alignItems: 'flex-start',
        width: '100%',
    },
})

export default AddFoodItemPanel
