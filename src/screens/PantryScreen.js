import { useCallback, useEffect, useState } from 'react'
import {
    Alert,
    StyleSheet,
    View,
} from 'react-native'
import axios from 'axios'
import { useFocusEffect } from '@react-navigation/native'

import PantryFilterChrome from '../components/PantryFilterChrome'
import PantryItemsBody from '../components/PantryItemsBody'
import AddFoodItemPanel from '../components/AddFoodItemPanel'
import FoodListItemRow from '../components/FoodListItemRow'
import LoginPromptModal from '../components/LoginPromptModal'
import useLoginPrompt from '../hooks/useLoginPrompt'
import usePantryLocations from '../hooks/usePantryLocations'
import usePantryScan from '../hooks/usePantryScan'
import { useLogin } from '../context/LoginProvider'
import NoticeBanner from '../components/NoticeBanner'
import ContentContainer from '../components/ContentContainer'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import AddActionSection from '../components/AddActionSection'
import SearchSection from '../components/SearchSection'
import StickyListLayout from '../components/StickyListLayout'
import PantryScreenModals from '../components/PantryScreenModals'

import { useFilteredItemList } from '../hooks/useFilteredItemList'
import { SORT_OPTION_IDS } from '../utils/listSort'
import { groupItemsByFoodCategory } from '../utils/foodCategories'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'
import {
    addPantryItem,
    deletePantryItem,
    dismissPantryRemovalSuggestions,
} from '../services/collectionApi'
import { showConfirm } from '../utils/showAlert'
import { getAiEntitlement } from '../services/aiApi'
import {
    ALL_LOCATIONS_ID,
    DEFAULT_PANTRY_LOCATIONS,
    UNLOCATED_LOCATION_ID,
    filterItemsByLocation,
    groupItemsByPantryLocation,
    inferLocationIdFromCategories,
    locationIdOf,
} from '../utils/pantryLocations'
import { mergeDuplicatePantryItems } from '../utils/pantryItemMerge'
import { buildPantryItemPayload } from '../utils/pantryAddItem'
import {
    parsePantryFetchResponse,
    pantryFetchErrorMessage,
} from '../utils/pantryFetch'
import {
    commitPantryScanItems,
    rewritePartialScanCandidates,
} from '../utils/pantryScanCommitSubmit'

