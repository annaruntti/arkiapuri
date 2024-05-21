import {
    StyleSheet,
    View,
    Text,
    TextInput,
    SafeAreaView,
    Button,
} from 'react-native'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import SectionedMultiSelect from 'react-native-sectioned-multi-select'
import { MaterialIcons as Icon } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

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

const FormAddGrocery = (props) => {
    const [date, setDate] = useState(new Date(1598051730000))
    const [mode, setMode] = useState('date')
    const [show, setShow] = useState(false)

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate
        setShow(false)
        setDate(currentDate)
    }

    const showMode = (currentMode) => {
        setShow(true)
        setMode(currentMode)
    }

    const showDatepicker = () => {
        showMode('date')
    }

    return (
        <View style={styles.form}>
            <Text style={styles.label}>Elintarvikkeen nimi</Text>
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
                    <Text style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </Text>
                </View>
            )}
            <Text style={styles.label}>Elintarvikkeen tyyppi</Text>
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
                        }}
                        items={items}
                        IconRenderer={Icon}
                        uniqueKey="id"
                        displayKey="name"
                        onSelectedItemsChange={onChange}
                        selectedItems={value}
                        removeAllText="Clear all"
                        showCancelButton={true}
                        showRemoveAll={true}
                    />
                )}
                name="groceryType"
                {...props.register('groceryType')}
            />
            {props.errors.groceryType && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <Text style={styles.errorMsg}>
                        Tämä on pakollinen tieto
                    </Text>
                </View>
            )}
            <Text style={styles.label}>Kappalemäärä</Text>
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
                        <Text style={styles.inputMetric}>Kpl</Text>
                    </View>
                )}
                name="groceryNumber"
                {...props.register('groceryNumber')}
            />
            {props.errors.groceryPrice && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <Text style={styles.errorMsg}>
                        Syötä lukumäärä montako elintarviketta tätä tuotetta
                        haluat lisätä.
                    </Text>
                </View>
            )}
            <Text style={styles.label}>Arvioitu hinta</Text>
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
                        <Text style={styles.inputMetric}>€</Text>
                    </View>
                )}
                name="groceryPrice"
                {...props.register('groceryPrice')}
            />
            {props.errors.groceryPrice && (
                <View style={styles.messageSection}>
                    <Icon name="error" color="red" size={14} />
                    <Text style={styles.errorMsg}>
                        Täytä arvioitu hinta numerona. Syötä vähintään 1 ja
                        maksimissaan 4 lukua.
                    </Text>
                </View>
            )}
            <SafeAreaView>
                <Button
                    onPress={showDatepicker}
                    title="Aseta tuotteen viimeinen käyttöpäivä"
                />
                <Text>selected: {date.toLocaleString()}</Text>
                {show && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={mode}
                        onChange={onChange}
                    />
                )}
            </SafeAreaView>
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
        marginBottom: 8,
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
