import { StyleSheet } from 'react-native'
import DateSelector from './DateSelector'
import FormAddMeal from './FormAddMeal'
import MealItemDetail from './MealItemDetail'
import MealSelectionList from './MealSelectionList'
import ResponsiveModal from './ResponsiveModal'

/**
 * Stacked meal-select modal for the week calendar:
 * select → create meal → meal details (with back).
 */
const WeekMealSelectModal = ({
    visible,
    view,
    dates,
    selectedDates,
    availableMeals,
    selectDetailMeal,
    selectDetailsTitle,
    mealDetailBackRef,
    onClose,
    onToggleDateSelection,
    onClearSelection,
    onMealSelect,
    onMealDetails,
    onCreateMeal,
    onCreateSubmit,
    onCloseDetails,
    onMealUpdate,
    onDetailsHeaderChange,
}) => (
    <ResponsiveModal
        visible={visible}
        onClose={onClose}
        title={
            view === 'details'
                ? selectDetailsTitle || selectDetailMeal?.name || 'Ateria'
                : view === 'create'
                  ? 'Luo uusi ateria'
                  : 'Valitse ateria ja päivät'
        }
        showBackButton={view === 'create' || view === 'details'}
        maxWidth={640}
        contentStyle={styles.mealSelectModalContent}
        bodyStyle={
            view === 'select'
                ? styles.mealSelectModalBody
                : styles.mealCreateModalBody
        }
    >
        {view === 'create' ? (
            <FormAddMeal onSubmit={onCreateSubmit} />
        ) : view === 'details' ? (
            <MealItemDetail
                embedded
                meal={selectDetailMeal}
                visible
                onClose={onCloseDetails}
                onUpdate={onMealUpdate}
                backHandlerRef={mealDetailBackRef}
                onHeaderStateChange={onDetailsHeaderChange}
            />
        ) : (
            <MealSelectionList
                header={
                    <DateSelector
                        dates={dates}
                        selectedDates={selectedDates}
                        onToggleDateSelection={onToggleDateSelection}
                        onClearSelection={onClearSelection}
                    />
                }
                availableMeals={availableMeals}
                selectedDates={selectedDates}
                onMealSelect={onMealSelect}
                onMealDetails={onMealDetails}
                onCreateMeal={onCreateMeal}
                showAllRoles={false}
            />
        )}
    </ResponsiveModal>
)

const styles = StyleSheet.create({
    mealSelectModalContent: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    mealSelectModalBody: {
        paddingHorizontal: 0,
    },
    mealCreateModalBody: {
        paddingHorizontal: 20,
    },
})

export default WeekMealSelectModal
