import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import {
    Alert,
    Image,
    ScrollView,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import CategoryFilter from '../components/CategoryFilter'
import CategoryFilterSection from '../components/CategoryFilterSection'
import CategorySectionHeader from '../components/CategorySectionHeader'
import CustomText from '../components/CustomText'
import FormFoodItem from '../components/FormFoodItem'
import PantryItemDetails from '../components/PantryItemDetails'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import SearchSection from '../components/SearchSection'
import UnifiedFoodSearch from '../components/UnifiedFoodSearch'
import categoriesData from '../data/categories.json'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import { scanItems } from '../utils/scanItems'
import storage from '../utils/storage'

const PANTRY_PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/1YIQLI04JJpf76ARo3k0b9/87322f1b9ccec07d2f2af66f7d61d53d/undraw_online-groceries_n03y.png'

const PantryScreen = ({}) => {
    const { isDesktop } = useResponsiveDimensions()
    const [showItemForm, setShowItemForm] = useState(false)
    const [pantryItems, setPantryItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [detailsVisible, setDetailsVisible] = useState(false)
    const [showFullInstructions, setShowFullInstructions] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddItemSearch, setShowAddItemSearch] = useState(false)
    const [selectedCategoryFilters, setSelectedCategoryFilters] = useState([])
    const [showFilters, setShowFilters] = useState(false)

    // Get ingredient categories from categories.json
    const ingredientCategories =
        categoriesData.find((cat) => cat.id === 'ingredients')?.children || []

    // Filter pantry items based on search query
    const filterItemsBySearch = (items) => {
        if (!searchQuery.trim()) {
            return items
        }
        return items.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
    }

    // Filter pantry items based on selected category filters
    const filterItemsByCategory = (items) => {
        if (selectedCategoryFilters.length === 0) {
            return items
        }

        return items.filter((item) => {
            if (!item.category || item.category.length === 0) {
                return false
            }

            // Item must have at least one of the selected category filters
            return selectedCategoryFilters.some((filterId) =>
                item.category.some(
                    (itemCatId) => String(itemCatId) === String(filterId)
                )
            )
        })
    }

    const toggleCategoryFilter = (categoryId) => {
        setSelectedCategoryFilters((prev) => {
            const normalizedId = String(categoryId)

            // Check is selected already normalize for comparison
            const isSelected = prev.some((id) => String(id) === normalizedId)

            if (isSelected) {
                return prev.filter((id) => String(id) !== normalizedId)
            } else {
                return [...prev, normalizedId]
            }
        })
    }

    const getCategoryItemCounts = () => {
        const counts = {}
        const searchedItems = filterItemsBySearch(pantryItems)

        ingredientCategories.forEach((category) => {
            counts[category.id] = searchedItems.filter((item) => {
                if (!item.category || item.category.length === 0) {
                    return false
                }
                return item.category.includes(String(category.id))
            }).length
        })

        return counts
    }

    // Apply both search and category filters
    const filteredPantryItems = filterItemsByCategory(
        filterItemsBySearch(pantryItems)
    )

    // Group items by category for section list
    const groupItemsByCategory = (items) => {
        // Create a map of category id to category name
        const categoryMap = {}
        ingredientCategories.forEach((cat) => {
            categoryMap[cat.id] = cat.name
        })

        // Group items by their ingredient category
        const grouped = {}
        const uncategorized = []

        items.forEach((item) => {
            if (item.category && item.category.length > 0) {
                // Find the first matching ingredient category
                let foundCategory = false
                for (const categoryId of item.category) {
                    if (categoryMap[categoryId]) {
                        const categoryName = categoryMap[categoryId]
                        if (!grouped[categoryName]) {
                            grouped[categoryName] = []
                        }
                        grouped[categoryName].push(item)
                        foundCategory = true
                        break // Only add to the first matching ingredient category
                    }
                }

                // If no ingredient category was found, add to uncategorized
                if (!foundCategory) {
                    uncategorized.push(item)
                }
            } else {
                uncategorized.push(item)
            }
        })

        // Convert to section list format
        const sections = Object.keys(grouped)
            .sort()
            .map((categoryName) => ({
                title: categoryName,
                data: grouped[categoryName],
            }))

        // Add uncategorized items at the end if any
        if (uncategorized.length > 0) {
            sections.push({
                title: 'Muut',
                data: uncategorized,
            })
        }

        return sections
    }

    const pantryItemSections = groupItemsByCategory(filteredPantryItems)

    const fetchPantryItems = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 10000,
            })

            if (response.data.success) {
                const items =
                    response.data.pantry?.items || response.data.items || []
                setPantryItems(items)
            } else {
                console.error('Failed to fetch pantry items:', response.data)
                Alert.alert('Virhe', 'Pentterin sisältöä ei voitu hakea')
                setPantryItems([])
            }
        } catch (error) {
            console.error('Error fetching pantry items:', error)
            Alert.alert(
                'Virhe',
                'Pentterin tietojen haku epäonnistui: ' +
                    (error.message === 'timeout exceeded'
                        ? 'Yhteys aikakatkaistiin'
                        : error.message || 'Tuntematon virhe')
            )
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
                    setShowItemForm(false)
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

    const handleScanPantry = async () => {
        try {
            setLoading(true)
            const response = await scanItems('pantry')

            if (response?.success) {
                await fetchPantryItems()
                Alert.alert('Onnistui', 'Pentterin tiedot päivitetty')
            } else {
                throw new Error('Skannaus epäonnistui')
            }
        } catch (error) {
            console.error('Error scanning pantry:', error)
            Alert.alert(
                'Virhe',
                'Skannaus epäonnistui: ' +
                    (error.message === 'timeout exceeded'
                        ? 'Yhteys aikakatkaistiin'
                        : error.message || 'Tuntematon virhe')
            )
            await fetchPantryItems() // Try to restore pantry items
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveItem = async (itemId) => {
        try {
            const token = await storage.getItem('userToken')

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

    const handleSearchItemSelect = async (item) => {
        try {
            // The UnifiedFoodSearch component should handle the actual addition
            // We just need to refresh the list and close the modal
            await fetchPantryItems()
            setShowAddItemSearch(false) // Close the modal
            Alert.alert('Onnistui', `${item.name} lisätty pentteriisi`)
        } catch (error) {
            console.error('Error adding item to pantry:', error)
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                style={styles.itemInfo}
                onPress={() => {
                    setSelectedItem(item)
                    setDetailsVisible(true)
                }}
            >
                <Image
                    source={{
                        uri: item.image?.url || PANTRY_PLACEHOLDER_IMAGE_URL,
                    }}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
                <View style={styles.itemTextContainer}>
                    <CustomText style={styles.itemName}>{item.name}</CustomText>
                    <CustomText style={styles.itemDetails}>
                        {item.quantity} {item.unit}
                    </CustomText>
                </View>
            </TouchableOpacity>
            <View style={styles.itemActions}>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                        handleRemoveItem(item._id)
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialIcons name="delete" size={20} color="#666" />
                </TouchableOpacity>
            </View>
        </View>
    )

    return (
        <ResponsiveLayout>
            <View
                style={
                    isDesktop ? styles.desktopContentWrapper : styles.fullWidth
                }
            >
                <View style={styles.container}>
                    <ResponsiveModal
                        visible={showItemForm}
                        onClose={() => setShowItemForm(false)}
                        title="Lisää tuote pantteriin"
                        maxWidth={600}
                    >
                        <FormFoodItem
                            onSubmit={handleAddItem}
                            location="pantry"
                        />
                    </ResponsiveModal>

                    <ResponsiveModal
                        visible={showAddItemSearch}
                        onClose={() => setShowAddItemSearch(false)}
                        title="Luo uusi tuote"
                        maxWidth={700}
                    >
                        <ScrollView
                            style={styles.modalScrollView}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={styles.addItemModalContainer}
                        >
                            {/* Search section */}
                            <View style={styles.searchSection}>
                                <CustomText style={styles.searchSectionTitle}>
                                    Etsi tuote tietokannasta
                                </CustomText>
                                <UnifiedFoodSearch
                                    onSelectItem={handleSearchItemSelect}
                                    location="pantry"
                                    addToLocation="pantry"
                                />
                            </View>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <CustomText style={styles.dividerText}>
                                    TAI
                                </CustomText>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Manual form section */}
                            <View style={styles.formSection}>
                                <CustomText style={styles.formSectionTitle}>
                                    Luo uusi tuote manuaalisesti
                                </CustomText>
                                <FormFoodItem
                                    onSubmit={handleAddItem}
                                    location="pantry"
                                />
                            </View>
                        </ScrollView>
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
                            onButtonPress={() => setShowAddItemSearch(true)}
                            buttonStyle={styles.primaryButton}
                            buttonTextStyle={styles.buttonText}
                            filterComponent={
                                <CategoryFilter
                                    selectedFilters={selectedCategoryFilters}
                                    showFilters={showFilters}
                                    onToggleShowFilters={() =>
                                        setShowFilters(!showFilters)
                                    }
                                />
                            }
                        />

                        {/* Category filters section */}
                        <CategoryFilterSection
                            categories={ingredientCategories}
                            selectedFilters={selectedCategoryFilters}
                            onToggleFilter={toggleCategoryFilter}
                            onClearFilters={() =>
                                setSelectedCategoryFilters([])
                            }
                            showFilters={showFilters}
                            itemCounts={getCategoryItemCounts()}
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
        alignSelf: 'center',
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
        color: '#9C86FC',
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
        zIndex: 1,
        position: 'relative',
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
    addItemModalContainer: {
        padding: 10,
    },
    modalScrollView: {
        maxHeight: '80vh', // Limit height on web
        flex: 1,
    },
    searchSectionTitle: {
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
    formSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'left',
    },
    fullWidth: {
        flex: 1,
        width: '100%',
    },
})
