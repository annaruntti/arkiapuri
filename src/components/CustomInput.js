import { MaterialIcons as Icon } from '@expo/vector-icons'
import React from 'react'
import { Controller } from 'react-hook-form'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import CustomText from './CustomText'

const CustomInput = ({
    control,
    name,
    rules,
    label,
    isControlled = true,
    placeholder,
    secureTextEntry,
}) => {
    if (!isControlled) {
        return (
            <View style={styles.container}>
                {label && <Text style={styles.label}>{label}</Text>}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                />
            </View>
        )
    }

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({
                field: { value, onChange, onBlur },
                fieldState: { error },
            }) => (
                <View style={styles.container}>
                    {label && <Text style={styles.label}>{label}</Text>}
                    <TextInput
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        style={styles.input}
                        secureTextEntry={secureTextEntry}
                    />
                    {error && (
                        <View style={styles.messageSection}>
                            <Icon name="error" color="red" size={14} />
                            <CustomText style={styles.errorMsg}>
                                {error.message || 'Error'}
                            </CustomText>
                        </View>
                    )}
                </View>
            )}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        width: '100%',
        marginBottom: 5,
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
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    errorMsg: {
        color: 'red',
        marginLeft: 5,
        alignSelf: 'stretch',
    },
    label: {
        marginBottom: 5,
    },
    container: {
        marginBottom: 10,
    },
})

export default CustomInput
