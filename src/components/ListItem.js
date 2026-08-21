import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomText from './CustomText'

const ListItem = ({
    variant = 'card',
    image,
    imageShape = 'rounded',
    imageSize,
    placeholderImageUrl,
    icon,
    iconSize = 24,
    iconColor = '#5844BB',
    leading,
    title,
    subtitle,
    details,
    footer,
    trailing,
    onPress,
    onLongPress,
    onImagePress,
    onDelete,
    deleteAccessibilityLabel = 'Poista',
    muted = false,
    selected = false,
    disabled = false,
    leadingBadge,
    style,
    children,
}) => {
    const isCard = variant === 'card'
    const size = imageSize || (isCard ? 56 : 50)
    const imageSource = image || (placeholderImageUrl ? { uri: placeholderImageUrl } : null)
    const imagePress = !disabled && (onImagePress || onPress)

    let leadingNode = leading
    if (!leadingNode && imageSource) {
        const imageEl = (
            <View style={styles.imageWrap}>
                <Image
                    source={imageSource}
                    style={[
                        {
                            width: size,
                            height: size,
                            borderRadius: imageShape === 'circle' ? size / 2 : 8,
                            backgroundColor: '#f0f0f0',
                        },
                        muted && styles.imageMuted,
                    ]}
                    resizeMode="cover"
                />
                {leadingBadge}
            </View>
        )
        leadingNode = imagePress ? (
            <TouchableOpacity
                onPress={imagePress}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
                {imageEl}
            </TouchableOpacity>
        ) : (
            imageEl
        )
    } else if (!leadingNode && icon) {
        leadingNode = (
            <View style={[styles.iconWrap, { width: size, height: size }]}>
                <MaterialIcons name={icon} size={iconSize} color={iconColor} />
            </View>
        )
    }

    const body = children || (
        <View style={styles.body}>
            {title != null && title !== '' ? (
                typeof title === 'string' ? (
                    <CustomText
                        style={[
                            styles.title,
                            isCard && styles.cardTitle,
                            muted && styles.textMuted,
                        ]}
                    >
                        {title}
                    </CustomText>
                ) : (
                    title
                )
            ) : null}
            {subtitle != null && subtitle !== '' ? (
                typeof subtitle === 'string' ? (
                    <CustomText
                        style={[styles.subtitle, muted && styles.textMuted]}
                    >
                        {subtitle}
                    </CustomText>
                ) : (
                    subtitle
                )
            ) : null}
            {details != null && details !== '' ? (
                typeof details === 'string' ? (
                    <CustomText style={styles.details}>{details}</CustomText>
                ) : (
                    details
                )
            ) : null}
        </View>
    )

    const trailingNode =
        trailing || onDelete ? (
            <View style={styles.trailingWrap}>
                {trailing}
                {onDelete ? (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={disabled ? undefined : onDelete}
                        disabled={disabled}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel={deleteAccessibilityLabel}
                    >
                        <MaterialIcons name="delete" size={20} color="#666" />
                    </TouchableOpacity>
                ) : null}
            </View>
        ) : null

    const main = (
        <View
            style={[
                styles.mainRow,
                !leadingNode && styles.mainRowNoLeading,
            ]}
        >
            {leadingNode}
            {!disabled && (onPress || onLongPress) ? (
                <TouchableOpacity
                    style={styles.main}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    activeOpacity={0.7}
                >
                    {body}
                </TouchableOpacity>
            ) : (
                <View style={styles.main}>{body}</View>
            )}
            {trailingNode}
        </View>
    )

    return (
        <View
            style={[
                isCard ? styles.card : styles.row,
                muted && styles.muted,
                selected && styles.selected,
                disabled && styles.disabled,
                style,
            ]}
        >
            {main}
            {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        width: '100%',
    },
    row: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingLeft: 16,
        paddingRight: 16,
        paddingVertical: 12,
        width: '100%',
    },
    muted: {
        backgroundColor: '#f7f7f7',
        opacity: 0.75,
    },
    selected: {
        borderWidth: 2,
        borderColor: '#5844BB',
        backgroundColor: '#F3F0FF',
    },
    disabled: {
        opacity: 0.5,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mainRowNoLeading: {
        alignItems: 'flex-start',
    },
    imageWrap: {
        position: 'relative',
        marginRight: 12,
    },
    imageMuted: {
        opacity: 0.6,
    },
    iconWrap: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    main: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'center',
    },
    body: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    details: {
        fontSize: 12,
        color: '#5844BB',
        fontWeight: '500',
        marginTop: 4,
    },
    textMuted: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
    trailingWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        gap: 4,
    },
    deleteButton: {
        backgroundColor: '#e0e0e0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    footer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
})

export default ListItem
