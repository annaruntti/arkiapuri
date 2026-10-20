import { Image, Platform, StyleSheet, View } from 'react-native'

import { MEAL_PLACEHOLDER_IMAGE_URL } from '../constants/images'
import { getMealTypeText } from '../utils/mealUtils'
import CustomText from './CustomText'
import MealItemDetail from './MealItemDetail'
import WeekMealSelectModal from './WeekMealSelectModal'
import WeekMoveMealModal from './WeekMoveMealModal'

/**
 * Modals + drag ghost for TableWeek.
 */
const TableWeekOverlays = ({
    isModalVisible,
    mealSelectView,
    dates,
    selectedDates,
    availableMeals,
    selectDetailMeal,
    selectDetailsTitle,
    mealDetailBackRef,
    createMealBackRef,
    createMealNestedTitle,
    onCreateHeaderChange,
    onCloseSelectModal,
    onToggleDateSelection,
    onClearSelection,
    onMealSelect,
    onMealDetails,
    onCreateMeal,
    onCreateSubmit,
    onCloseDetails,
    onMealUpdate,
    onDetailsHeaderChange,
    moveMealModalVisible,
    mealToMove,
    moveFromDate,
    onCloseMoveModal,
    onSelectMoveDay,
    selectedMeal,
    detailModalVisible,
    onCloseDetail,
    draggingMeal,
    dragPosition,
}) => (
    <>
        <WeekMealSelectModal
            visible={isModalVisible}
            view={mealSelectView}
            dates={dates}
            selectedDates={selectedDates}
            availableMeals={availableMeals}
            selectDetailMeal={selectDetailMeal}
            selectDetailsTitle={selectDetailsTitle}
            mealDetailBackRef={mealDetailBackRef}
            createMealBackRef={createMealBackRef}
            createMealNestedTitle={createMealNestedTitle}
            onCreateHeaderChange={onCreateHeaderChange}
            onClose={onCloseSelectModal}
            onToggleDateSelection={onToggleDateSelection}
            onClearSelection={onClearSelection}
            onMealSelect={onMealSelect}
            onMealDetails={onMealDetails}
            onCreateMeal={onCreateMeal}
            onCreateSubmit={onCreateSubmit}
            onCloseDetails={onCloseDetails}
            onMealUpdate={onMealUpdate}
            onDetailsHeaderChange={onDetailsHeaderChange}
        />
        <WeekMoveMealModal
            visible={moveMealModalVisible}
            meal={mealToMove}
            fromDate={moveFromDate}
            dates={dates}
            onClose={onCloseMoveModal}
            onSelectDay={onSelectMoveDay}
        />
        <MealItemDetail
            meal={selectedMeal}
            visible={detailModalVisible}
            onClose={onCloseDetail}
            onUpdate={onMealUpdate}
        />
        {draggingMeal ? (
            <View
                style={[
                    styles.dragOverlay,
                    {
                        left: dragPosition.x - 140,
                        top: dragPosition.y - 140,
                        pointerEvents: 'none',
                    },
                ]}
            >
                <View style={styles.mealItemContainer}>
                    <View style={styles.mealItemInfo}>
                        <Image
                            source={{
                                uri:
                                    draggingMeal.image?.url ||
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
                                {draggingMeal.name}
                            </CustomText>
                            <CustomText
                                style={styles.mealType}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {getMealTypeText(draggingMeal.defaultRoles)}
                            </CustomText>
                        </View>
                    </View>
                </View>
            </View>
        ) : null}
    </>
)

const styles = StyleSheet.create({
    dragOverlay: {
        position: 'absolute',
        zIndex: 100,
        elevation: 100,
        opacity: 0.9,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        width: 300,
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
    mealItemInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
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
})

export default TableWeekOverlays
