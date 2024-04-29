import React, { useState } from 'react'
import {
    Alert,
    Modal,
    StyleSheet,
    View,
    Text,
    Pressable,
    TextInput,
} from 'react-native'
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
            firstName: '',
            lastName: '',
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
                            <Text style={styles.label}>First name</Text>
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
                                name="firstName"
                            />
                            {errors.firstName && <Text>This is required.</Text>}
                            <Text style={styles.label}>Last name</Text>
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
                                name="lastName"
                            />
                            {errors.lastName && <Text>This is required.</Text>}
                        </View>
                        <Button
                            title="Submit"
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
            <Pressable
                style={[styles.button, styles.buttonOpen]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.textStyle}>Lisää elintarvike</Text>
            </Pressable>
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
    formInput: {
        backgroundColor: 'white',
        borderColor: 'black',
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 10,
    },
    button: {
        borderRadius: 25,
        padding: 15,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#FFC121',
    },
    buttonClose: {
        backgroundColor: '#FFC121',
    },
    textStyle: {
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
})
