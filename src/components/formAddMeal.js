import { StyleSheet, View } from 'react-native'

const AddMealForm = (props) => {
    return (
        <View>
            <label htmlFor="Meal name">Aterian nimi</label>
            {/* register your input into the hook by invoking the "register" function */}
            <input
                type="text"
                style={styles.formInput}
                {...props.register('Meal name')}
            />
            <label htmlFor="mealCategory">Kategoriat</label>
            {/* include validation with required or other standard HTML validation rules */}
            <input
                type="text"
                style={styles.formInput}
                {...props.register('mealCategory')}
            />
            <label htmlFor="food">Ruokalajit</label>
            <input
                type="text"
                style={styles.formInfoInput}
                {...props.register('food')}
            />
            <span style={styles.inputInfo}>
                Esim. kasvispihvi. Ruokalajit koostuvat ainesosista ja
                ruokalajeilla voi olla resepti.
            </span>
        </View>
    )
}

export default AddMealForm

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
