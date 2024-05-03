import { StyleSheet, View, Text, TextInput } from 'react-native'
import { Controller } from 'react-hook-form'
import SectionedMultiSelect from 'react-native-sectioned-multi-select'
import { MaterialIcons as Icon } from '@expo/vector-icons'

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
    console.log(props.errors.groceryName, 'test')

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
                <Text style={styles.errorMsg}>This is required.</Text>
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
                        style={styles.formInput}
                        items={items}
                        IconRenderer={Icon}
                        uniqueKey="id"
                        onSelectedItemsChange={onChange}
                        selectedItems={value}
                    />
                )}
                name="groceryType"
                {...props.register('groceryType')}
            />
            {props.errors.groceryType && (
                <Text style={styles.errorMsg}>This is required.</Text>
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
