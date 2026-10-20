import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import CustomText from './CustomText'
import ResponsiveModal from './ResponsiveModal'

/**
 * Pick a target day when moving a meal within the visible week.
 */
const WeekMoveMealModal = ({
    visible,
    meal,
    fromDate,
    dates = [],
    onClose,
    onSelectDay,
}) => (
    <ResponsiveModal visible={visible} onClose={onClose}>
        <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>
                Siirrä ateria toiselle päivälle
            </CustomText>
            {meal && (
                <View style={styles.moveFromInfo}>
                    <CustomText style={styles.moveFromText}>
                        Siirretään:{' '}
                        <CustomText style={styles.mealNameBold}>
                            {meal.name}
                        </CustomText>
                    </CustomText>
                    {fromDate && (
                        <CustomText style={styles.moveFromText}>
                            Nykyinen päivä:{' '}
                            {format(fromDate, 'EEEE d.M.', { locale: fi })}
                        </CustomText>
                    )}
                </View>
            )}
            <CustomText style={styles.selectDayTitle}>
                Valitse uusi päivä:
            </CustomText>
            <View style={styles.daysList}>
                {dates.map((date) => {
                    const isCurrentDay =
                        fromDate &&
                        format(date, 'yyyy-MM-dd') ===
                            format(fromDate, 'yyyy-MM-dd')
                    const dayName = format(date, 'EEEE d.M.', { locale: fi })
                    const capitalizedDayName =
                        dayName.charAt(0).toUpperCase() + dayName.slice(1)

                    return (
                        <TouchableOpacity
                            key={format(date, 'yyyy-MM-dd')}
                            style={[
                                styles.dayButton,
                                isCurrentDay && styles.currentDayButton,
                            ]}
                            onPress={() => onSelectDay(date)}
                            disabled={isCurrentDay}
                        >
                            <CustomText
                                style={[
                                    styles.dayButtonText,
                                    isCurrentDay && styles.currentDayButtonText,
                                ]}
                            >
                                {capitalizedDayName}
                            </CustomText>
                            {isCurrentDay && (
                                <CustomText style={styles.currentDayLabel}>
                                    (Nykyinen)
                                </CustomText>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    </ResponsiveModal>
)

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '90%',
        width: '100%',
        paddingBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    moveFromInfo: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    moveFromText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    mealNameBold: {
        fontWeight: 'bold',
        color: '#333',
    },
    selectDayTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        color: '#333',
    },
    daysList: {
        gap: 10,
    },
    dayButton: {
        backgroundColor: '#AE9CFC',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    currentDayButton: {
        backgroundColor: '#e0e0e0',
        opacity: 0.6,
    },
    dayButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    currentDayButtonText: {
        color: '#999',
    },
    currentDayLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
})

export default WeekMoveMealModal
