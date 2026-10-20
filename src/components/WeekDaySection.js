import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import {
    Image,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import { MEAL_PLACEHOLDER_IMAGE_URL } from '../constants/images'
import { getMealTypeText } from '../utils/mealUtils'
import Button from './Button'
import CustomText from './CustomText'
import DraggableMealItem from './DraggableMealItem'

/**
 * One calendar day block in the week view (header, meals, drop target).
 */
const WeekDaySection = ({
    date,
    meals = [],
    isDropTarget,
    draggingMeal,
    dayRefs,
    onDayLayout,
    onAddMeal,
    onMealPress,
    onRemoveMeal,
    onDragStart,
    onDragging,
    onDragEnd,
    onDragPosition,
}) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const isToday = dateKey === format(new Date(), 'yyyy-MM-dd')
    const formattedDate = format(date, 'EEEE d.M.yyyy', { locale: fi })
    const capitalizedDate =
        formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

    return (
        <View
            ref={(ref) => {
                if (ref) {
                    dayRefs.current.set(dateKey, ref)
                }
            }}
            onLayout={(event) => {
                const { height } = event.nativeEvent.layout
                onDayLayout(dateKey, { height })
            }}
            style={[
                styles.dateSection,
                isDropTarget && styles.dateSectionDropTarget,
            ]}
        >
            <View style={styles.dateHeaderContainer}>
                <CustomText style={styles.dateHeader}>
                    {capitalizedDate}
                    {isToday ? ' (Tänään)' : ''}
                </CustomText>
                <Button
                    title="Lisää ateria"
                    onPress={() => onAddMeal(date)}
                    style={styles.primaryButton}
                    textStyle={styles.buttonText}
                />
            </View>

            {meals.length > 0 ? (
                <View style={styles.mealsContainer}>
                    {meals.map((meal) => (
                        <View key={meal._id || meal.id}>
                            <DraggableMealItem
                                meal={meal}
                                date={date}
                                onDragStart={onDragStart}
                                onDragging={onDragging}
                                onDragEnd={onDragEnd}
                                onDragPosition={onDragPosition}
                            >
                                <View style={styles.mealItemContainer}>
                                    <TouchableOpacity
                                        onPress={() => onMealPress(meal)}
                                        style={styles.mealContentTouchable}
                                        activeOpacity={0.7}
                                    >
                                        <Image
                                            source={{
                                                uri:
                                                    meal.image?.url ||
                                                    MEAL_PLACEHOLDER_IMAGE_URL,
                                            }}
                                            style={styles.mealImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.mealTextContainer}>
                                            <CustomText
                                                style={styles.mealName}
                                                numberOfLines={2}
                                                ellipsizeMode="tail"
                                            >
                                                {meal.name}
                                            </CustomText>
                                            <CustomText
                                                style={styles.mealType}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {getMealTypeText(
                                                    meal.defaultRoles
                                                )}
                                            </CustomText>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={styles.mealItemActions}>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={(e) => {
                                                e.stopPropagation()
                                                onRemoveMeal(meal, date)
                                            }}
                                            activeOpacity={0.7}
                                            hitSlop={{
                                                top: 10,
                                                bottom: 10,
                                                left: 10,
                                                right: 10,
                                            }}
                                            accessibilityRole="button"
                                            accessibilityLabel="Poista päivältä"
                                        >
                                            <MaterialIcons
                                                name="delete"
                                                size={20}
                                                color="#666"
                                            />
                                        </TouchableOpacity>
                                        <View
                                            style={styles.dragHandle}
                                            accessibilityLabel="Raahaa toiseen päivään"
                                        >
                                            <MaterialIcons
                                                name="drag-indicator"
                                                size={24}
                                                color="#999"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </DraggableMealItem>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={styles.noMealsContainer}>
                    <CustomText style={styles.noMealsText}>
                        Ei aterioita
                    </CustomText>
                </View>
            )}
            {isDropTarget && draggingMeal ? (
                <View style={styles.dropIndicator}>
                    <MaterialIcons
                        name="arrow-downward"
                        size={32}
                        color="#fff"
                    />
                    <CustomText style={styles.dropIndicatorText}>
                        Pudota tänne
                    </CustomText>
                </View>
            ) : null}
        </View>
    )
}

const styles = StyleSheet.create({
    dateSection: {
        backgroundColor: '#F4F0FF',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 0,
        overflow: 'visible',
        position: 'relative',
    },
    dateSectionDropTarget: {
        backgroundColor: '#E8E0FF',
        borderWidth: 2,
        borderColor: '#5844BB',
        borderStyle: 'dashed',
    },
    dateHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        zIndex: 0,
    },
    dateHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        flexWrap: 'wrap',
        color: '#333',
    },
    primaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    mealsContainer: {
        width: '100%',
    },
    mealImage: {
        width: 44,
        height: 44,
        borderRadius: 6,
        marginRight: 10,
        flexShrink: 0,
    },
    mealTextContainer: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
        flexDirection: 'column',
    },
    mealName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
        ...(Platform.OS === 'web'
            ? {
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  hyphens: 'auto',
              }
            : {}),
    },
    mealType: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    mealItemContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 0,
        overflow: 'visible',
        position: 'relative',
    },
    mealContentTouchable: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
        marginRight: 4,
    },
    dragHandle: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        minWidth: 40,
        minHeight: 40,
        flexShrink: 0,
    },
    mealItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        gap: 2,
    },
    deleteButton: {
        backgroundColor: '#e0e0e0',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    noMealsContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noMealsText: {
        color: '#666',
        fontStyle: 'italic',
    },
    dropIndicator: {
        backgroundColor: '#AE9CFC',
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        zIndex: 1,
    },
    dropIndicatorText: {
        color: '#fff',
        fontWeight: 'bold',
    },
})

export default WeekDaySection
