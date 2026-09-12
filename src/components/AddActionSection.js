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
}) => {
    const { isDesktop } = useResponsiveDimensions()

    return (
        <PrimaryActionFade style={styles.section}>
            <CustomText style={styles.title}>{title}</CustomText>
            <CustomText style={styles.hint}>{hint}</CustomText>
            <View
                style={[
                    styles.buttons,
                    isDesktop ? styles.buttonsRow : styles.buttonsStack,
                ]}
            >
                <Button
                    title={primaryTitle}
                    type="PRIMARY"
                    fullWidth={!isDesktop}
                    onPress={onPrimaryPress}
                    style={isDesktop ? styles.desktopButton : undefined}
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
                        fullWidth={!isDesktop}
                        onPress={onSecondaryPress}
                        style={isDesktop ? styles.desktopButton : undefined}
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
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#2D2463',
        marginBottom: 6,
    },
    hint: {
        fontSize: 14,
        lineHeight: 20,
        color: '#4B445C',
        marginBottom: 12,
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
    desktopButton: {
        flexGrow: 1,
        flexBasis: 0,
        minWidth: 220,
    },
})

export default AddActionSection
