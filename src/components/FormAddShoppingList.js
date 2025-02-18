import React, { useState } from 'react'
import { StyleSheet, View, Modal, Alert, Platform } from 'react-native'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import CustomInput from './CustomInput'
import CustomText from './CustomText'
import Button from './Button'
import FoodItemForm from './FormFoodItem'
import storage from '../utils/storage'
import { getServerUrl } from '../utils/getServerUrl'

const FormAddShoppingList = ({ onSubmit, onClose }) => {
    const [showItemForm, setShowItemForm] = useState(false)
    const [items, setItems] = useState([])

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: '',
            description: '',
            totalEstimatedPrice: '',
        },
    })

    const handleAddItem = (itemData) => {
        const newItem = {
            ...itemData,
            location: 'shopping-list',
        }
        setItems([...items, newItem])
        setShowItemForm(false)
    }

    const handleSubmitForm = async (data) => {
        try {
            const token = await storage.getItem('userToken')
            console.log('Token for submit:', token)

            if (!token) {
                console.error('No token found')
                Alert.alert('Virhe', 'Kirjaudu sisään uudelleen')
                return
            }

            const shoppingListData = {
                ...data,
                items,
                totalEstimatedPrice: data.totalEstimatedPrice || 0,
            }

            console.log('Sending request with token:', token)
            console.log('Shopping list data:', shoppingListData)

            const response = await axios.post(
                getServerUrl('/shopping-lists'),
                shoppingListData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            console.log('Response:', response.data)

            if (response.data) {
                onSubmit(response.data)
                reset()
                setItems([])
                onClose()
            }
        } catch (error) {
            console.error(
                'Error creating shopping list:',
                error?.response?.data || error
            )
            if (error?.response?.status === 401) {
                Alert.alert('Virhe', 'Kirjaudu sisään uudelleen')
            } else {
                Alert.alert('Virhe', 'Ostoslistan luonti epäonnistui')
            }
        }
    }

    return (
        <View style={styles.form}>
            <CustomInput
                label="Ostoslistan nimi"
                name="name"
                placeholder="Kirjoita ostoslistan nimi"
                control={control}
                rules={{ required: 'Ostoslistan nimi on pakollinen' }}
            />
            {errors.name && (
                <CustomText style={styles.errorMsg}>
                    {errors.name.message}
                </CustomText>
            )}

            <CustomInput
                label="Kuvaus"
                name="description"
                placeholder="Kirjoita kuvaus"
                control={control}
            />

            <CustomInput
                label="Arvioitu kokonaishinta"
                name="totalEstimatedPrice"
                placeholder="Syötä arvioitu kokonaishinta"
                control={control}
                keyboardType="numeric"
            />

            <Button
                style={styles.secondaryButton}
                title="Lisää tuote"
                onPress={() => setShowItemForm(true)}
            />

            {items.length > 0 && (
                <View style={styles.itemsList}>
                    <CustomText style={styles.subtitle}>
                        Lisätyt tuotteet:
                    </CustomText>
                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <CustomText>
                                {item.name} - {item.quantity} {item.unit} -{' '}
                                {item.estimatedPrice}€
                            </CustomText>
                        </View>
                    ))}
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={showItemForm}
                onRequestClose={() => setShowItemForm(false)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <CustomText style={styles.modalTitle}>
                            Lisää tuote ostoslistaan
                        </CustomText>
                        <FoodItemForm
                            onSubmit={handleAddItem}
                            location="shopping-list"
                        />
                        <Button
                            style={styles.secondaryButton}
                            title="Peruuta"
                            onPress={() => setShowItemForm(false)}
                        />
                    </View>
                </View>
            </Modal>

            <Button
                style={styles.primaryButton}
                title="Tallenna lista"
                onPress={handleSubmit(handleSubmitForm)}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    form: {
        width: '100%',
    },
    itemsList: {
        marginTop: 10,
    },
    itemRow: {
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalView: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
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
        width: '100%',
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
        width: '100%',
        marginBottom: 10,
    },
    errorMsg: {
        color: 'red',
        marginTop: -5,
    },
})

export default FormAddShoppingList
