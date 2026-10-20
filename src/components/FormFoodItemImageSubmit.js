import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import Button from './Button'
import CustomText from './CustomText'
import { formStyles } from '../styles/formStyles'

/**
 * Food-item image picker + save button row.
 */
const FormFoodItemImageSubmit = ({
    foodItemImage,
    onPickImage,
    onSubmit,
    style,
}) => (
    <View style={[styles.formSingleColumn, style]}>
        <View style={formStyles.fieldGroup}>
            <CustomText style={formStyles.label}>Tuotteen kuva</CustomText>
            <TouchableOpacity style={styles.imagePicker} onPress={onPickImage}>
                {foodItemImage ? (
                    <Image
                        source={{ uri: foodItemImage.uri }}
                        style={styles.selectedImage}
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <MaterialIcons
                            name="add-a-photo"
                            size={40}
                            color="#5844BB"
                        />
                        <CustomText style={styles.imagePlaceholderText}>
                            Lisää kuva
                        </CustomText>
                    </View>
                )}
            </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
            <Button
                title="Tallenna tuote"
                onPress={onSubmit}
                style={styles.submitButton}
                textStyle={styles.submitButtonText}
            />
        </View>
    </View>
)

const styles = StyleSheet.create({
    formSingleColumn: {
        width: '100%',
    },
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
        marginVertical: 10,
    },
    submitButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#AE9CFC',
        width: '100%',
        marginBottom: 10,
    },
    submitButtonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    imagePicker: {
        borderWidth: 2,
        borderColor: '#5844BB',
        borderStyle: 'dashed',
        borderRadius: 8,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: '#5844BB',
        fontSize: 16,
        fontWeight: '500',
    },
    selectedImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
})

export default FormFoodItemImageSubmit
