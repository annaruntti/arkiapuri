import React, { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import CustomText from '../components/CustomText'
import Button from '../components/Button'
import ContentContainer from '../components/ContentContainer'
import ListItem from '../components/ListItem'
import ResponsiveLayout from '../components/ResponsiveLayout'
import ScreenTabBar from '../components/ScreenTabBar'
import SearchSection from '../components/SearchSection'
import { getServerUrl } from '../utils/getServerUrl'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

const TABS = [
    { id: 'foods', label: 'Elintarvikkeet' },
    { id: 'meals', label: 'Ateriat' },
]

const SharedCatalogScreen = () => {
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const [tab, setTab] = useState('foods')
    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

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
                            Lisää ylläpitäjän jakamia tuotteita ja reseptejä
                            omiin tietoihisi.
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
                                renderItem={({ item }) => (
                                    <ListItem
                                        title={item.name}
                                        subtitle={
                                            tab === 'foods'
                                                ? (item.category || []).join(
                                                      ', '
                                                  ) ||
                                                  item.unit ||
                                                  ''
                                                : ''
                                        }
                                        trailing={
                                            <Button
                                                title="Lisää omiin"
                                                size="small"
                                                type="SECONDARY"
                                                onPress={() => copyItem(item)}
                                            />
                                        }
                                    />
                                )}
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
})

export default SharedCatalogScreen
