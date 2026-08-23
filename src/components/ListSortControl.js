import { useLayoutEffect, useState } from 'react'
import { View } from 'react-native'
import ExpandableListPanel, {
    ExpandableListChipRow,
} from './ExpandableListPanel'
import FilterChip from './FilterChip'
import { useListSortPanelSlot } from './ListStatsRow'
import ToggleButton from './ToggleButton'

/**
 * Reusable list sort control.
 * Trigger stays in the stats action row; options use the same panel as filters.
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
    const registerSortPanel = useListSortPanelSlot()
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

    const isDisabled = disabled || options.length === 0

    const renderOptionsPanel = () => (
        <ExpandableListPanel visible title="Järjestä:">
            <ExpandableListChipRow>
                {options.map((option) => (
                    <FilterChip
                        key={option.id}
                        label={option.label}
                        isSelected={option.id === value}
                        showRemoveIcon={false}
                        onPress={() => onChange?.(option.id)}
                    />
                ))}
            </ExpandableListChipRow>
        </ExpandableListPanel>
    )

    useLayoutEffect(() => {
        if (!registerSortPanel) {
            return undefined
        }
        registerSortPanel(showOptions ? renderOptionsPanel() : null)
        return () => registerSortPanel(null)
    }, [registerSortPanel, showOptions, options, value])

    return (
        <View style={styles.container}>
            <ToggleButton
                variant="pill"
                label={buttonText}
                icon="sort"
                expanded={showOptions}
                onPress={isDisabled ? undefined : toggleShowOptions}
                disabled={isDisabled}
            />
            {registerSortPanel ? null : showOptions ? renderOptionsPanel() : null}
        </View>
    )
}

const styles = {
    container: {
        flexShrink: 0,
        zIndex: 20,
    },
}

export default ListSortControl
