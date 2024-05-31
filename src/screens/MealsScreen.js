import React, { useState } from 'react'
import { Alert, Modal, StyleSheet, View, Text, Pressable } from 'react-native'
import { useForm } from 'react-hook-form'
import AddMealForm from '../components/formAddMeal'

const MealsScreen = ({}) => {
    const [modalVisible, setModalVisible] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const Submit = (data) => {
        // Handle submit codes here
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
                            Luo ateria oheisella lomakkeella
                        </Text>
                        <form onSubmit={handleSubmit(Submit)}>
                            {/* "handleSubmit" will validate your inputs before invoking "Submit"
                        function */}
                            <AddMealForm register={register} />
                        </form>
                        <Pressable
                            type="submit"
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>
                                Tallenna ateria
                            </Text>
                        </Pressable>
                        {/* <button type="submit">Tallenna ateria</button> */}
                    </View>
                </View>
            </Modal>
            <Text style={styles.introText}>
                Täällä voit lisätä, suunnitella ja selata aterioita.
            </Text>
            <Pressable
                style={[styles.button, styles.buttonOpen]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.textStyle}>Lisää uusi ateria</Text>
            </Pressable>
        </View>
    )
}

export default MealsScreen

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
    button: {
        borderRadius: 25,
        padding: 15,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: '#B283EC',
    },
    buttonClose: {
        backgroundColor: '#B283EC',
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
