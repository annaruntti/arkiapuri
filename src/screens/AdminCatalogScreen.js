import { useCallback, useState } from 'react'
import {
    Alert,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import axios from 'axios'
import CustomText from '../components/CustomText'
import Button from '../components/Button'
import ResponsiveLayout from '../components/ResponsiveLayout'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

const tabs = [
    { id: 'foods', label: 'Elintarvikkeet' },
    { id: 'meals', label: 'Ateriat' },
    { id: 'published', label: 'Julkaistut' },
]

const AdminCatalogScreen = () => {
    const [tab, setTab] = useState('foods')
    const [query, setQuery] = useState('')
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(false)

    const authHeaders = async () => {
        const token = await storage.getItem('userToken')
        return { Authorization: `Bearer ${token}` }
    }

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const headers = await authHeaders()
            const q = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''
            let response
            if (tab === 'foods') {
                response = await axios.get(
                    getServerUrl(`/admin/food-items${q}`),
                    { headers }
                )
                setItems(response.data.foodItems || [])
            } else if (tab === 'meals') {
                response = await axios.get(getServerUrl(`/admin/meals${q}`), {
                    headers,
                })
                setItems(response.data.meals || [])
            } else {
                const [foods, meals] = await Promise.all([
                    axios.get(getServerUrl(`/catalog/food-items${q}`), {
                        headers,
                    }),
                    axios.get(getServerUrl(`/catalog/meals${q}`), { headers }),
                ])
                setItems([
                    ...(foods.data.foodItems || []).map((item) => ({
                        ...item,
                        _kind: 'food',
                    })),
                    ...(meals.data.meals || []).map((item) => ({
                        ...item,
                        _kind: 'meal',
                    })),
                ])
            }
        } catch (error) {
            console.error('Admin catalog load failed:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Tietojen lataus epäonnistui'
            )
        } finally {
            setLoading(false)
        }
    }, [tab, query])

    useFocusEffect(
        useCallback(() => {
            load()
        }, [load])
    )

    const publishFood = async (foodItemId) => {
        try {
            const headers = await authHeaders()
            await axios.post(
                getServerUrl('/admin/catalog/food-items'),
                { foodItemId },
                { headers }
            )
            Alert.alert('Julkaistu', 'Elintarvike lisättiin avoimeen katalogiin')
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Julkaisu epäonnistui'
            )
        }
    }

    const publishMeal = async (mealId) => {
        try {
            const headers = await authHeaders()
            await axios.post(
                getServerUrl('/admin/catalog/meals'),
                { mealId },
                { headers }
            )
            Alert.alert('Julkaistu', 'Ateria lisättiin avoimeen katalogiin')
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Julkaisu epäonnistui'
            )
        }
    }

    const unpublish = async (item) => {
        try {
            const headers = await authHeaders()
            const path =
                item._kind === 'meal'
                    ? `/admin/catalog/meals/${item._id}`
                    : `/admin/catalog/food-items/${item._id}`
            await axios.delete(getServerUrl(path), { headers })
            Alert.alert('Poistettu', 'Kohde poistettiin katalogista')
            load()
        } catch (error) {
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Poisto epäonnistui'
            )
        }
    }

    const renderItem = ({ item }) => {
        if (tab === 'published') {
            return (
                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <CustomText style={styles.name}>{item.name}</CustomText>
                        <CustomText style={styles.meta}>
                            {item._kind === 'meal' ? 'Ateria' : 'Elintarvike'}
                        </CustomText>
                    </View>
                    <Button
                        title="Poista"
                        type="TERTIARY"
                        onPress={() => unpublish(item)}
                    />
                </View>
            )
        }

        if (tab === 'meals') {
            return (
                <View style={styles.row}>
                    <CustomText style={styles.name}>{item.name}</CustomText>
                    <Button
                        title="Julkaise"
                        onPress={() => publishMeal(item._id)}
                    />
                </View>
            )
        }

        return (
            <View style={styles.row}>
                <View style={styles.rowText}>
                    <CustomText style={styles.name}>{item.name}</CustomText>
                    <CustomText style={styles.meta}>
                        {(item.category || []).join(', ') || item.unit || ''}
                    </CustomText>
                </View>
                <Button
                    title="Julkaise"
                    onPress={() => publishFood(item._id)}
                />
            </View>
        )
    }

    return (
        <ResponsiveLayout>
            <View style={styles.container}>
                <CustomText style={styles.title}>Ylläpito</CustomText>
                <CustomText style={styles.subtitle}>
                    Julkaise tuotteita ja aterioita kaikkien käyttäjien
                    katalogiin.
                </CustomText>

                <View style={styles.tabs}>
                    {tabs.map((entry) => (
                        <TouchableOpacity
                            key={entry.id}
                            style={[
                                styles.tab,
                                tab === entry.id && styles.tabActive,
                            ]}
                            onPress={() => setTab(entry.id)}
                        >
                            <CustomText
                                style={[
                                    styles.tabText,
                                    tab === entry.id && styles.tabTextActive,
                                ]}
                            >
                                {entry.label}
                            </CustomText>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    style={styles.search}
                    placeholder="Haku…"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={load}
                    returnKeyType="search"
                />
                <Button title="Hae" onPress={load} style={styles.searchBtn} />

                {loading ? (
                    <CustomText style={styles.meta}>Ladataan…</CustomText>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) =>
                            `${item._kind || tab}-${item._id}`
                        }
                        renderItem={renderItem}
                        ListEmptyComponent={
                            <CustomText style={styles.meta}>
                                Ei tuloksia
                            </CustomText>
                        }
                    />
                )}
            </View>
        </ResponsiveLayout>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
    subtitle: { color: '#666', marginBottom: 12 },
    tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
    },
    tabActive: { backgroundColor: '#5844BB' },
    tabText: { color: '#333' },
    tabTextActive: { color: '#fff', fontWeight: '600' },
    search: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    searchBtn: { marginBottom: 12 },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        gap: 8,
    },
    rowText: { flex: 1 },
    name: { fontSize: 16, fontWeight: '600' },
    meta: { color: '#6b7280', marginTop: 2 },
})

export default AdminCatalogScreen
