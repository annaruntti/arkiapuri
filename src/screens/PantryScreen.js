import { useCallback, useEffect, useState } from 'react'
import {
    Alert,
    ScrollView,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import axios from 'axios'
import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

import GenericFilter from '../components/GenericFilter'
import GenericFilterSection from '../components/GenericFilterSection'
import ListSortControl from '../components/ListSortControl'
import CategorySectionHeader from '../components/CategorySectionHeader'
import CustomText from '../components/CustomText'
import AddFoodItemPanel from '../components/AddFoodItemPanel'
import FoodListItemRow from '../components/FoodListItemRow'
import LoginPromptModal from '../components/LoginPromptModal'
import useLoginPrompt from '../hooks/useLoginPrompt'
import { useLogin } from '../context/LoginProvider'
import PantryItemDetails from '../components/PantryItemDetails'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import SearchSection from '../components/SearchSection'

import { useFilteredItemList } from '../hooks/useFilteredItemList'
import { PANTRY_SORT_OPTIONS, SORT_OPTION_IDS } from '../utils/listSort'
import { groupItemsByFoodCategory } from '../utils/foodCategories'
import { getServerUrl } from '../utils/getServerUrl'
import { getFoodItemImageUrl } from '../utils/openFoodFactsMapper'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

const normalizePantryName = (name) =>
    String(name || '')
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .replace(/\s+/g, ' ')

/** Treat "Kevyt maito" and "Kevytmaito" as the same product. */
const pantryItemMergeKey = (name) =>
    normalizePantryName(name)
        .replace(/[^a-zåäö0-9]+/gi, '')
        .toLowerCase()
        .trim()

const getPantryFoodId = (item) => {
    if (!item?.foodId) return null
    if (typeof item.foodId === 'object') {
        return String(item.foodId._id || item.foodId.id || '')
    }
    return String(item.foodId)
}

/** Show the same product only once; sum quantities. Name is the merge key. */
const mergeDuplicatePantryItems = (items = []) => {
    const groups = new Map()

    for (const item of items) {
        const foodName =
            item.foodId && typeof item.foodId === 'object'
                ? item.foodId.name
                : ''
        const displayName = (item.name || foodName || '').trim()
        const nameKey = pantryItemMergeKey(displayName)
        const foodId = getPantryFoodId(item)
        const key = nameKey
            ? `name:${nameKey}`
            : foodId
              ? `food:${foodId}`
              : `id:${item._id}`

        const itemUnit = item.unit === 'pcs' ? 'kpl' : item.unit || 'kpl'
        // Keep different units of the same product separate so quantities
        // are not summed across incompatible units (e.g. 1 kpl + 500 g).
        const mergeKey = `${key}:unit:${itemUnit}`

        const existing = groups.get(mergeKey)
        if (!existing) {
            groups.set(mergeKey, {
                ...item,
                name: displayName || item.name,
                unit: itemUnit,
            })
            continue
        }

        existing.quantity =
            (Number(existing.quantity) || 0) + (Number(item.quantity) || 0)
        existing.unit = itemUnit

        if (
            /\s/.test(displayName) &&
            !/\s/.test(String(existing.name || ''))
        ) {
            existing.name = displayName
        }

        if (
            item.expirationDate &&
            (!existing.expirationDate ||
                new Date(item.expirationDate) <
                    new Date(existing.expirationDate))
        ) {
            existing.expirationDate = item.expirationDate
        }

        if (!getFoodItemImageUrl(existing) && getFoodItemImageUrl(item)) {
            existing.image = item.image
            existing.foodId = item.foodId
        }
    }

    return [...groups.values()]
}

const PantryScreen = ({}) => {
    const { isDesktop } = useResponsiveDimensions()
    const { continueWithoutLogin } = useLogin()
    const { showLoginPrompt, loginPromptProps } = useLoginPrompt()
    const [pantryItems, setPantryItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [detailsVisible, setDetailsVisible] = useState(false)
    const [showFullInstructions, setShowFullInstructions] = useState(false)
    const [showAddItemSearch, setShowAddItemSearch] = useState(false)

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
        items: pantryItems,
        postFilter: mergeDuplicatePantryItems,
        groupItems: groupItemsByFoodCategory,
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
            expirationDate:
                itemData.expirationDate ||
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            foodId: itemData.foodId || itemData._id,
            category: itemData.category || [],
            calories: Number(itemData.calories) || 0,
            price: Number(itemData.price) || 0,
            image: itemData.image,
            openFoodFactsData: itemData.openFoodFactsData,
            source: itemData.source,
            addedFrom: 'pantry',
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
                const items =
                    response.data.pantry?.items || response.data.items || []
                setPantryItems(mergeDuplicatePantryItems(items))
            } else {
                console.error('Failed to fetch pantry items:', response.data)
                Alert.alert('Virhe', 'Pentterin sisältöä ei voitu hakea')
                setPantryItems([])
            }
        } catch (error) {
            console.error('Error fetching pantry items:', error)
            if (error?.response?.status !== 401) {
                Alert.alert(
                    'Virhe',
                    'Pentterin tietojen haku epäonnistui: ' +
                        (error.message === 'timeout exceeded'
                            ? 'Yhteys aikakatkaistiin'
                            : error.message || 'Tuntematon virhe')
                )
            }
            setPantryItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPantryItems()
    }, [])

    // Refresh pantry items when user navigates to the screen
    useFocusEffect(
        useCallback(() => {
            fetchPantryItems()
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

            // Validate required fields
            if (!itemData.name || !itemData.unit) {
                Alert.alert('Virhe', 'Nimi ja yksikkö ovat pakollisia tietoja')
                return
            }

            // First create the FoodItem
            const foodItemData = {
                name: itemData.name.trim(),
                category: itemData.category || [],
                unit: itemData.unit,
                price: Number(itemData.price) || 0,
                calories: Number(itemData.calories) || 0,
                locations: ['pantry'],
                quantities: {
                    meal: 0,
                    'shopping-list': 0,
                    pantry: Number(itemData.quantity) || 1,
                },
                expirationDate:
                    itemData.expirationDate ||
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }

            const foodItemResponse = await axios.post(
                getServerUrl('/food-items'),
                foodItemData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            if (foodItemResponse.data.success) {
                // Then create the pantry item
                const pantryItemData = {
                    name: itemData.name.trim(),
                    quantity: Number(itemData.quantity) || 1,
                    unit: itemData.unit,
                    expirationDate:
                        itemData.expirationDate ||
                        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    foodId: foodItemResponse.data.foodItem._id,
                    category: itemData.category || [],
                    calories: Number(itemData.calories) || 0,
                    price: Number(itemData.price) || 0,
                    addedFrom: 'pantry',
                }

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
            } else {
                throw new Error('Failed to create food item')
            }
        } catch (error) {
            console.error('Error adding item:', error?.response?.data || error)
            Alert.alert(
                'Virhe',
                'Tuotteen lisääminen epäonnistui: ' +
                    (error.message || 'Tuntematon virhe')
            )
        }
    }

    const handleRemoveItem = async (itemId) => {
        try {
            const token = await storage.getItem('userToken')

            if (!token) {
                if (!continueWithoutLogin) {
                    showLoginPrompt('save')
                    return
                }
                Alert.alert(
                    'Poista tuote',
                    'Haluatko varmasti poistaa tuotteen pentteristä?',
                    [
                        { text: 'Peruuta', style: 'cancel' },
                        {
                            text: 'Poista',
                            style: 'destructive',
                            onPress: () => {
                                setPantryItems((prevItems) =>
                                    prevItems.filter(
                                        (item) => item._id !== itemId
                                    )
                                )
                            },
                        },
                    ]
                )
                return
            }

            // Show confirmation dialog
            Alert.alert(
                'Poista tuote',
                'Haluatko varmasti poistaa tuotteen pentteristä?',
                [
                    {
                        text: 'Peruuta',
                        style: 'cancel',
                    },
                    {
                        text: 'Poista',
                        onPress: async () => {
                            try {
                                setLoading(true) // Show loading state
                                const response = await axios.delete(
                                    getServerUrl(`/pantry/items/${itemId}`),
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                )

                                if (response.data.success) {
                                    // Update local state to remove the item
                                    setPantryItems((prevItems) =>
                                        prevItems.filter(
                                            (item) => item._id !== itemId
                                        )
                                    )
                                    // Fetch updated list to ensure sync with server
                                    await fetchPantryItems()
                                } else {
                                    Alert.alert(
                                        'Virhe',
                                        'Tuotteen poisto epäonnistui'
                                    )
                                }
                            } catch (error) {
                                console.error('Error removing item:', error)
                                Alert.alert(
                                    'Virhe',
                                    'Tuotteen poisto epäonnistui: ' +
                                        (error.response?.data?.message ||
                                            error.message)
                                )
                            } finally {
                                setLoading(false) // Hide loading state
                            }
                        },
                        style: 'destructive',
                    },
                ]
            )
        } catch (error) {
            console.error('Error in handleRemoveItem:', error)
            Alert.alert('Virhe', 'Tuotteen poisto epäonnistui')
        }
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

            // Logged-in: UnifiedFoodSearch may already have added (OFF).
            // Refresh list and close modal.
            await fetchPantryItems()
            setShowAddItemSearch(false)
            Alert.alert('Onnistui', `${item.name} lisätty pentteriisi`)
        } catch (error) {
            console.error('Error adding item to pantry:', error)
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const renderItem = ({ item }) => (
        <FoodListItemRow
            item={item}
            onPress={() => {
                setSelectedItem(item)
                setDetailsVisible(true)
            }}
            trailingAction={
                <View style={styles.itemActions}>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleRemoveItem(item._id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialIcons name="delete" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            }
            style={styles.pantryItemRow}
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

    return (
        <ResponsiveLayout>
            <View
                style={
                    isDesktop ? styles.desktopContentWrapper : styles.fullWidth
                }
            >
                <View style={styles.container}>
                    <LoginPromptModal {...loginPromptProps} />

                    <ResponsiveModal
                        visible={showAddItemSearch}
                        onClose={() => setShowAddItemSearch(false)}
                        title="Luo uusi tuote"
                        showBackButton
                        maxWidth={700}
                    >
                        <AddFoodItemPanel
                            location="pantry"
                            showGuestWarning={true}
                            guestWarningMessage="Tietosi eivät tallennu pysyvästi ilman käyttäjätunnusta. Kirjaudu sisään tallentaaksesi pentterin sisällön."
                            onSelectItem={handleSearchItemSelect}
                            onSubmitNewItem={handleAddItem}
                            onCloseForm={() => setShowAddItemSearch(false)}
                            showFormBackButton={false}
                        />
                    </ResponsiveModal>

                    <ScrollView
                        style={styles.mainScrollView}
                        stickyHeaderIndices={[1]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header section that scrolls away */}
                        <View style={styles.headerSection}>
                            <CustomText
                                style={[
                                    styles.introText,
                                    isDesktop && styles.desktopIntroText,
                                ]}
                            >
                                Etsi ja lisää pentterisi tuotteita
                            </CustomText>
                            <View style={styles.instructionsContainer}>
                                {showFullInstructions ? (
                                    <>
                                        <CustomText
                                            style={[
                                                styles.infoText,
                                                isDesktop &&
                                                    styles.desktopInfoText,
                                            ]}
                                        >
                                            Täällä voit selata pentterisi eli
                                            ruokakomerosi sisältöä, sekä lisätä
                                            sinne uusia tuotteita. Pentterillä
                                            tarkoitetaan mitä tahansa kotisi
                                            elintarvikkeiden säilyttämiseen
                                            tarkoitettuja paikkoja. Esim.
                                            jääkaappi, pakastin ja
                                            kuiva-ainekaappi. Lisää ja ylläpidä
                                            pentterisi sisältöä täällä, jotta
                                            voit hyödyntää sen siältämiä
                                            elintarvikkeita
                                            ateriasuunnittelussa.
                                        </CustomText>
                                        <CustomText
                                            style={[
                                                styles.infoText,
                                                isDesktop &&
                                                    styles.desktopInfoText,
                                            ]}
                                        >
                                            Etsi tuotteita nimellä tai valitse
                                            "Luo uusi tuote". Voit etsiä
                                            lisättäviä tuotteita, tai luoda itse
                                            uusia tuotteita.
                                        </CustomText>
                                    </>
                                ) : (
                                    <CustomText
                                        style={[
                                            styles.infoText,
                                            isDesktop && styles.desktopInfoText,
                                        ]}
                                    >
                                        Selaa ja hallitse pentterisi sisältöä.
                                        Etsi tuotteita haulla tai luo uusi
                                        tuote.
                                    </CustomText>
                                )}
                                <TouchableOpacity
                                    style={styles.toggleInstructionsButton}
                                    onPress={() =>
                                        setShowFullInstructions(
                                            !showFullInstructions
                                        )
                                    }
                                >
                                    <CustomText
                                        style={[
                                            styles.toggleInstructionsText,
                                            isDesktop &&
                                                styles.desktopToggleInstructionsText,
                                        ]}
                                    >
                                        {showFullInstructions
                                            ? 'Näytä vähemmän'
                                            : 'Lue lisää'}
                                    </CustomText>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Search section with buttons */}
                        <SearchSection
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onClearSearch={() => setSearchQuery('')}
                            placeholder="Etsi pentteristä..."
                            resultsCount={filteredPantryItems.length}
                            resultsText="Löytyi {count} tuotetta"
                            noResultsText="Tuotteita ei löytynyt"
                            showButtonSection={true}
                            buttonTitle="+ Luo uusi tuote"
                            onButtonPress={handleOpenAddItemSearch}
                            buttonStyle={styles.primaryButton}
                            buttonTextStyle={styles.buttonText}
                            filterComponent={
                                <GenericFilter
                                    selectedFilters={selectedCategoryFilters}
                                    showFilters={showFilters}
                                    onToggleShowFilters={() =>
                                        setShowFilters(!showFilters)
                                    }
                                />
                            }
                        />

                        <GenericFilterSection
                            selectedFilters={selectedCategoryFilters}
                            showFilters={showFilters}
                            filterTitle="Suodata kategorioittain:"
                            categories={ingredientCategories}
                            onToggleFilter={toggleCategoryFilter}
                            onClearFilters={() =>
                                setSelectedCategoryFilters([])
                            }
                            getItemCounts={getCategoryItemCounts}
                        />

                        {/* Product list container */}
                        <View style={styles.productListContainer}>
                            <View style={styles.stats}>
                                <CustomText>
                                    Tuotteita:{' '}
                                    {searchQuery.length > 0 ||
                                    selectedCategoryFilters.length > 0
                                        ? `${filteredPantryItems.length} / ${pantryItems?.length || 0}`
                                        : `${pantryItems?.length || 0} kpl`}
                                </CustomText>
                                <ListSortControl
                                    options={PANTRY_SORT_OPTIONS}
                                    value={sortId}
                                    onChange={setSortId}
                                />
                            </View>
                            <SectionList
                                sections={pantryItemSections}
                                renderItem={renderItem}
                                renderSectionHeader={({
                                    section: { title, data },
                                }) => (
                                    <CategorySectionHeader
                                        title={title}
                                        count={data.length}
                                    />
                                )}
                                keyExtractor={(item) => item._id}
                                extraData={[
                                    pantryItems,
                                    searchQuery,
                                    filteredPantryItems,
                                ]}
                                style={styles.productList}
                                contentContainerStyle={styles.listContent}
                                scrollEnabled={false}
                                stickySectionHeadersEnabled={false}
                                ListEmptyComponent={
                                    !loading && (
                                        <CustomText style={styles.emptyText}>
                                            {searchQuery.length > 0
                                                ? `Hakusanalla "${searchQuery}" ei löytynyt tuotteita.`
                                                : 'Pentterissäsi ei ole vielä lisätty elintarvikkeita.'}
                                        </CustomText>
                                    )
                                }
                            />
                        </View>
                    </ScrollView>
                    <PantryItemDetails
                        item={selectedItem}
                        visible={detailsVisible}
                        onClose={() => {
                            setDetailsVisible(false)
                            setSelectedItem(null)
                            // Refresh pantry items to ensure we have latest data
                            fetchPantryItems()
                        }}
                        onUpdate={handleUpdateItem}
                    />
                </View>
            </View>
        </ResponsiveLayout>
    )
}

export default PantryScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
    },
    desktopContentWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: 960,
        alignSelf: 'left',
        paddingHorizontal: 40,
    },
    mainScrollView: {
        flex: 1,
        zIndex: 1,
    },
    headerSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 5,
        paddingTop: 10,
        paddingBottom: 10,
    },
    stickySearchSection: {
        backgroundColor: '#fff',
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 2,
        marginBottom: 5,
        zIndex: 10000,
        position: 'relative',
    },
    productListContainer: {
        flex: 1,
        minHeight: 400,
    },
    productList: {
        flex: 1,
    },
    introText: {
        fontSize: 19,
        textAlign: 'left',
        marginBottom: 10,
    },
    desktopIntroText: {
        fontSize: 21,
        paddingVertical: 16,
    },
    infoText: {
        fontSize: 17,
        textAlign: 'left',
        marginBottom: 10,
    },
    desktopInfoText: {
        fontSize: 19,
    },
    toggleInstructionsButton: {
        alignSelf: 'left',
        paddingVertical: 5,
    },
    toggleInstructionsText: {
        fontSize: 14,
        color: '#5844BB',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    desktopToggleInstructionsText: {
        fontSize: 17,
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
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 5,
        position: 'relative',
        overflow: 'visible',
        marginBottom: 8,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
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
    itemContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    pantryItemRow: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 10,
        alignItems: 'center',
    },
    itemTextContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemDetails: {
        color: '#666',
        fontSize: 14,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#e0e0e0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
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
    fullWidth: {
        flex: 1,
        width: '100%',
    },
})
