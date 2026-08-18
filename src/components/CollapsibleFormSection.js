import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { formStyles } from '../styles/formStyles'
import CustomText from './CustomText'
import ToggleButton from './ToggleButton'

const CollapsibleFormSection = ({
    label,
    summary,
    placeholder = 'Valitse',
    children,
    expanded: expandedProp,
    onExpandedChange,
    defaultExpanded = false,
    style,
}) => {
    const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
    const isControlled = expandedProp !== undefined
    const expanded = isControlled ? expandedProp : internalExpanded

    const toggle = () => {
        const next = !expanded
        if (!isControlled) setInternalExpanded(next)
        onExpandedChange?.(next)
    }

    return (
        <View style={style}>
            {label ? (
                <CustomText style={formStyles.label}>{label}</CustomText>
            ) : null}
            <ToggleButton
                label={summary || placeholder}
                muted={!summary}
                expanded={expanded}
                onPress={toggle}
            />
            {expanded ? <View style={styles.body}>{children}</View> : null}
        </View>
    )
}

const styles = StyleSheet.create({
    body: {
        marginTop: 8,
    },
})

export default CollapsibleFormSection
