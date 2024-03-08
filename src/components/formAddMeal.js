import { StyleSheet } from 'react-native'
import { useForm } from 'react-hook-form'

const AddMealForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const Submit = (data) => {
        // Handle submit codes here
    }

    return (
        <form onSubmit={handleSubmit(Submit)}>
            {/* "handleSubmit" will validate your inputs before invoking "Submit"
            function */}
            <label htmlFor="Meal name">Aterian nimi</label>
            {/* register your input into the hook by invoking the "register" function */}
            <input
                type="text"
                style={styles.formInput}
                {...register('Meal name')}
            />
            <label htmlFor="mealCategory">Kategoriat</label>
            {/* include validation with required or other standard HTML validation rules */}
            <input
                type="text"
                style={styles.formInput}
                {...register('mealCategory')}
            />
            <label htmlFor="food">Ruokalajit</label>
            <input type="text" style={styles.formInput} {...register('food')} />
            <span>
                Esim. kasvispihvi. Ruokalajit koostuvat ainesosista ja
                ruokalajeilla voi olla resepti.
            </span>
            <button type="submit">Tallenna ateria</button>
        </form>
    )
}

export default AddMealForm

const styles = StyleSheet.create({
    formInput: {
        width: '100%',
        marginBottom: 15,
        padding: 10,
        borderRadius: 15,
    },
})
