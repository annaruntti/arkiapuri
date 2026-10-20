/**
 * Scroll a meal form ScrollView to the first validation error field.
 * Order: name → recipe → roles → foodItems
 */
export const scrollMealFormToFirstError = ({
    rhfErrors,
    customErrors,
    refs,
    scrollViewRef,
}) => {
    let targetRef = null
    if (rhfErrors?.name) {
        targetRef = refs.nameErrorRef
    } else if (customErrors?.recipeSteps) {
        targetRef = refs.recipeErrorRef
    } else if (customErrors?.roles) {
        targetRef = refs.rolesErrorRef
    } else if (customErrors?.foodItems) {
        targetRef = refs.foodItemsErrorRef
    }
    if (targetRef?.current && scrollViewRef?.current) {
        targetRef.current.measureLayout(
            scrollViewRef.current,
            (_x, y) => {
                scrollViewRef.current.scrollTo({
                    y: Math.max(0, y - 24),
                    animated: true,
                })
            },
            () => {}
        )
    }
}
