import { useMemo, useState } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import {
    addDays,
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    endOfWeek,
    format,
    isAfter,
    isBefore,
    isSameDay,
    isSameMonth,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subMonths,
} from 'date-fns'
import { fi } from 'date-fns/locale'
import CustomText from './CustomText'

const WEEK_OPTIONS = { weekStartsOn: 1, locale: fi }

const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : text

const isDisabled = (day, minimumDate, maximumDate) => {
    const d = startOfDay(day)
    if (minimumDate && isBefore(d, startOfDay(minimumDate))) return true
    if (maximumDate && isAfter(d, startOfDay(maximumDate))) return true
    return false
}

/**
 * Finnish calendar grid (month names + weekday letters via date-fns `fi`).
 */
const FinnishDateCalendar = ({
    value,
    onSelect,
    onCancel,
    minimumDate,
    maximumDate,
}) => {
    const selected = value ? new Date(value) : new Date()
    const [viewMonth, setViewMonth] = useState(startOfMonth(selected))

    const weekDayLabels = useMemo(() => {
        const weekStart = startOfWeek(new Date(), WEEK_OPTIONS)
        return Array.from({ length: 7 }, (_, i) =>
            format(addDays(weekStart, i), 'EEEEEE', { locale: fi })
        )
    }, [])

    const days = useMemo(() => {
        const monthStart = startOfMonth(viewMonth)
        const monthEnd = endOfMonth(viewMonth)
        const gridStart = startOfWeek(monthStart, WEEK_OPTIONS)
        const gridEnd = endOfWeek(monthEnd, WEEK_OPTIONS)
        return eachDayOfInterval({ start: gridStart, end: gridEnd })
    }, [viewMonth])

    const monthTitle = capitalize(
        format(viewMonth, 'LLLL yyyy', { locale: fi })
    )

    return (
        <View style={styles.card} accessibilityRole="summary">
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => setViewMonth((m) => subMonths(m, 1))}
                    style={styles.navButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialIcons name="chevron-left" size={26} color="#333" />
                </TouchableOpacity>
                <CustomText style={styles.monthTitle}>{monthTitle}</CustomText>
                <TouchableOpacity
                    onPress={() => setViewMonth((m) => addMonths(m, 1))}
                    style={styles.navButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialIcons
                        name="chevron-right"
                        size={26}
                        color="#333"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
                {weekDayLabels.map((label) => (
                    <View key={label} style={styles.weekCell}>
                        <CustomText style={styles.weekLabel}>{label}</CustomText>
                    </View>
                ))}
            </View>

            <View style={styles.daysGrid}>
                {days.map((day) => {
                    const outside = !isSameMonth(day, viewMonth)
                    const selectedDay = isSameDay(day, selected)
                    const disabled = isDisabled(day, minimumDate, maximumDate)
                    return (
                        <TouchableOpacity
                            key={day.toISOString()}
                            style={[
                                styles.dayCell,
                                selectedDay && styles.dayCellSelected,
                            ]}
                            disabled={disabled}
                            onPress={() => onSelect?.(day)}
                            activeOpacity={0.7}
                        >
                            <CustomText
                                style={[
                                    styles.dayText,
                                    outside && styles.dayTextOutside,
                                    disabled && styles.dayTextDisabled,
                                    selectedDay && styles.dayTextSelected,
                                ]}
                            >
                                {format(day, 'd')}
                            </CustomText>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {onCancel && (
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onCancel}
                    activeOpacity={0.7}
                >
                    <CustomText style={styles.cancelText}>Peruuta</CustomText>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 8,
        width: '100%',
        alignSelf: 'stretch',
        borderWidth: 1,
        borderColor: '#bbb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    navButton: {
        padding: 4,
    },
    monthTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'FiraSans-SemiBold',
    },
    weekRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    weekCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 4,
    },
    weekLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
        textTransform: 'lowercase',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.2857%',
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    dayCellSelected: {
        backgroundColor: '#5844BB',
    },
    dayText: {
        fontSize: 15,
        color: '#333',
    },
    dayTextOutside: {
        color: '#bbb',
    },
    dayTextDisabled: {
        color: '#ddd',
    },
    dayTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    cancelButton: {
        marginTop: 6,
        alignItems: 'center',
        paddingVertical: 6,
    },
    cancelText: {
        fontSize: 14,
        color: '#5844BB',
        fontWeight: '500',
    },
})

export default FinnishDateCalendar
