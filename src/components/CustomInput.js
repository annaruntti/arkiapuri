import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { Controller } from 'react-hook-form'
import { MaterialIcons as Icon } from '@expo/vector-icons'

const CustomInput = ({
    control,
    label,
    name,
    rules = {},
    placeholder,
    secureTextEntry,
}) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({
                field: { value, onChange, onBlur },
                fieldState: { error },
            }) => (
                <>
                    <Text style={styles.label}>{label}</Text>
                    <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        style={styles.input}
                        secureTextEntry={secureTextEntry}
                    />
                    {error && (
                        <View style={styles.messageSection}>
                            <Icon name="error" color="red" size={14} />
                            <Text style={styles.errorMsg}>
                                {error.message || 'Error'}
                            </Text>
                        </View>
                    )}
                </>
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
        marginBottom: 8,
        width: '100%',
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
})

export default CustomInput
