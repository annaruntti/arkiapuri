import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { Controller } from 'react-hook-form'
import { MaterialIcons as Icon } from '@expo/vector-icons'
import { useResponsiveDimensions } from '../utils/responsive'
import CustomText from './CustomText'
import { FIELD_SPACING, LABEL_SPACING } from '../styles/formStyles'

const CustomInput = ({
    control,
    name,
    rules,
    label,
    isControlled = true,
    placeholder,
    secureTextEntry,
    style,
    inputStyle,
    variant = 'auth', // 'auth' = tall/rounded (login screens), 'form' = compact (add/edit forms)
    multiline = false,
    numberOfLines,
    keyboardType,
}) => {
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const getInputStyle = () => [
        styles.input,
        variant === 'form' && styles.formInput,
        variant === 'auth' && isDesktop && styles.desktopInput,
        variant === 'auth' && isTablet && styles.tabletInput,
        inputStyle,
    ]

    const getContainerStyle = () => [
        styles.container,
        variant === 'form' && styles.formContainer,
        variant === 'auth' && isDesktop && styles.desktopContainer,
        style,
    ]

    const getLabelStyle = () => [
        styles.label,
        variant === 'form' && styles.formLabel,
        variant === 'auth' && isDesktop && styles.desktopLabel,
    ]

    if (!isControlled) {
        return (
            <View style={getContainerStyle()}>
                {label && <Text style={getLabelStyle()}>{label}</Text>}
                <TextInput
                    style={getInputStyle()}
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
                <View style={getContainerStyle()}>
                    {label && <Text style={getLabelStyle()}>{label}</Text>}
                    <TextInput
                        value={value || ''}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        style={getInputStyle()}
                        secureTextEntry={secureTextEntry}
                        placeholderTextColor="#999"
                        multiline={multiline}
                        numberOfLines={numberOfLines}
                        keyboardType={keyboardType}
                        textAlignVertical={multiline ? 'top' : 'auto'}
                    />
                    {error && (
                        <View style={styles.messageSection}>
                            <Icon name="error" color="#e53e3e" size={14} />
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
    // Auth variant (default) – login/signup screens
    container: {
        marginBottom: 16,
    },
    desktopContainer: {
        marginBottom: 20,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    /** Matches formStyles.fieldGroup spacing */
    formContainer: {
        width: '100%',
        marginTop: 0,
        marginBottom: FIELD_SPACING,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6,
    },
    formLabel: {
        marginBottom: LABEL_SPACING,
    },
    desktopLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#ffffff',
        borderColor: '#d1d5db',
        borderWidth: 1,
        height: 48,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        color: '#1f2937',
        width: '100%',
        ...(Platform.OS === 'web' && {
            outlineStyle: 'none',
            transition:
                'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        }),
    },
    // Form variant input – matches formStyles.formInput
    formInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        height: 40,
        padding: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 4,
        fontSize: 16,
        color: '#333',
    },
    desktopInput: {
        height: 52,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 10,
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        ...(Platform.OS === 'web' && {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }),
    },
    tabletInput: {
        height: 50,
        paddingHorizontal: 15,
        paddingVertical: 13,
        borderRadius: 9,
        fontSize: 16,
    },
    messageSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        paddingHorizontal: 2,
    },
    errorMsg: {
        color: '#e53e3e',
        fontSize: 13,
        marginLeft: 6,
        flex: 1,
        fontWeight: '400',
    },
})

export default CustomInput
