import React, { useState, useEffect } from 'react'
import { Alert, Modal, StyleSheet, View, Text, FlatList } from 'react-native'
import { useForm } from 'react-hook-form'
import Button from '../components/Button'
import FormAddGrocery from '../components/FormAddGrocery'
import CustomText from '../components/CustomText'
import axios from 'axios'
import { getServerUrl } from '../utils/getServerUrl'
import storage from '../utils/storage'

const PantryScreen = ({}) => {
    const [modalVisible, setModalVisible] = useState(false)
    const [pantryItems, setPantryItems] = useState([])
    const [loading, setLoading] = useState(true)

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            groceryName: '',
            groceryType: [],
            groceryPrice: '',
            groceryNumber: '',
            expiryDate: '',
        },
    })

    const fetchPantryItems = async () => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')
            const response = await axios.get(getServerUrl('/pantry'), {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            console.log('Pantry response:', response.data)

            if (response.data.success) {
                const items = response.data.pantry.items || []
                console.log('Pantry items:', items)
                setPantryItems(items)
            } else {
                console.error(
                    'Failed to fetch pantry items:',
                    response.data.message
                )
                Alert.alert('Virhe', 'Ruokakomeron haku epäonnistui')
                setPantryItems([])
            }
        } catch (error) {
            console.error(
                'Error fetching pantry items:',
                error?.response?.data || error
            )
            Alert.alert('Virhe', 'Ruokakomeron haku epäonnistui')
            setPantryItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPantryItems()
    }, [])

    const onSubmit = async (data) => {
        try {
            setModalVisible(false)
            await fetchPantryItems()
        } catch (error) {
            Alert.alert('Virhe', 'Tuotteen lisääminen epäonnistui')
        }
    }

    const renderPantryItem = ({ item }) => (
        <View style={styles.listItem}>
            <View style={styles.listHeader}>
                <CustomText style={styles.listTitle}>{item.name}</CustomText>
                <View style={styles.itemCategories}>
                    {item.categories?.map((category, index) => (
                        <CustomText key={index} style={styles.category}>
                            {category}
                        </CustomText>
                    ))}
                </View>
            </View>
            <View style={styles.listStats}>
                <CustomText>
                    {item.quantity} {item.unit}
                </CustomText>
                <CustomText>
                    {item.calories ? `${item.calories} kcal/100g` : ''}
                </CustomText>
            </View>
            <CustomText style={styles.expirationDate}>
                Parasta ennen:{' '}
                {new Date(item.expirationDate).toLocaleDateString()}
            </CustomText>
        </View>
    )

    console.log('Current pantryItems state:', pantryItems)

    return (
        <View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                overFullScreen={true}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.')
                    setModalVisible(!modalVisible)
                }}
            >
                <View style={styles.layerView}>
                    <View style={styles.modalView}>
                        <CustomText style={styles.introText}>
                            Lisää pentteriin elintarvikkeita oheisella
                            lomakkeella.
                        </CustomText>
                        <FormAddGrocery
                            register={register}
                            control={control}
                            errors={errors}
                        />
                        <Button
                            style={styles.primaryButton}
                            title="Tallenna"
                            onPress={handleSubmit(onSubmit)}
                        />
                    </View>
                </View>
            </Modal>
            <CustomText style={styles.introText}>
                Selaa pentteriäsi eli ruokakomeroasi joita kotoasi jo löytyy ja
                käyttä niitä avuksi ateriasuunnittelussa ja ostoslistan
                luonnissa. Voit myös lisätä täällä uusia elintarvikkeita
                pentteriisi. Ostoslistan tuotteet lisätään automaattisesti
                pentteriin
            </CustomText>
            <Button
                style={styles.primaryButton}
                title="Lisää elintarvike"
                onPress={() => setModalVisible(true)}
            />
            {loading ? (
                <CustomText>Ladataan...</CustomText>
            ) : Array.isArray(pantryItems) && pantryItems.length > 0 ? (
                <FlatList
                    style={styles.listContainer}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    data={pantryItems}
                    renderItem={renderPantryItem}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <CustomText style={styles.emptyText}>
                    Ei vielä tuotteita ruokakomerossa. Lisää tuotteita
                    painamalla "Lisää tuote" -nappia.
                </CustomText>
            )}
        </View>
    )
}

export default PantryScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    introText: {
        fontSize: 17,
        textAlign: 'center',
        padding: 20,
        marginBottom: 10,
    },
    layerView: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    form: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        marginTop: 10,
    },
    formInput: {
        backgroundColor: 'white',
        borderColor: 'black',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
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
        backgroundColor: '#FACE67',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
    tertiaryButton: {
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
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    errorMsg: {
        color: 'red',
    },
    listItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    listHeader: {
        marginBottom: 10,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    itemCategories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
        marginTop: 5,
    },
    category: {
        backgroundColor: '#e0e0e0',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 12,
        fontSize: 12,
    },
    expirationDate: {
        color: '#666',
        fontSize: 14,
    },
    listContainer: {
        width: '100%',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
})
