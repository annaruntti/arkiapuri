import React, { useState } from 'react'
import {
    StyleSheet,
    ScrollView,
    View,
    TextInput,
    TouchableOpacity,
} from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import SectionedMultiSelect from 'react-native-sectioned-multi-select'
import { MaterialIcons as Icon } from '@expo/vector-icons'
import Fontisto from '@expo/vector-icons/Fontisto'
import DateTimePicker from '@react-native-community/datetimepicker'

import categories from '../data/categories'
import CustomText from './CustomText'
import Button from './Button'

const FoodItemForm = ({ onSubmit, location = 'shopping-list' }) => {
    const [date, setDate] = useState(new Date())
    const [show, setShow] = useState(false)
    const [mode, setMode] = useState('date')

    const {
        control,
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: '',
            category: [],
            quantity: '',
            price: '',
            expirationDate: new Date(),
            location: location,
            unit: '',
            calories: '',
        },
    })

    const showDatepicker = () => {
        setShow(true)
        setMode('date')
    }

    const handleFormSubmit = (data) => {
        onSubmit(data)
        reset()
    }

    return (
        <ScrollView style={styles.form}>
            <CustomText style={styles.label}>Elintarvikkeen nimi</CustomText>
            <Controller
                control={control}
                rules={{
                    required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={styles.formInput}
                        placeholder="Esim. leivinpaperi"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
                name="name"
                {...register('name')}
            />
            {errors.name && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </CustomText>
                </View>
            )}

            <CustomText style={styles.label}>Elintarvikkeen tyyppi</CustomText>
            <Controller
                control={control}
                rules={{
                    maxLength: 100,
                    required: true,
                }}
                render={({ field: { value, onChange } }) => (
                    <SectionedMultiSelect
                        styles={{
                            backdrop: styles.multiSelectBackdrop,
                            selectToggle: styles.multiSelectBox,
                            button: styles.primaryButton,
                            confirmText: styles.primaryButtonText,
                            cancelButton: styles.cancelButton,
                            cancelButtonText: styles.cancelButtonText,
                        }}
                        items={categories}
                        IconRenderer={Icon}
                        uniqueKey="id"
                        displayKey="name"
                        onSelectedItemsChange={onChange}
                        selectedItems={value}
                        removeAllText="Poista kaikki"
                        showCancelButton={true}
                        showRemoveAll={true}
                        searchPlaceholderText="Etsi kategoriaa"
                        confirmText="Tallenna kategoriat"
                        selectText="Valitse yksi tai useampi kategoria"
                    />
                )}
                name="category"
                {...register('category')}
            />
            {errors.category && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </CustomText>
                </View>
            )}

            <CustomText style={styles.label}>Kappalemäärä</CustomText>
            <View style={styles.quantityContainer}>
                <Controller
                    control={control}
                    rules={{
                        required: true,
                        valueAsNumber: true,
                        pattern: {
                            value: /^(0|[1-9]\d*)(\.\d+)?$/,
                        },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[styles.formInput, styles.quantityInput]}
                            placeholder="Esim. 4"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            keyboardType="numeric"
                        />
                    )}
                    name="quantity"
                    {...register('quantity')}
                />

                <Controller
                    control={control}
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={[styles.formInput, styles.unitInput]}
                            placeholder="kpl/kg/l"
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                    name="unit"
                    {...register('unit')}
                />
            </View>
            {(errors.quantity || errors.unit) && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Määrä ja yksikkö ovat pakollisia tietoja
                    </CustomText>
                </View>
            )}

            <CustomText style={styles.label}>
                Kalorit (per 100g/100ml)
            </CustomText>
            <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputAndIcon}>
                        <TextInput
                            style={styles.formInput}
                            placeholder="Esim. 250"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                            keyboardType="numeric"
                        />
                        <CustomText style={styles.inputMetric}>kcal</CustomText>
                    </View>
                )}
                name="calories"
            />

            {location === 'shopping-list' && (
                <>
                    <CustomText style={styles.label}>Arvioitu hinta</CustomText>
                    <Controller
                        control={control}
                        rules={{
                            maxLength: 4,
                            valueAsNumber: true,
                            pattern: {
                                value: /^(0|[1-9]\d*)(\.\d+)?$/,
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={styles.inputAndIcon}>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="Esim. 4"
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    value={value}
                                    keyboardType="numeric"
                                />
                                <CustomText style={styles.inputMetric}>
                                    €
                                </CustomText>
                            </View>
                        )}
                        name="price"
                        {...register('price')}
                    />
                    {errors.price && (
                        <View style={styles.messageSection}>
                            <Icon name="error" color="red" size={14} />
                            <CustomText style={styles.errorMsg}>
                                Täytä arvioitu hinta numerona. Syötä vähintään 1
                                ja maksimissaan 4 lukua.
                            </CustomText>
                        </View>
                    )}
                </>
            )}

            <CustomText style={styles.label}>Viimeinen käyttöpäivä</CustomText>
            <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                    <View style={styles.inputAndIcon}>
                        <TouchableOpacity onPress={showDatepicker}>
                            <TextInput
                                style={styles.formInput}
                                value={date.toLocaleDateString()}
                                editable={false}
                            />
                        </TouchableOpacity>
                        <CustomText style={styles.inputMetric}>
                            <Fontisto name="date" size={24} color="black" />
                        </CustomText>
                        {show && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={date}
                                mode={mode}
                                display="default"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        onChange(selectedDate)
                                        setDate(selectedDate)
                                    }
                                    setShow(false)
                                }}
                            />
                        )}
                    </View>
                )}
                name="expirationDate"
                {...register('expirationDate')}
            />
            {errors.expirationDate && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </CustomText>
                </View>
            )}

            <Button
                style={styles.primaryButton}
                title="Tallenna tuote"
                onPress={handleSubmit(handleFormSubmit)}
            />
        </ScrollView>
    )
}

export default FoodItemForm

const styles = StyleSheet.create({
    form: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        marginTop: 10,
        marginBottom: 5,
    },
    formInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 5,
    },
    inputAndIcon: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'left',
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    messageSection: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'left',
        backgroundColor: '#fff',
    },
    inputMetric: {
        padding: 10,
        fontSize: 20,
    },
    primaryButton: {
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
        marginVertical: 10,
    },
    primaryButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    cancelButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    errorMsg: {
        color: 'red',
        marginLeft: 5,
    },
    multiSelectBackdrop: {
        backgroundColor: 'rgba(255, 183, 0, 0.2)',
    },
    multiSelectBox: {
        borderWidth: 1,
        borderRadius: 4,
        borderColor: '#bbb',
        padding: 10,
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    quantityInput: {
        flex: 2,
        marginRight: 10,
    },
    unitInput: {
        flex: 1,
        width: '100%',
    },
})
