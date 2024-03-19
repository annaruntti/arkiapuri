import { StyleSheet, View } from 'react-native'

const AddFoodForm = (props) => {
    return (
        <View>
            <label htmlFor="Food name">Elintarvikkeen nimi</label>
            {/* register your input into the hook by invoking the "register" function */}
            <input
                type="text"
                style={styles.formInput}
                {...props.register('Food name')}
            />
            <label htmlFor="Food Category">Elintarvikkeen tyyppi</label>
            {/* include validation with required or other standard HTML validation rules */}
            <select {...props.register('Food Category', { required: true })}>
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
                {...props.register('price')}
            />
            <label htmlFor="amount">Määrä</label>
            <input
                type="text"
                style={styles.formInfoInput}
                {...props.register('amount')}
            />
            <label htmlFor="bestBeforeDate">Parasta ennen</label>
            <input
                type="text"
                style={styles.formInfoInput}
                {...props.register('bestBeforeDate')}
            />
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
