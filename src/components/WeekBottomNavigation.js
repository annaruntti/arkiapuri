import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import CustomText from './CustomText'

export const formatWeekOffsetLabel = (weekOffset) => {
    if (weekOffset === 0) return 'Tämä viikko'
    if (weekOffset < 0) {
        const weeks = Math.abs(weekOffset)
        return `${weeks} viikko${weeks > 1 ? 'a' : ''} sitten`
    }
    return `${weekOffset} viiko${weekOffset > 1 ? 'n' : 'n'} päästä`
}

/**
 * Sticky previous / current / next week controls under the calendar.
 */
const WeekBottomNavigation = ({
    weekOffset,
    onPrevious,
    onNext,
    onGoCurrent,
    leftBleed = 0,
    rightBleed = 0,
    innerStyle,
}) => {
    const isCurrentWeek = weekOffset === 0

    return (
        <View
            style={[
                styles.bottomWeekNavigation,
                (leftBleed > 0 || rightBleed > 0) && {
                    left: -leftBleed,
                    right: -rightBleed,
                },
            ]}
        >
            <View style={[styles.bottomWeekNavigationInner, innerStyle]}>
                <TouchableOpacity
                    onPress={onPrevious}
                    style={styles.bottomNavButton}
                >
                    <MaterialIcons name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.bottomWeekLabelContainer}>
                    <CustomText style={styles.bottomWeekLabel}>
                        {formatWeekOffsetLabel(weekOffset)}
                    </CustomText>
                    {!isCurrentWeek && (
                        <TouchableOpacity onPress={onGoCurrent}>
                            <CustomText style={styles.bottomCurrentWeekLink}>
                                Palaa nykyiseen
                            </CustomText>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    onPress={onNext}
                    style={styles.bottomNavButton}
                >
                    <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color="#333"
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    bottomWeekNavigation: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
        zIndex: 10,
    },
    bottomWeekNavigationInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    bottomNavButton: {
        padding: 6,
        borderRadius: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    bottomWeekLabelContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
    },
    bottomWeekLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    bottomCurrentWeekLink: {
        fontSize: 11,
        color: '#5844BB',
        marginTop: 2,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
})

export default WeekBottomNavigation
