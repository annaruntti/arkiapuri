import * as React from 'react'
import { useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import Button from '../components/Button'
import { useApolloClient, useMutation } from '@apollo/client'
import CustomText from '../components/CustomText'

const AddFood = (props) => {
    // apollo client instance
    const client = useApolloClient()
    // local states
    const [title, setTitle] = useState()
    const [description, setDescription] = useState()
    const [expirationDate, setexpirationDate] = useState()
    const [foodId, setFoodId] = useState()

    //hook to add a new food
    const [createFood, { data, loading, error }] = useMutation(ADD_NEW_FOOD)

    return (
        <View style={styles.container}>
            <CustomText style={styles.introText}>
                Täällä voit lisätä listaan uusia elintarvikkeita.
            </CustomText>
            <Button
                title="Lisää uusi elintarvike"
                onPress={async () => {
                    createFood({
                        variables: {
                            title: title,
                            description: description,
                            expirationDate: parseInt(expirationDate),
                            foodId: foodId,
                        },
                    })
                }}
            />
        </View>
    )
}

export default AddFood

const styles = StyleSheet.create({
    homeView: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    introText: {
        fontSize: 20,
        textAlign: 'center',
        paddingVertical: 20,
        marginBottom: 10,
    },
    header: {
        minHeight: 400,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
    layer: {
        backgroundColor: 'rgba(248, 247, 216, 0.7)',
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: 300,
    },
})
