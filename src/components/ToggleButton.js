import { TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'

const ToggleButton = ({
    label,
    expanded = false,
    onPress,
    icon,
    badge = 0,
    disabled = false,
    style,
    variant = 'field',
    muted = false,
}) => {
    const isPill = variant === 'pill'
    const badgeCount = Number(badge) || 0
    const showBadge = isPill && badgeCount > 0

    return (
        <TouchableOpacity
            style={[
                isPill ? styles.pill : styles.field,
                !isPill && expanded && styles.fieldExpanded,
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ expanded, disabled }}
        >
            {isPill && icon ? (
                <MaterialIcons name={icon} size={18} color="#000" />
            ) : null}
            <CustomText
                style={[
                    isPill ? styles.pillLabel : styles.fieldLabel,
                    muted && styles.fieldLabelMuted,
                ]}
                numberOfLines={1}
            >
                {label}
            </CustomText>
            {showBadge ? (
                <View style={styles.badge}>
                    <CustomText style={styles.badgeText}>{badgeCount}</CustomText>
                </View>
            ) : null}
            <MaterialIcons
                name={
                    isPill
                        ? expanded
                            ? 'expand-less'
                            : 'expand-more'
                        : expanded
                          ? 'keyboard-arrow-up'
                          : 'keyboard-arrow-down'
                }
                size={isPill ? 18 : 24}
                color={isPill ? '#000' : '#666'}
            />
        </TouchableOpacity>
    )
}

const styles = {
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#5844BB',
        borderRadius: 25,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 4,
        minHeight: 40,
        maxWidth: '100%',
    },
    pillLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        flexShrink: 1,
    },
    field: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        width: '100%',
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 4,
        height: 40,
        paddingHorizontal: 10,
    },
    fieldExpanded: {
        borderColor: '#5844BB',
        borderWidth: 2,
    },
    fieldLabel: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginRight: 8,
    },
    fieldLabelMuted: {
        color: '#999',
    },
    disabled: {
        opacity: 0.5,
    },
    badge: {
        backgroundColor: '#AE9CFC',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    badgeText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
}

export default ToggleButton
