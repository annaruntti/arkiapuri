import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import Button from './Button'
import CustomText from './CustomText'

const RecipeStepsEditor = ({
    steps = [''],
    onChange,
    addLabel = '+ Lisää vaihe',
}) => {
    const values = steps.length ? steps : ['']

    const updateStep = (index, text) => {
        const next = [...values]
        next[index] = text
        onChange(next)
    }

    const addStep = () => {
        onChange([...values, ''])
    }

    const removeStep = (index) => {
        if (values.length <= 1) {
            onChange([''])
            return
        }
        onChange(values.filter((_, i) => i !== index))
    }

    return (
        <View>
            {values.map((step, index) => (
                <View key={`recipe-step-${index}`} style={styles.row}>
                    <CustomText style={styles.number}>{index + 1}.</CustomText>
                    <TextInput
                        style={styles.input}
                        value={step}
                        onChangeText={(text) => updateStep(index, text)}
                        placeholder="Kirjoita vaihe..."
                        placeholderTextColor="#999"
                        multiline
                    />
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeStep(index)}
                        accessibilityLabel={`Poista vaihe ${index + 1}`}
                    >
                        <Feather name="trash-2" size={18} color="#666" />
                    </TouchableOpacity>
                </View>
            ))}
            <Button
                title={addLabel}
                type="TERTIARY"
                size="small"
                onPress={addStep}
                style={styles.addButton}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        gap: 8,
    },
    number: {
        width: 28,
        paddingTop: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#5844BB',
    },
    input: {
        flex: 1,
        minHeight: 44,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#fff',
        fontSize: 16,
        textAlignVertical: 'top',
    },
    removeButton: {
        padding: 8,
        marginTop: 2,
    },
    addButton: {
        alignSelf: 'flex-start',
        marginTop: 4,
    },
})

export default RecipeStepsEditor
