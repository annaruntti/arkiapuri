import { useState } from 'react'
import {
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'
import { APP_UNITS } from '../utils/units'

const UnitSelect = ({
    value = 'kpl',
    onChange,
    open: openProp,
    onOpenChange,
    style,
}) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = openProp !== undefined
    const open = isControlled ? openProp : uncontrolledOpen

    const setOpen = (next) => {
        if (!isControlled) setUncontrolledOpen(next)
        onOpenChange?.(next)
    }

    const selected = value || 'kpl'

    return (
        <View style={[styles.wrap, open && styles.wrapOpen, style]}>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setOpen(!open)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Vaihda yksikkö"
            >
                <CustomText style={styles.buttonText} numberOfLines={1}>
                    {selected}
                </CustomText>
                <MaterialIcons
                    name={open ? 'expand-less' : 'expand-more'}
                    size={14}
                    color="#666"
                />
            </TouchableOpacity>
            {open ? (
                <View style={styles.dropdown}>
                    <ScrollView
                        style={styles.dropdownScroll}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                    >
                        {APP_UNITS.map((unit) => {
                            const isSelected = selected === unit
                            return (
                                <TouchableOpacity
                                    key={unit}
                                    style={[
                                        styles.option,
                                        isSelected && styles.optionSelected,
                                    ]}
                                    onPress={() => {
                                        onChange?.(unit)
                                        setOpen(false)
                                    }}
                                    activeOpacity={0.7}
                                    accessibilityRole="button"
                                    accessibilityState={{
                                        selected: isSelected,
                                    }}
                                    accessibilityLabel={`Yksikkö ${unit}`}
                                >
                                    <CustomText
                                        style={[
                                            styles.optionText,
                                            isSelected &&
                                                styles.optionTextSelected,
                                        ]}
                                    >
                                        {unit}
                                    </CustomText>
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        position: 'relative',
        zIndex: 1,
        width: '100%',
    },
    wrapOpen: {
        zIndex: 200,
        elevation: 200,
    },
    button: {
        width: '100%',
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 2,
    },
    buttonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
        lineHeight: 16,
        textAlign: 'center',
    },
    dropdown: {
        position: 'absolute',
        top: 44,
        right: 0,
        width: 88,
        zIndex: 300,
        elevation: 300,
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        ...(Platform.OS === 'web' && {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }),
    },
    dropdownScroll: {
        maxHeight: 220,
    },
    option: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionSelected: {
        backgroundColor: '#f3f0ff',
    },
    optionText: {
        fontSize: 15,
        color: '#4b5563',
        textAlign: 'center',
    },
    optionTextSelected: {
        color: '#5844BB',
        fontWeight: '600',
    },
})

export default UnitSelect
