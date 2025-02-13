import React, { useState } from 'react'
import { StyleSheet, View, TextInput } from 'react-native'
import CustomInput from './CustomInput'
import CustomText from './CustomText'
import Button from './Button'

const FormAddShoppingList = ({ register, control, errors }) => {
    const [items, setItems] = useState([])
    const [currentItem, setCurrentItem] = useState({
        name: '',
        quantity: '',
        estimatedPrice: '',
    })

    const addItem = () => {
        if (currentItem.name) {
            setItems([...items, currentItem])
            setCurrentItem({ name: '', quantity: '', estimatedPrice: '' })
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

            {/* Item input section */}
            <CustomText style={styles.label}>Lisää tuotteita</CustomText>
            <View style={styles.itemInputContainer}>
                <CustomText style={styles.label}>Tuotteen nimi</CustomText>
                <TextInput
                    style={styles.input}
                    value={currentItem.name}
                    onChangeText={(text) =>
                        setCurrentItem({ ...currentItem, name: text })
                    }
                    placeholder="Syötä tuotteen nimi"
                />

                <CustomText style={styles.label}>Määrä</CustomText>
                <TextInput
                    style={styles.input}
                    value={currentItem.quantity}
                    onChangeText={(text) =>
                        setCurrentItem({ ...currentItem, quantity: text })
                    }
                    placeholder="Syötä määrä"
                    keyboardType="numeric"
                />

                <CustomText style={styles.label}>Arvioitu hinta</CustomText>
                <TextInput
                    style={styles.input}
                    value={currentItem.estimatedPrice}
                    onChangeText={(text) =>
                        setCurrentItem({ ...currentItem, estimatedPrice: text })
                    }
                    placeholder="Syötä arvioitu hinta"
                    keyboardType="numeric"
                />
            </View>

            <Button
                style={styles.secondaryButton}
                title="Lisää tuote"
                onPress={addItem}
            />

            {/* Display added items */}
            {items.length > 0 && (
                <View>
                    <CustomText style={styles.label}>
                        Lisätyt tuotteet:
                    </CustomText>
                    {items.map((item, index) => (
                        <CustomText key={index}>
                            {item.name} - {item.quantity} kpl -{' '}
                            {item.estimatedPrice}€
                        </CustomText>
                    ))}
                </View>
            )}
        </View>
    )
}

export default FormAddShoppingList

const styles = StyleSheet.create({
    form: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        marginTop: 10,
        marginBottom: 5,
    },
    errorMsg: {
        color: 'red',
    },
    input: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 8,
        width: '100%',
    },
    itemInputContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#E0E0E0',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
        minWidth: 50,
        marginTop: 10,
    },
})
