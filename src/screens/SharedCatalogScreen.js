import React, { useCallback, useEffect, useState } from 'react'
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import CustomText from '../components/CustomText'
import Button from '../components/Button'
import ContentContainer from '../components/ContentContainer'
import FoodListItemRow from '../components/FoodListItemRow'
import MealItem from '../components/MealItem'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ScreenTabBar from '../components/ScreenTabBar'
import SearchSection from '../components/SearchSection'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import {
    updateOpenCatalogFoodItem,
    updateOpenCatalogMeal,
} from '../utils/publishToOpenCatalog'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

const TABS = [
    { id: 'foods', label: 'Elintarvikkeet' },
    { id: 'meals', label: 'Ateriat' },
]

const WHITE_CARD = { backgroundColor: '#ffffff' }

const SharedCatalogScreen = () => {
    const { profile } = useLogin()
    const isAdmin = profile?.platformRole === 'admin'
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const [tab, setTab] = useState('foods')
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [editName, setEditName] = useState('')
    const [editUnit, setEditUnit] = useState('')
    const [editRecipe, setEditRecipe] = useState('')
    const [savingEdit, setSavingEdit] = useState(false)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedQuery(query.trim())
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [query])

    const authHeaders = async () => {
        const token = await storage.getItem('userToken')
        return { Authorization: `Bearer ${token}` }
    }

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const headers = await authHeaders()
            const q = debouncedQuery
                ? `?q=${encodeURIComponent(debouncedQuery)}`
                : ''
            if (tab === 'foods') {
                const response = await axios.get(
                    getServerUrl(`/catalog/food-items${q}`),
                    { headers }
                )
                setItems(response.data.foodItems || [])
            } else {
                const response = await axios.get(
                    getServerUrl(`/catalog/meals${q}`),
                    { headers }
                )
                setItems(response.data.meals || [])
            }
        } catch (error) {
            console.error('Catalog load failed:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Katalogin lataus epäonnistui'
            )
        } finally {
            setLoading(false)
        }
    }, [tab, debouncedQuery])

    useFocusEffect(
        useCallback(() => {
            load()
        }, [load])
    )

    const copyItem = async (item) => {
        try {
            const headers = await authHeaders()
            const path =
                tab === 'foods'
                    ? `/catalog/food-items/${item._id}/copy`
                    : `/catalog/meals/${item._id}/copy`
            await axios.post(getServerUrl(path), {}, { headers })
            Alert.alert(
                'Lisätty',
                tab === 'foods'
                    ? 'Elintarvike kopioitiin omaan katalogiisi'
                    : 'Ateria kopioitiin omiin aterioihisi'
            )
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Kopiointi epäonnistui'
            )
        }
    }

    const openEdit = (item) => {
        setEditingItem(item)
        setEditName(item.name || '')
        setEditUnit(item.unit || '')
        setEditRecipe(item.recipe || '')
    }

    const saveEdit = async () => {
        if (!editingItem) return
        try {
            setSavingEdit(true)
            if (tab === 'foods') {
                await updateOpenCatalogFoodItem(editingItem._id, {
                    name: editName.trim(),
                    unit: editUnit.trim() || 'kpl',
                })
            } else {
                await updateOpenCatalogMeal(editingItem._id, {
                    name: editName.trim(),
                    recipe: editRecipe,
                })
            }
            setEditingItem(null)
            await load()
            Alert.alert('Tallennettu', 'Katalogikohde päivitetty')
        } catch (error) {
            Alert.alert(
                'Virhe',
                error?.response?.data?.message ||
                    error?.message ||
                    'Tallennus epäonnistui'
            )
        } finally {
            setSavingEdit(false)
        }
    }

    const deletePublished = async (item) => {
        try {
            const headers = await authHeaders()
            const path =
                tab === 'foods'
                    ? `/admin/catalog/food-items/${item._id}`
                    : `/admin/catalog/meals/${item._id}`
            await axios.delete(getServerUrl(path), { headers })
            await load()
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Poisto epäonnistui'
            )
        }
    }

    return (
        <ResponsiveLayout
            activeRoute="ProfileStack"
            contentBackgroundColor="#f9fafb"
        >
            <ScreenTabBar tabs={TABS} activeId={tab} onChange={setTab}>
                <ContentContainer>
                    <View
                        style={[
                            styles.page,
                            isTablet && styles.widePage,
                            isDesktop && styles.desktopPage,
                        ]}
                    >
                        <CustomText
                            style={[
                                styles.intro,
                                isDesktop && styles.desktopIntro,
                            ]}
                        >
                            {isAdmin
                                ? 'Selaa ja muokkaa avoimen katalogin tuotteita ja aterioita. Muut käyttäjät voivat kopioida ne omiin tietoihinsa.'
                                : 'Lisää ylläpitäjän jakamia tuotteita ja reseptejä omiin tietoihisi.'}
                        </CustomText>
                        <SearchSection
                            heading={
                                tab === 'foods'
                                    ? 'Etsi elintarvikkeita'
                                    : 'Etsi aterioita'
                            }
                            searchQuery={query}
                            onSearchChange={setQuery}
                            onClearSearch={() => setQuery('')}
                            placeholder="Etsi katalogista..."
                            showResultsInfo={query.length > 0}
                            resultsCount={items.length}
                            resultsText="Löytyi {count} kohdetta"
                            noResultsText="Kohteita ei löytynyt"
                        />
                        {loading ? (
                            <CustomText style={styles.emptyText}>
                                Ladataan…
                            </CustomText>
                        ) : (
                            <FlatList
                                data={items}
                                style={styles.list}
                                contentContainerStyle={styles.listContent}
                                keyExtractor={(item) => String(item._id)}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => {
                                    const actions = (
                                        <View style={styles.actions}>
                                            {isAdmin ? (
                                                <>
                                                    <Button
                                                        title="Muokkaa"
                                                        size="small"
                                                        type="SECONDARY"
                                                        onPress={() =>
                                                            openEdit(item)
                                                        }
                                                    />
                                                    <Button
                                                        title="Poista"
                                                        size="small"
                                                        type="TERTIARY"
                                                        onPress={() =>
                                                            deletePublished(
                                                                item
                                                            )
                                                        }
                                                    />
                                                </>
                                            ) : null}
                                            <Button
                                                title="Lisää omiin"
                                                size="small"
                                                type="SECONDARY"
                                                onPress={() => copyItem(item)}
                                            />
                                        </View>
                                    )

                                    if (tab === 'meals') {
                                        return (
                                            <MealItem
                                                item={item}
                                                trailing={actions}
                                            />
                                        )
                                    }

                                    return (
                                        <FoodListItemRow
                                            variant="card"
                                            item={item}
                                            style={WHITE_CARD}
                                            hideQuantityInDetails
                                            detail={
                                                (item.category || []).join(
                                                    ', '
                                                ) ||
                                                item.unit ||
                                                ''
                                            }
                                            trailingAction={actions}
                                        />
                                    )
                                }}
                                ListEmptyComponent={
                                    <CustomText style={styles.emptyText}>
                                        Ei julkaistuja kohteita
                                    </CustomText>
                                }
                            />
                        )}
                    </View>
                </ContentContainer>
            </ScreenTabBar>

            <Modal
                visible={Boolean(editingItem)}
                transparent
                animationType="fade"
                onRequestClose={() => setEditingItem(null)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <CustomText style={styles.modalTitle}>
                            Muokkaa katalogikohdetta
                        </CustomText>
                        <CustomText style={styles.modalLabel}>Nimi</CustomText>
                        <TextInput
                            style={styles.modalInput}
                            value={editName}
                            onChangeText={setEditName}
                        />
                        {tab === 'foods' ? (
                            <>
                                <CustomText style={styles.modalLabel}>
                                    Yksikkö
                                </CustomText>
                                <TextInput
                                    style={styles.modalInput}
                                    value={editUnit}
                                    onChangeText={setEditUnit}
                                />
                            </>
                        ) : (
                            <>
                                <CustomText style={styles.modalLabel}>
                                    Resepti
                                </CustomText>
                                <TextInput
                                    style={[
                                        styles.modalInput,
                                        styles.modalTextArea,
                                    ]}
                                    value={editRecipe}
                                    onChangeText={setEditRecipe}
                                    multiline
                                />
                            </>
                        )}
                        <View style={styles.modalActions}>
                            <Button
                                title="Peruuta"
                                type="TERTIARY"
                                onPress={() => setEditingItem(null)}
                            />
                            <Button
                                title={savingEdit ? 'Tallennetaan…' : 'Tallenna'}
                                onPress={saveEdit}
                                disabled={savingEdit || !editName.trim()}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </ResponsiveLayout>
    )
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 15,
        paddingTop: 24,
    },
    widePage: {
        paddingTop: 32,
    },
    desktopPage: {
        paddingHorizontal: 0,
    },
    intro: {
        fontSize: 17,
        textAlign: 'left',
        marginBottom: 20,
        maxWidth: '100%',
        color: '#333',
    },
    desktopIntro: {
        fontSize: 21,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    actions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'flex-end',
        maxWidth: 280,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: 20,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    modalLabel: {
        marginTop: 8,
        marginBottom: 4,
        color: '#555',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
    },
    modalTextArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 16,
    },
})

export default SharedCatalogScreen
