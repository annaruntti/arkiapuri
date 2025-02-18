import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { useForm } from 'react-hook-form'

import CustomInput from '../components/CustomInput'
import Button from '../components/Button'
import CustomText from '../components/CustomText'

const ConfirmEmailScreen = () => {
    const { control, handleSubmit } = useForm()

    const navigation = useNavigation()

    const onConfirmPressed = (data) => {
        console.log(data, 'data')
        navigation.navigate('Arkiapuri')
    }

    const onSignInPress = () => {
        navigation.navigate('Kirjaudu siään')
    }

    const onResendPress = () => {
        console.warn('onResendPress')
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.root}>
                <View style={styles.header}>
                    <CustomText style={styles.headerTitle}>
                        Vahvista sähköposti
                    </CustomText>
                </View>
                <CustomInput
                    label="Vahvistuskoodi"
                    name="code"
                    control={control}
                    placeholder="Kirjoita vahvistuskoodisi"
                    rules={{
                        required: 'Syötä sähköpostiisi saama vahvistuskoodi',
                    }}
                />
                <View style={styles.buttonView}>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Confirm"
                            style={styles.primaryButton}
                            onPress={handleSubmit(onConfirmPressed)}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Resend code"
                            onPress={onResendPress}
                            type="SECONDARY"
                            style={styles.secondaryButton}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Takaisin kirjautumiseen"
                            onPress={onSignInPress}
                            type="TERTIARY"
                            style={styles.tertiaryButton}
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    root: {
        alignItems: 'left',
        padding: 20,
    },
    header: {
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    logo: {
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
    },
    link: {
        color: '#FDB075',
    },
    buttonView: {
        paddingVertical: 10,
    },
    buttonContainer: {
        marginBottom: 10,
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
})

export default ConfirmEmailScreen
