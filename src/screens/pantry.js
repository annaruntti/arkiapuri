import React, { useState } from 'react'
import { Alert, Modal, StyleSheet, View, Text, TextInput } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import Button from '../components/Button'

const PantryScreen = ({}) => {
    const [modalVisible, setModalVisible] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            foodName: '',
            foodType: '',
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
                                        placeholder=""
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                                name="foodName"
                            />
                            {errors.foodName && (
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
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder=""
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                                name="foodType"
                            />
                            {errors.foodType && (
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
