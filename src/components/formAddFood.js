import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import FormInput from './formTextInput'

const AddFoodForm = (props) => {
    const [foodName, setFoodName] = useState('')
    const [foodCategory, setFoodCategory] = useState('')
    const [price, setPrice] = useState('')
    const [amount, setAmount] = useState('')
    const [bestBeforeDate, setbestBeforeDate] = useState('')

    const [date, setDate] = useState(new Date())
    const [showPicker, setShowPicker] = useState(false)

    return (
        <View>
            <FormInput
                label="Elintarvikkeen nimi"
                name="foodName"
                rules={{
                    required: true,
                    pattern: {
                        value: '^.{2,}$',
                        message: 'Kirjoita elintarvikkeen nimi',
                    },
                }}
            />

            {/* <label htmlFor="foodName">Elintarvikkeen nimi</label> */}
            {/* register your input into the hook by invoking the "register" function */}
            {/* <input
                type="text"
                style={styles.formInput}
                {...props.register('foodName')}
            /> */}

            {/* <label htmlFor="Food Category">Elintarvikkeen tyyppi</label> */}
            {/* include validation with required or other standard HTML validation rules */}
            {/* <select {...props.handleForm('Food Category', { required: true })}>
                <option value="">Valitse tyyppi</option>
                <option value="tuoretuote">Tuore</option>
                <option value="pakaste">Pakaste</option>
                <option value="kuivaaine">Kuiva-aine</option>
                <option value="tarvike">Tarvike</option>
                <option value="muu">Muu</option>
            </select>
            <label htmlFor="price">Arvioitu hinta</label>
            <input
                type="text"
                style={styles.formInfoInput}
                {...props.handleForm('price')}
            />
            <label htmlFor="amount">Määrä</label>
            <input
                type="text"
                style={styles.formInfoInput}
                {...props.handleForm('amount')}
            />
            <label htmlFor="bestBeforeDate">Parasta ennen</label>
            <input
                type="text"
                style={styles.formInfoInput}
                {...props.handleForm('bestBeforeDate')}
            />
            {showPicker && (
                <DateTimePicker mode="date" display="spinner" value={date} />
            )} */}
        </View>
    )
}

export default AddFoodForm

const styles = StyleSheet.create({
    formInput: {
        width: '90%',
        marginBottom: 15,
        padding: 10,
        borderRadius: 5,
    },
    formInfoInput: {
        width: '90%',
        marginBottom: 5,
        padding: 10,
        borderRadius: 5,
    },
    inputInfo: {
        marginBottom: 15,
    },
})
