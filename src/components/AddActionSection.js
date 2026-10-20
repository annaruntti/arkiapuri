import { StyleSheet, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Button from './Button'
import CustomText from './CustomText'
import PrimaryActionFade from './PrimaryActionFade'
import { useResponsiveDimensions } from '../utils/responsive'

const AddActionSection = ({
    title,
    hint,
    primaryTitle,
    onPrimaryPress,
    secondaryTitle,
    onSecondaryPress,
    primaryIcon = 'photo-camera',
    secondaryIcon = 'add',
    compactButton = false,
}) => {
    const { isDesktop } = useResponsiveDimensions()
    const buttonStyle = compactButton
        ? styles.compactButton
        : isDesktop
          ? styles.desktopButton
          : undefined

    return (
        <PrimaryActionFade
            style={[styles.section, isDesktop && styles.desktopSection]}
        >
            <CustomText style={styles.title}>{title}</CustomText>
            <CustomText style={styles.hint}>{hint}</CustomText>
            <View
                style={[
                    styles.buttons,
                    compactButton
                        ? styles.buttonsStart
                        : isDesktop
                          ? styles.buttonsRow
                          : styles.buttonsStack,
                ]}
            >
                <Button
                    title={primaryTitle}
                    type="PRIMARY"
                    fullWidth={!compactButton && !isDesktop}
                    onPress={onPrimaryPress}
                    style={buttonStyle}
                    icon={
                        <MaterialIcons
                            name={primaryIcon}
                            size={20}
                            color="#1f2937"
                        />
                    }
                />
                {secondaryTitle && onSecondaryPress ? (
                    <Button
                        title={secondaryTitle}
                        type="SECONDARY"
                        fullWidth={!compactButton && !isDesktop}
                        onPress={onSecondaryPress}
                        style={buttonStyle}
                        icon={
                            <MaterialIcons
                                name={secondaryIcon}
                                size={22}
                                color="#1f2937"
                            />
                        }
                    />
                ) : null}
            </View>
        </PrimaryActionFade>
    )
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#F4F0FF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D8CEF8',
        width: '100%',
    },
    desktopSection: {
        paddingHorizontal: 32,
        paddingVertical: 28,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#2D2463',
        marginBottom: 12,
    },
    hint: {
        fontSize: 14,
        lineHeight: 20,
        color: '#4B445C',
        marginBottom: 24,
    },
    buttons: {
        width: '100%',
        gap: 10,
    },
    buttonsStack: {
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    buttonsStart: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    compactButton: {
        alignSelf: 'flex-start',
        flexGrow: 0,
        flexShrink: 0,
    },
    desktopButton: {
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 220,
    },
})

export default AddActionSection
