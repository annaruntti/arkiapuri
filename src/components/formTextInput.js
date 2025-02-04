import React from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { TextInput, Text, View, Pressable } from 'react-native'
import CustomText from './CustomText'

export default function FormInput({ name, label, rules, style, ...props }) {
    const form = useFormContext()
    const { field, fieldState } = useController({
        control: form.control,
        name,
        rules,
    })
    return (
        <View>
            <Pressable onPress={() => form.setFocus(name)}>
                <TextInput
                    {...field}
                    {...props}
                    onChangeText={field.onChange}
                    blurOnSubmit={!nextFocus}
                    returnKeyType={nextFocus ? 'next' : props.returnKeyType}
                    onSubmitEditing={(e) => {
                        if (nextFocus) form.setFocus(nextFocus)
                        props.onSubmitEditing?.(e)
                    }}
                />
            </Pressable>
            {fieldState.error && (
                <CustomText>{fieldState.error.message}</CustomText>
            )}
        </View>
    )
}
