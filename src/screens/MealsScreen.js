import React, { useState } from 'react'
import { Alert, Modal, StyleSheet, View, Text } from 'react-native'
import { useForm } from 'react-hook-form'
import AddMealForm from '../components/formAddMeal'
import Button from '../components/Button'
import CustomText from '../components/CustomText'

const MealsScreen = ({}) => {
    const [modalVisible, setModalVisible] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm()

    console.log(errors, 'errors')

    const onSubmit = (data) => {
        console.log(data, 'data')
        // validate user
        setModalVisible(!modalVisible)
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
                        <CustomText style={styles.introText}>
                            Luo ateria oheisella lomakkeella
                        </CustomText>
                        <AddMealForm control={control} />
                        <Button
                            style={styles.primaryButton}
                            title="Tallenna"
                            onPress={handleSubmit(onSubmit)}
                        />
                    </View>
                </View>
            </Modal>
            <CustomText style={styles.introText}>
                Selaa tallennettuja aterioita ja luo uusia aterioita. Voit
                lisätä atrerioihin tarvittavat ainesosat aterian luonnin
                yhteydessä ostoslistallesi. Näet myös aterian luonnin
                yhteydessä, löytyykö tuote pentteristäsi.
            </CustomText>
            <Button
                style={styles.primaryButton}
                title="Lisää uusi ateria"
                onPress={() => setModalVisible(true)}
            />
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
        minWidth: 150,
    },
})
