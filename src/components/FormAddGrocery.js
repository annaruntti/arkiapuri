import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from 'react-native'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import SectionedMultiSelect from 'react-native-sectioned-multi-select'
import { MaterialIcons as Icon } from '@expo/vector-icons'
import Fontisto from '@expo/vector-icons/Fontisto'
import DateTimePicker from '@react-native-community/datetimepicker'

import categories from '../data/categories'
import CustomText from './CustomText'

const FormAddGrocery = (props) => {
    const [date, setDate] = useState(new Date())
    const [show, setShow] = useState(false)
    const [mode, setMode] = useState('date')

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date
        setShow(false)
        setDate(currentDate)
    }

    const showDatepicker = () => {
        setShow(true)
        setMode('date')
    }

    return (
        <View style={styles.form}>
            <CustomText style={styles.label}>Elintarvikkeen nimi</CustomText>
            <Controller
                control={props.control}
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
                name="groceryName"
                {...props.register('groceryName')}
            />
            {props.errors.groceryName && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </CustomText>
                </View>
            )}
            <CustomText style={styles.label}>Elintarvikkeen tyyppi</CustomText>
            <Controller
                control={props.control}
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
                name="groceryType"
                {...props.register('groceryType')}
            />
            {props.errors.groceryType && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </CustomText>
                </View>
            )}
            <CustomText style={styles.label}>Kappalemäärä</CustomText>
            <Controller
                control={props.control}
                rules={{
                    maxLength: 3,
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
                        <CustomText style={styles.inputMetric}>Kpl</CustomText>
                    </View>
                )}
                name="groceryNumber"
                {...props.register('groceryNumber')}
            />
            {props.errors.groceryPrice && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Täytä kappalemäärä numerona. Syötä vähintään 1.
                    </CustomText>
                </View>
            )}
            <CustomText style={styles.label}>Arvioitu hinta</CustomText>
            <Controller
                control={props.control}
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
                        <CustomText style={styles.inputMetric}>€</CustomText>
                    </View>
                )}
                name="groceryPrice"
                {...props.register('groceryPrice')}
            />
            {props.errors.groceryPrice && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Täytä arvioitu hinta numerona. Syötä vähintään 1 ja
                        maksimissaan 4 lukua.
                    </CustomText>
                </View>
            )}
            <CustomText style={styles.label}>
                Aseta tuotteen viimeinen käyttöpäivä
            </CustomText>
            <Controller
                control={props.control}
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
                                    onChange(selectedDate)
                                    setDate(selectedDate)
                                    setShow(false)
                                }}
                            />
                        )}
                    </View>
                )}
                name="expiryDate"
                {...props.register('expiryDate')}
            />
            {props.errors.expiryDate && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <CustomText style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </CustomText>
                </View>
            )}
        </View>
    )
}

export default FormAddGrocery

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
})