const PantryScreen = ({}) => {
    const { isDesktop } = useResponsiveDimensions()
    const { continueWithoutLogin } = useLogin()
    const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
    const [pantryItems, setPantryItems] = useState([])
    const [pantryLocations, setPantryLocations] = useState(DEFAULT_PANTRY_LOCATIONS)
    const [removalSuggestions, setRemovalSuggestions] = useState([])
    const [selectedLocationId, setSelectedLocationId] = useState(ALL_LOCATIONS_ID)
    const [locationsEditorVisible, setLocationsEditorVisible] = useState(false)
    const [suggestionsModalVisible, setSuggestionsModalVisible] = useState(false)
    const [suggestionsSubmitting, setSuggestionsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [detailsVisible, setDetailsVisible] = useState(false)
    const [showAddItemSearch, setShowAddItemSearch] = useState(false)
    const [aiEntitlement, setAiEntitlement] = useState(null)
    const [scanSubmitting, setScanSubmitting] = useState(false)

    const {
        searchQuery,
        setSearchQuery,
        selectedCategoryFilters,
        setSelectedCategoryFilters,
        showFilters,
        setShowFilters,
        ingredientCategories,
        toggleCategoryFilter,
        getCategoryItemCounts,
        filteredItems: filteredPantryItems,
        itemSections: pantryItemSections,
        sortId,
        setSortId,
    } = useFilteredItemList({
        items: filterItemsByLocation(pantryItems, selectedLocationId),
        postFilter: mergeDuplicatePantryItems,
        groupItems:
            selectedLocationId === ALL_LOCATIONS_ID
                ? (items) => groupItemsByPantryLocation(items, pantryLocations)
                : groupItemsByFoodCategory,
        defaultSortId: SORT_OPTION_IDS.NAME_ASC,
    })

    const addGuestPantryItem = (itemData) => {
        const quantity =
            Number(itemData.quantity) ||
            Number(itemData.quantities?.pantry) ||
            Number(itemData.packageQuantity) ||
            1
        const guestItem = {
            _id: itemData._id || `guest-pantry-${Date.now()}`,
            name: (itemData.name || '').trim(),
            quantity,
            unit: itemData.unit || 'kpl',
            expirationDate: itemData.expirationDate || undefined,
            expirationDateSetByUser: Boolean(itemData.expirationDate),
            foodId: itemData.foodId || itemData._id,
            category: itemData.category || [],
            calories: Number(itemData.calories) || 0,
            price: Number(itemData.price) || 0,
            image: itemData.image,
            openFoodFactsData: itemData.openFoodFactsData,
            source: itemData.source,
            addedFrom: 'pantry',
            locationId:
                selectedLocationId !== ALL_LOCATIONS_ID &&
                selectedLocationId !== UNLOCATED_LOCATION_ID
                    ? selectedLocationId
                    : itemData.locationId ||
                      inferLocationIdFromCategories(
                          itemData.category,
                          pantryLocations
                      ),
        }
        setPantryItems((prev) =>
            mergeDuplicatePantryItems([...prev, guestItem])
        )
        return guestItem
    }

    const fetchPantryItems = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')

            if (!token) {
                // Keep guest session items in memory; don't wipe local list
                return
            }

            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 10000,
            })

            if (response.data.success) {
                const parsed = parsePantryFetchResponse(response.data)
                setPantryLocations(parsed.locations)
                setRemovalSuggestions(parsed.removalSuggestions)
                setPantryItems(parsed.items)
            } else {
                console.error('Failed to fetch pantry items:', response.data)
                setPantryItems([])
                Alert.alert('Virhe', 'Pentterin sisältöä ei voitu hakea')
            }
        } catch (error) {
            console.error('Error fetching pantry items:', error)
            setPantryItems([])
            if (error?.response?.status !== 401) {
                Alert.alert('Virhe', pantryFetchErrorMessage(error))
            }
        } finally {
            setLoading(false)
        }
    }

    const {
        handleAddLocation,
        handleRenameLocation,
        handleDeleteLocation,
    } = usePantryLocations({
        fetchPantryItems,
        selectedLocationId,
        setSelectedLocationId,
        showLoginPrompt,
    })

    const {
        scanLocationPickerVisible,
        setScanLocationPickerVisible,
        scanLocation,
        scanRemovals,
        setScanRemovals,
        scanLockVisible,
        setScanLockVisible,
        scanLockReason,
        scanReviewVisible,
        setScanReviewVisible,
        scanCandidates,
        setScanCandidates,
        scanUsage,
        scanLoading,
        handleOpenPantryScan,
        startScanForLocation,
    } = usePantryScan({
        pantryLocations,
        aiEntitlement,
        setAiEntitlement,
        showLoginPrompt,
        setLocationsEditorVisible,
    })

    const fetchAiEntitlement = async () => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) {
                setAiEntitlement(null)
                return
            }
            const data = await getAiEntitlement()
            setAiEntitlement(data.entitlement)
        } catch (error) {
            console.error('Error fetching AI entitlement:', error)
        }
    }

    useEffect(() => {
        fetchPantryItems()
        fetchAiEntitlement()
    }, [])

    // Refresh pantry items when user navigates to the screen
    useFocusEffect(
        useCallback(() => {
            fetchPantryItems()
            fetchAiEntitlement()
        }, [])
    )

    const handleAddItem = async (itemData) => {
        try {
            const token = await storage.getItem('userToken')

            if (!token) {
                if (!continueWithoutLogin) {
                    showLoginPrompt('save', () => handleAddItem(itemData))
                    return
                }
                if (!itemData.name || !itemData.unit) {
                    Alert.alert(
                        'Virhe',
                        'Nimi ja yksikkö ovat pakollisia tietoja'
                    )
                    return
                }
                addGuestPantryItem(itemData)
                setShowAddItemSearch(false)
                Alert.alert(
                    'Onnistui',
                    `Tuote "${itemData.name}" lisätty pentteriin`
                )
                return
            }

            const pantryItemData = await buildPantryItemPayload(itemData, {
                selectedLocationId,
                pantryLocations,
            })

            const pantryResponse = await axios.post(
                getServerUrl('/pantry/items'),
                pantryItemData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (pantryResponse.data.success) {
                setShowAddItemSearch(false)
                await fetchPantryItems()
                Alert.alert(
                    'Onnistui',
                    `Tuote "${itemData.name}" lisätty pentteriin`
                )
            } else {
                throw new Error('Failed to add item to pantry')
            }
        } catch (error) {
            console.error('Error adding item:', error?.response?.data || error)
            const message =
                error.message === 'Nimi ja yksikkö ovat pakollisia tietoja'
                    ? error.message
                    : 'Tuotteen lisääminen epäonnistui: ' +
                      (error.message || 'Tuntematon virhe')
            Alert.alert('Virhe', message)
        }
    }

    const getPantryItemIds = (item) => collectPantryMergedIds(item)

    const removeItemsLocally = (idsToRemove) => {
        const removeSet = new Set(idsToRemove.map(String))
        setPantryItems((prevItems) =>
            prevItems.filter(
                (row) =>
                    !collectPantryMergedIds(row).some((id) => removeSet.has(id))
            )
        )
    }

    const handleRemoveItem = async (item) => {
        const idsToRemove = getPantryItemIds(item)
        if (idsToRemove.length === 0) return

        const token = await storage.getItem('userToken')
        if (!token && !continueWithoutLogin) {
            showLoginPrompt('save')
            return
        }

        showConfirm({
            title: 'Poista tuote',
            message: 'Haluatko varmasti poistaa tuotteen pentteristä?',
            confirmText: 'Poista',
            destructive: true,
            onConfirm: async () => {
                try {
                    if (!token) {
                        removeItemsLocally(idsToRemove)
                        return
                    }

                    setLoading(true)
                    await Promise.all(
                        idsToRemove.map((id) => deletePantryItem(id))
                    )
                    removeItemsLocally(idsToRemove)
                    await fetchPantryItems()
                } catch (error) {
                    console.error('Error removing item:', error)
                    Alert.alert(
                        'Virhe',
                        'Tuotteen poisto epäonnistui: ' +
                            (error.response?.data?.message || error.message)
                    )
                } finally {
                    setLoading(false)
                }
            },
        })
    }

    const handleUpdateItem = async (itemId, updatedData) => {
        try {
            const token = await storage.getItem('userToken')

            if (!token) {
                if (!continueWithoutLogin) {
                    showLoginPrompt('save')
                    return
                }
                setPantryItems((prev) =>
                    prev.map((item) =>
                        item._id === itemId ? { ...item, ...updatedData } : item
                    )
                )
                setDetailsVisible(false)
                return
            }

            setLoading(true)

            const response = await axios.put(
                getServerUrl(`/pantry/items/${itemId}`),
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                // Fetch fresh data from server to ensure sync
                await fetchPantryItems()
                setDetailsVisible(false)
            } else {
                Alert.alert('Virhe', 'Tuotteen päivitys epäonnistui')
            }
        } catch (error) {
            console.error('Error updating item:', error)
            Alert.alert(
                'Virhe',
                'Tuotteen päivitys epäonnistui: ' +
                    (error.response?.data?.message || error.message)
            )
        } finally {
            setLoading(false)
        }
    }

    const handleSearchItemSelect = async (item, meta = {}) => {
        try {
            const token = await storage.getItem('userToken')
            if (!token) {
                if (!continueWithoutLogin) {
                    showLoginPrompt('save', () =>
                        handleSearchItemSelect(item, meta)
                    )
                    return
                }
                // Guest: UnifiedFoodSearch did not persist; add locally
                if (!meta.alreadyAdded) {
                    addGuestPantryItem(item)
                }
                setShowAddItemSearch(false)
                Alert.alert('Onnistui', `${item.name} lisätty pentteriisi`)
                return
            }

            // Logged-in: Open Food Facts products are already on the pantry.
            // Catalog search still needs a pantry row with its own quantity.
            if (meta.alreadyAdded) {
                await fetchPantryItems()
                setShowAddItemSearch(false)
                Alert.alert('Onnistui', `${item.name} lisätty pentteriisi`)
                return
            }

            await handleAddItem({
                ...item,
                quantity:
                    item.quantity ||
                    item.packageQuantity ||
                    1,
                unit: item.unit || 'kpl',
            })
        } catch (error) {
            console.error('Error adding item to pantry:', error)
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const renderItem = ({ item }) => (
        <FoodListItemRow
            variant="card"
            item={item}
            style={styles.listCard}
            onPress={() => {
                setSelectedItem(item)
                setDetailsVisible(true)
            }}
            onDelete={() => handleRemoveItem(item)}
            deleteAccessibilityLabel={`Poista ${item.name}`}
        />
    )

    const handleOpenAddItemSearch = async () => {
        const token = await storage.getItem('userToken')
        if (!token) {
            showLoginPrompt('save', () => setShowAddItemSearch(true))
            return
        }
        setShowAddItemSearch(true)
    }

    const handleRemoveSuggestedItems = async (suggestions) => {
        if (!suggestions?.length) return
        setSuggestionsSubmitting(true)
        try {
            await Promise.all(
                uniquePantryItemIds(suggestions).map((itemId) =>
                    deletePantryItem(itemId)
                )
            )
            await fetchPantryItems()
            setSuggestionsModalVisible(false)
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.message ||
                    'Tuotteiden poisto epäonnistui'
            )
        } finally {
            setSuggestionsSubmitting(false)
        }
    }

    const handleKeepSuggestedItems = async (suggestions) => {
        if (!suggestions?.length) {
            setSuggestionsModalVisible(false)
            return
        }
        setSuggestionsSubmitting(true)
        try {
            await dismissPantryRemovalSuggestions(
                suggestions.map((suggestion) => suggestion.itemId)
            )
            await fetchPantryItems()
            setSuggestionsModalVisible(false)
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.message ||
                    'Ehdotusten hylkääminen epäonnistui'
            )
        } finally {
            setSuggestionsSubmitting(false)
        }
    }

    const handleCommitScanItems = async (payload) => {
        setScanSubmitting(true)
        try {
            const result = await commitPantryScanItems({
                payload,
                locationId: scanLocation?._id,
            })

            if (result.status === 'empty') return

            if (result.status === 'ok') {
                setScanReviewVisible(false)
                setScanCandidates([])
                setScanRemovals([])
                await fetchPantryItems()
                const parts = []
                if (result.succeededKeys.length) {
                    parts.push(`${result.succeededKeys.length} lisätty`)
                }
                if (result.removalsCount) {
                    parts.push(`${result.removalsCount} poistettu`)
                }
                Alert.alert(
                    'Onnistui',
                    parts.length ? parts.join(', ') : 'Valinnat tallennettu'
                )
                return
            }

            if (result.succeededKeys.length > 0) {
                setScanCandidates((prev) =>
                    rewritePartialScanCandidates(
                        prev,
                        result.selectedItems,
                        result.succeededKeys
                    )
                )
                await fetchPantryItems()
            }

            const lastError = result.lastError
            Alert.alert(
                'Virhe',
                result.succeededKeys.length > 0
                    ? `${result.succeededKeys.length} tuotetta lisättiin, mutta kaikkia ei voitu lisätä. Yritä uudelleen jäljellä oleville.`
                    : lastError?.response?.data?.message ||
                          lastError?.response?.data?.error ||
                          lastError?.message ||
                          'Tuotteiden lisääminen epäonnistui. Voit lisätä ne manuaalisesti.'
            )
        } catch (error) {
            console.error('Error committing pantry scan:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.response?.data?.error ||
                    error.message ||
                    'Valintojen tallennus epäonnistui.'
            )
        } finally {
            setScanSubmitting(false)
        }
    }

    return (
        <ResponsiveLayout
            activeRoute="PantryStack"
            contentBackgroundColor="#f9fafb"
        >
            <ContentContainer>
                <View
                    style={[
                        styles.container,
                        isDesktop && styles.desktopContainer,
                    ]}
                >
                    <LoginPromptModal {...loginPromptProps} />

                    <ResponsiveModal
                        visible={showAddItemSearch}
                        onClose={() => setShowAddItemSearch(false)}
                        title="Luo uusi tuote"
                        maxWidth={640}
                    >
                        <AddFoodItemPanel
                            location="pantry"
                            showGuestWarning={true}
                            guestWarningMessage="Tietosi eivät tallennu pysyvästi ilman käyttäjätunnusta. Kirjaudu sisään tallentaaksesi pentterin sisällön."
                            onSelectItem={handleSearchItemSelect}
                            onSubmitNewItem={handleAddItem}
                            onCloseForm={() => setShowAddItemSearch(false)}
                            showFormBackButton={false}
                            pantryLocationId={
                                selectedLocationId !== ALL_LOCATIONS_ID &&
                                selectedLocationId !== UNLOCATED_LOCATION_ID
                                    ? selectedLocationId
                                    : undefined
                            }
                        />
                    </ResponsiveModal>

                    <StickyListLayout
                        chromeBackgroundColor="#f9fafb"
                        style={styles.listLayout}
                        header={
                            <View style={styles.addSticky}>
                                <AddActionSection
                                    title="Lisää tuotteita"
                                    hint="Skannaa jokin ruoan säilytyspaikoista — jääkaappi, pakastin tai kuivakaappi — tai lisää tuote manuaalisesti."
                                    primaryTitle="Skannaa säilytyspaikka"
                                    onPrimaryPress={handleOpenPantryScan}
                                    secondaryTitle="Lisää manuaalisesti"
                                    onSecondaryPress={handleOpenAddItemSearch}
                                />
                            </View>
                        }
                        sticky={
                            <View style={styles.findSection}>
                                <SearchSection
                                    heading="Etsi tuotteita"
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onClearSearch={() => setSearchQuery('')}
                                    placeholder="Etsi pentteristä..."
                                    showResultsInfo={false}
                                />
                            </View>
                        }
                    >
                        <View style={styles.productListContainer}>
                            {removalSuggestions.length > 0 ? (
                                <NoticeBanner
                                    variant="warning"
                                    icon
                                    actionLabel="Tarkista ehdotukset"
                                    onAction={() =>
                                        setSuggestionsModalVisible(true)
                                    }
                                >
                                    {`Pentterissä on ${removalSuggestions.length} poistoehdotusta.`}
                                </NoticeBanner>
                            ) : null}
                            <View style={styles.findSection}>
                                <PantryFilterChrome
                                    pantryLocations={pantryLocations}
                                    selectedLocationId={selectedLocationId}
                                    onSelectLocation={setSelectedLocationId}
                                    onManageLocations={() =>
                                        setLocationsEditorVisible(true)
                                    }
                                    unlocatedCount={
                                        pantryItems.filter(
                                            (item) => !locationIdOf(item)
                                        ).length
                                    }
                                    sortId={sortId}
                                    onSortChange={setSortId}
                                    selectedCategoryFilters={
                                        selectedCategoryFilters
                                    }
                                    showFilters={showFilters}
                                    onToggleShowFilters={() =>
                                        setShowFilters(!showFilters)
                                    }
                                    filteredCount={filteredPantryItems.length}
                                    totalCount={pantryItems?.length || 0}
                                    searchQuery={searchQuery}
                                    ingredientCategories={
                                        ingredientCategories
                                    }
                                    onToggleCategoryFilter={
                                        toggleCategoryFilter
                                    }
                                    onClearCategoryFilters={() =>
                                        setSelectedCategoryFilters([])
                                    }
                                    getCategoryItemCounts={
                                        getCategoryItemCounts
                                    }
                                />
                            </View>
                            <PantryItemsBody
                                sections={pantryItemSections}
                                loading={loading}
                                searchQuery={searchQuery}
                                renderItem={renderItem}
                            />
                        </View>
                    </StickyListLayout>
                    <PantryScreenModals
                        scanLockVisible={scanLockVisible}
                        onCloseScanLock={() => setScanLockVisible(false)}
                        onScanLockAddManually={() => {
                            setScanLockVisible(false)
                            setShowAddItemSearch(true)
                        }}
                        scanLockReason={scanLockReason}
                        scanReviewVisible={scanReviewVisible}
                        onCloseScanReview={() => setScanReviewVisible(false)}
                        scanCandidates={scanCandidates}
                        scanRemovals={scanRemovals}
                        scanLocationName={scanLocation?.name}
                        scanUsage={scanUsage}
                        scanSubmitting={scanSubmitting}
                        onCommitScanItems={handleCommitScanItems}
                        scanLocationPickerVisible={scanLocationPickerVisible}
                        onCloseScanLocationPicker={() =>
                            setScanLocationPickerVisible(false)
                        }
                        pantryLocations={pantryLocations}
                        onSelectScanLocation={startScanForLocation}
                        locationsEditorVisible={locationsEditorVisible}
                        onCloseLocationsEditor={() =>
                            setLocationsEditorVisible(false)
                        }
                        onAddLocation={handleAddLocation}
                        onRenameLocation={handleRenameLocation}
                        onDeleteLocation={handleDeleteLocation}
                        suggestionsModalVisible={suggestionsModalVisible}
                        onCloseSuggestions={() =>
                            setSuggestionsModalVisible(false)
                        }
                        removalSuggestions={removalSuggestions}
                        suggestionsSubmitting={suggestionsSubmitting}
                        onRemoveSuggestions={handleRemoveSuggestedItems}
                        onKeepSuggestions={handleKeepSuggestedItems}
                        scanLoading={scanLoading}
                        selectedItem={selectedItem}
                        detailsVisible={detailsVisible}
                        onCloseDetails={() => {
                            setDetailsVisible(false)
                            setSelectedItem(null)
                            fetchPantryItems()
                        }}
                        onUpdateItem={handleUpdateItem}
                    />
                </View>
            </ContentContainer>
        </ResponsiveLayout>
    )
}

export default PantryScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 15,
    },
    desktopContainer: {
        paddingHorizontal: 0,
    },
    productListContainer: {
        flex: 1,
        minHeight: 400,
    },
    listLayout: {
        backgroundColor: '#f9fafb',
    },
    listCard: {
        backgroundColor: '#ffffff',
    },
    addSticky: {
        backgroundColor: '#f9fafb',
        paddingBottom: 4,
    },
    findSection: {
        backgroundColor: '#f9fafb',
        paddingTop: 4,
    },
    findHeading: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
        marginBottom: 8,
    },
    productList: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 10,
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    manualAddContainer: {
        justifyContent: 'center',
    },
    manualAddContainerMobile: {
        width: '100%',
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        minWidth: 150,
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginTop: 10,
        marginBottom: 10,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    list: {
        width: '100%',
        zIndex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    formContainer: {
        padding: 15,
    },
})
