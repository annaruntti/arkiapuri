import { StyleSheet, View, Text } from 'react-native'
import CustomInput from './CustomInput'

const AddMealForm = ({ control }) => {
    return (
        <View>
            <CustomInput
                label="Aterian nimi"
                name="Meal name"
                placeholder="Kirjoita aterian nimi"
                control={control}
                rules={{ required: 'Aterian nimi on pakollinen tieto' }}
            />
            <CustomInput
                label="Aterian kategoriat"
                name="Meal category"
                placeholder="Aterian kategoria tai kategoriat"
                control={control}
                rules={{
                    required: 'Kategoria on pakollinen tieto',
                    minLength: {
                        value: 3,
                        message:
                            'kategorian pituuden tulee olla vähintään 3 merkkiä',
                    },
                }}
            />
            <CustomInput
                label="Ruuat joista ateria koostuu"
                name="Foods"
                placeholder="Esim. riisi, kasvispihvit ja tsatsiki"
                control={control}
                rules={{
                    required: 'Lisää ruokia, joista ateria koostuu',
                    minLength: {
                        value: 3,
                        message:
                            'Ruuan nimen pituuden tulee olla vähintään 3 merkkiä',
                    },
                }}
            />
            <Text style={styles.inputInfo}>
                Ateriat koostuvat yhdesta tai useamaasta ruuasta. Ruuat
                koostuvat ainesosista ja ruokalajeilla voi olla resepti.
            </Text>
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
