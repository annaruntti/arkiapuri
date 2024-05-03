import React, { useState } from 'react'
import { Alert, Modal, StyleSheet, View, Text, TextInput } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import SectionedMultiSelect from 'react-native-sectioned-multi-select'
import { MaterialIcons as Icon } from '@expo/vector-icons'
import Button from '../components/Button'

const items = [
    { name: 'Kasviproteiinit', id: 1 },
    { name: 'Kala', id: 2 },
    { name: 'Liha', id: 3 },
    { name: 'Kasvikset', id: 4 },
    { name: 'Kuiva-aineet', id: 5 },
    { name: 'Valmisateriat', id: 6 },
    { name: 'Pakasteet', id: 7 },
    { name: 'Ruoanlaittovälineet', id: 8 },
    { name: 'Tarvikkeet', id: 9 },
    { name: 'Gluteeniton', id: 10 },
    { name: 'Maidoton', id: 11 },
    { name: 'Laktoositon', id: 12 },
    { name: 'Munaton', id: 13 },
    { name: 'Kasvisruoka', id: 14 },
    { name: 'Vegaaninen', id: 15 },
    { name: 'Vähähiilihydraattinen', id: 16 },
    { name: 'Juomat', id: 17 },
]

const PantryScreen = ({}) => {
    const [modalVisible, setModalVisible] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            groceryName: '',
            groceryType: [],
        },
    })
    const onSubmit = (data) => {
        setModalVisible(!modalVisible)
        console.log(data)
    }

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
                        <Text style={styles.introText}>
                            Lisää ruokakomeroosi elintarvikkeita oheisella
                            lomakkeella.
                        </Text>
                        <View style={styles.form}>
                            <Text style={styles.label}>
                                Elintarvikkeen nimi
                            </Text>
                            <Controller
                                control={control}
                                rules={{
                                    required: true,
                                }}
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder="Esim. leivinpaperi"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                                name="groceryName"
                            />
                            {errors.groceryName && (
                                <Text style={styles.errorMsg}>
                                    This is required.
                                </Text>
                            )}
                            <Text style={styles.label}>
                                Elintarvikkeen tyyppi
                            </Text>
                            <Controller
                                control={control}
                                rules={{
                                    maxLength: 100,
                                    required: true,
                                }}
                                render={({ field: { value, onChange } }) => (
                                    <SectionedMultiSelect
                                        items={items}
                                        IconRenderer={Icon}
                                        uniqueKey="id"
                                        onSelectedItemsChange={onChange}
                                        selectedItems={value}
                                    />
                                )}
                                name="groceryType"
                            />
                            {errors.groceryType && (
                                <Text style={styles.errorMsg}>
                                    This is required.
                                </Text>
                            )}
                        </View>
                        <Button
                            style={styles.button}
                            title="Tallenna"
                            onPress={handleSubmit(onSubmit)}
                        />
                    </View>
                </View>
            </Modal>
            <Text style={styles.introText}>
                Täällä voit lisätä ja selata elintarvikkeita, joita kotoasi jo
                löytyy ja käyttää niitä avuksi ateriasuunnittelussa ja
                ostoslistan luonnissa.
            </Text>
            <Button
                style={styles.button}
                title="Lisää elintarvike"
                onPress={() => setModalVisible(true)}
            />
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
        padding: 35,
    },
    introText: {
        fontSize: 25,
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
    button: {
        borderRadius: 25,
        padding: 7,
        elevation: 2,
        backgroundColor: '#FFC121',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    errorMsg: {
        color: 'red',
    },
})
