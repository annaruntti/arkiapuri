import { useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Button from './Button'
import CustomText from './CustomText'
import { getSortOptionById, getSortOptionLabel } from '../utils/listSort'

/**
 * Reusable list sort control.
 * Trigger keeps a sort icon and uses small tertiary styling;
 * each sort direction is its own option button.
 */
const ListSortControl = ({
    options = [],
    value,
    onChange,
    buttonText = 'Järjestä',
    disabled = false,
    showOptions: controlledShowOptions,
    onToggleShowOptions,
}) => {
    const [internalShowOptions, setInternalShowOptions] = useState(false)
    const showOptions =
        controlledShowOptions !== undefined
            ? controlledShowOptions
            : internalShowOptions

    const toggleShowOptions = () => {
        if (onToggleShowOptions) {
            onToggleShowOptions()
            return
        }
        setInternalShowOptions((prev) => !prev)
    }

    const selectedOption = useMemo(
        () => getSortOptionById(options, value),
        [options, value]
    )

    const title = selectedOption
        ? getSortOptionLabel(options, value, { short: true })
        : buttonText

    const isDisabled = disabled || options.length === 0

    return (
        <View style={styles.container}>
            <Pressable
                onPress={isDisabled ? undefined : toggleShowOptions}
                disabled={isDisabled}
                style={({ pressed }) => [
                    styles.triggerButton,
                    showOptions && styles.activeButton,
                    isDisabled && styles.disabledButton,
                    pressed && !isDisabled && styles.pressed,
                ]}
            >
                <MaterialIcons name="sort" size={16} color="#5844BB" />
                <CustomText style={styles.triggerText}>{title}</CustomText>
                <MaterialIcons
                    name={showOptions ? 'expand-less' : 'expand-more'}
                    size={16}
                    color="#5844BB"
                />
            </Pressable>

            {showOptions ? (
                <View style={styles.optionsPanel}>
                    <View style={styles.optionsRow}>
                        {options.map((option) => {
                            const selected = option.id === value
                            return (
                                <Button
                                    key={option.id}
                                    title={option.label}
                                    type="TERTIARY"
                                    size="small"
                                    onPress={() => {
                                        onChange?.(option.id)
                                        if (
                                            controlledShowOptions === undefined
                                        ) {
                                            setInternalShowOptions(false)
                                        }
                                    }}
                                    style={
                                        selected
                                            ? styles.selectedOptionButton
                                            : styles.optionButton
                                    }
                                    textStyle={
                                        selected
                                            ? styles.selectedOptionText
                                            : undefined
                                    }
                                />
                            )
                        })}
                    </View>
                </View>
            ) : null}
        </View>
    )
}

const styles = {
    container: {
        flexShrink: 1,
        alignItems: 'flex-end',
        position: 'relative',
        zIndex: 20,
    },
    triggerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#5844BB',
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 16,
        minHeight: 36,
    },
    triggerText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#000',
    },
    activeButton: {
        backgroundColor: '#F0EBFF',
    },
    pressed: {
        opacity: 0.8,
    },
    disabledButton: {
        opacity: 0.5,
    },
    optionsPanel: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E4DFF5',
        padding: 10,
        gap: 8,
        minWidth: 280,
        maxWidth: 360,
        width: 320,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        zIndex: 30,
    },
    optionsRow: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 8,
    },
    optionButton: {
        backgroundColor: '#FAFAFC',
        alignSelf: 'stretch',
        width: '100%',
    },
    selectedOptionButton: {
        backgroundColor: '#AE9CFC',
        alignSelf: 'stretch',
        width: '100%',
    },
    selectedOptionText: {
        fontWeight: '700',
    },
}

export default ListSortControl
