import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Image,
    ScrollView,
    SectionList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import FormFoodItem from '../components/FormFoodItem'
import PantryItemDetails from '../components/PantryItemDetails'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ResponsiveModal from '../components/ResponsiveModal'
import UnifiedFoodSearch from '../components/UnifiedFoodSearch'
import categoriesData from '../data/categories.json'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import { scanItems } from '../utils/scanItems'
import storage from '../utils/storage'

const PANTRY_PLACEHOLDER_IMAGE_URL =
    'https://images.ctfassets.net/2pij69ehhf4n/1YIQLI04JJpf76ARo3k0b9/87322f1b9ccec07d2f2af66f7d61d53d/undraw_online-groceries_n03y.png'

const PantryScreen = ({}) => {
    const [showItemForm, setShowItemForm] = useState(false)
    const [pantryItems, setPantryItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedItem, setSelectedItem] = useState(null)
    const [detailsVisible, setDetailsVisible] = useState(false)
    const [showFullInstructions, setShowFullInstructions] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddItemSearch, setShowAddItemSearch] = useState(false)
    const { isDesktop } = useResponsiveDimensions()

    // Filter pantry items based on search query
    const filteredPantryItems = pantryItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Group items by category for section list
    const groupItemsByCategory = (items) => {
        // Get all ingredient categories from categories.json
        const ingredientCategories =
            categoriesData.find((cat) => cat.id === 'ingredients')?.children ||
            []

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

    const pantryItemSections = groupItemsByCategory(
        searchQuery.length > 0 ? filteredPantryItems : pantryItems
    )

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
                setPantryItems([]) // Clear items on error
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
            setPantryItems([]) // Clear items on error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPantryItems()
    }, [])

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
                    setShowAddItemSearch(false) // Close the add item search modal
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
                Alert.alert('Onnistui', 'Tuotteen tiedot päivitetty')
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
            <View style={styles.container}>
                <ResponsiveModal
                    visible={showItemForm}
                    onClose={() => setShowItemForm(false)}
                    title="Lisää tuote pantteriin"
                    maxWidth={600}
                >
                    <FormFoodItem onSubmit={handleAddItem} location="pantry" />
                </ResponsiveModal>

                <ResponsiveModal
                    visible={showAddItemSearch}
                    onClose={() => setShowAddItemSearch(false)}
                    title="Luo uusi tuote"
                    maxWidth={800}
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
                        <CustomText style={styles.introText}>
                            Etsi ja lisää pentterisi tuotteita
                        </CustomText>
                        <View style={styles.instructionsContainer}>
                            {showFullInstructions ? (
                                <>
                                    <CustomText style={styles.infoText}>
                                        Täällä voit selata pentterisi eli
                                        ruokakomerosi sisältöä, sekä lisätä
                                        sinne uusia tuotteita. Pentterillä
                                        tarkoitetaan mitä tahansa kotisi
                                        elintarvikkeiden säilyttämiseen
                                        tarkoitettuja paikkoja. Esim. jääkaappi,
                                        pakastin ja kuiva-ainekaappi. Lisää ja
                                        ylläpidä pentterisi sisältöä täällä,
                                        jotta voit hyödyntää sen siältämiä
                                        elintarvikkeita ateriasuunnittelussa.
                                    </CustomText>
                                    <CustomText style={styles.infoText}>
                                        Etsi tuotteita nimellä tai valitse "Luo
                                        uusi tuote". Voit etsiä lisättäviä
                                        tuotteita, tai luoda itse uusia
                                        tuotteita.
                                    </CustomText>
                                </>
                            ) : (
                                <CustomText style={styles.infoText}>
                                    Selaa ja hallitse pentterisi sisältöä. Etsi
                                    tuotteita haulla tai luo uusi tuote.
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
                                    style={styles.toggleInstructionsText}
                                >
                                    {showFullInstructions
                                        ? 'Näytä vähemmän'
                                        : 'Lue lisää'}
                                </CustomText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sticky search section */}
                    <View style={styles.stickySearchSection}>
                        <View style={styles.searchAndAddContainer}>
                            <View style={styles.manualAddContainer}>
                                <Button
                                    title="+ Luo uusi tuote"
                                    onPress={() => setShowAddItemSearch(true)}
                                    style={styles.tertiaryButton}
                                    textStyle={styles.buttonText}
                                />
                            </View>
                            {/* Pantry-specific search */}
                            <View style={styles.pantrySearchContainer}>
                                <View style={styles.searchInputContainer}>
                                    <MaterialIcons
                                        name="search"
                                        size={20}
                                        color="#666"
                                        style={styles.searchIcon}
                                    />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Etsi pentteristä..."
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholderTextColor="#999"
                                    />
                                    {searchQuery.length > 0 && (
                                        <TouchableOpacity
                                            onPress={() => setSearchQuery('')}
                                            style={styles.clearButton}
                                        >
                                            <MaterialIcons
                                                name="clear"
                                                size={20}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Search results info */}
                                {searchQuery.length > 0 && (
                                    <View style={styles.searchResultsInfo}>
                                        <CustomText
                                            style={styles.searchResultsText}
                                        >
                                            {filteredPantryItems.length > 0
                                                ? `Löytyi ${filteredPantryItems.length} tuotetta`
                                                : 'Tuotteita ei löytynyt'}
                                        </CustomText>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={styles.stats}>
                            <CustomText>
                                Tuotteita:{' '}
                                {searchQuery.length > 0
                                    ? `${filteredPantryItems.length} / ${pantryItems?.length || 0}`
                                    : `${pantryItems?.length || 0} kpl`}
                            </CustomText>
                        </View>
                    </View>

                    {/* Product list container */}
                    <View style={styles.productListContainer}>
                        <SectionList
                            sections={pantryItemSections}
                            renderItem={renderItem}
                            renderSectionHeader={({ section: { title } }) => (
                                <View style={styles.sectionHeader}>
                                    <CustomText
                                        style={styles.sectionHeaderText}
                                    >
                                        {title}
                                    </CustomText>
                                </View>
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
    infoText: {
        fontSize: 17,
        textAlign: 'left',
        marginBottom: 10,
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
        marginBottom: 10,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 1,
        position: 'relative',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        marginBottom: 20,
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
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#fff',
        width: 'auto',
        borderWidth: 3,
        borderColor: '#9C86FC',
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
    searchAndAddContainer: {
        marginBottom: 15,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 15,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 9998,
        position: 'relative',
    },
    pantrySearchContainer: {
        flex: 1,
        marginBottom: 10,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 4,
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    searchResultsInfo: {
        paddingHorizontal: 4,
    },
    searchResultsText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    addItemModalContainer: {
        padding: 10,
    },
    modalScrollView: {
        maxHeight: '80vh', // Limit height on web
        flex: 1,
    },
    searchSection: {
        marginBottom: 15,
    },
    searchSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
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
    },
    formSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    sectionHeader: {
        backgroundColor: '#F0EBFF',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#9C86FC',
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
})
