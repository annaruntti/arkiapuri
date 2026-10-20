import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import CustomInput from './CustomInput'
import CustomText from './CustomText'
import DifficultySelector from './DifficultySelector'
import FormDateField from './FormDateField'
import PlannedEatingDates from './PlannedEatingDates'
import CollapsibleFormSection from './CollapsibleFormSection'
import MealCategorySelector from './MealCategorySelector'
import MealRoleSelector from './MealRoleSelector'
import MealServingsStepper from './MealServingsStepper'
import RecipeStepsEditor from './RecipeStepsEditor'
import Info from './Info'
import {
    getMealCategoryText,
    getMealTypeText,
} from '../utils/mealUtils'
import { OVERDUE_COOKING_MESSAGE } from '../utils/mealDates'
import { normalizeRecipeSteps } from '../utils/recipeSteps'

/**
 * Name, recipe, image, difficulty, times, roles, category, and date fields
 * for the create-meal form.
 */
const MealFormBasicsSection = ({
    control,
    nameErrorRef,
    recipeErrorRef,
    rolesErrorRef,
    recipeSteps,
    setRecipeSteps,
    formErrors,
    setFormErrors,
    mealImage,
    onPickImage,
    difficultyLevel,
    setDifficultyLevel,
    servings,
    onServingsChange,
    selectedRoles,
    setSelectedRoles,
    rolesExpanded,
    setRolesExpanded,
    mealCategory,
    setMealCategory,
    plannedCookingDate,
    onCookingDateChange,
    plannedEatingDates,
    setPlannedEatingDates,
}) => (
    <>
        <View ref={nameErrorRef}>
            <CustomInput
                control={control}
                name="name"
                label="Aterian nimi"
                placeholder="Esim. kasvisrisotto"
                rules={{
                    required: 'Aterian nimi on pakollinen tieto',
                }}
                variant="form"
            />
        </View>
        <View ref={recipeErrorRef}>
            <CustomText style={styles.label}>Valmistusohje</CustomText>
            <RecipeStepsEditor
                steps={recipeSteps}
                onChange={(next) => {
                    setRecipeSteps(next)
                    if (normalizeRecipeSteps(next).length) {
                        setFormErrors((e) => ({
                            ...e,
                            recipeSteps: undefined,
                        }))
                    }
                }}
            />
            {formErrors.recipeSteps && (
                <View style={styles.errorRow}>
                    <MaterialIcons name="error" color="#e53e3e" size={14} />
                    <CustomText style={styles.errorMsg}>
                        {formErrors.recipeSteps}
                    </CustomText>
                </View>
            )}
        </View>
        <CustomText style={styles.label}>Aterian kuva</CustomText>
        <TouchableOpacity style={styles.imagePicker} onPress={onPickImage}>
            {mealImage ? (
                <Image
                    source={{ uri: mealImage.uri }}
                    style={styles.selectedImage}
                />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <MaterialIcons
                        name="add-a-photo"
                        size={40}
                        color="#5844BB"
                    />
                    <CustomText style={styles.imagePlaceholderText}>
                        Lisää kuva
                    </CustomText>
                </View>
            )}
        </TouchableOpacity>
        <CustomText style={styles.label}>Vaikeustaso (1-5)</CustomText>
        <DifficultySelector
            value={difficultyLevel}
            onSelect={setDifficultyLevel}
        />
        <CustomInput
            control={control}
            name="cookingTime"
            label="Valmistusaika (min)"
            placeholder="Esim. 30"
            variant="form"
            keyboardType="numeric"
        />

        <MealServingsStepper value={servings} onChange={onServingsChange} />

        <View ref={rolesErrorRef} style={styles.collapsibleFormSection}>
            <CollapsibleFormSection
                label="Aterian tyyppi"
                summary={
                    selectedRoles.length > 0
                        ? getMealTypeText(selectedRoles)
                        : ''
                }
                expanded={rolesExpanded}
                onExpandedChange={setRolesExpanded}
            >
                <MealRoleSelector
                    value={selectedRoles}
                    onSelect={(next) => {
                        setSelectedRoles(next)
                        if (next.length > 0) {
                            setFormErrors((e) => ({
                                ...e,
                                roles: undefined,
                            }))
                        }
                    }}
                />
            </CollapsibleFormSection>
            {formErrors.roles && (
                <View style={styles.errorRow}>
                    <MaterialIcons name="error" color="#e53e3e" size={14} />
                    <CustomText style={styles.errorMsg}>
                        {formErrors.roles}
                    </CustomText>
                </View>
            )}
        </View>

        <CollapsibleFormSection
            label="Ruokalaji"
            style={styles.collapsibleFormSection}
            summary={
                mealCategory.length > 0
                    ? getMealCategoryText(mealCategory)
                    : ''
            }
        >
            <MealCategorySelector
                value={mealCategory}
                onSelect={setMealCategory}
            />
        </CollapsibleFormSection>
        <FormDateField
            label="Suunniteltu valmistuspäivä"
            value={plannedCookingDate}
            onChange={onCookingDateChange}
            minimumDate={new Date()}
            warnIfPast
            overdueMessage={OVERDUE_COOKING_MESSAGE}
            testID="plannedCookingDate"
            labelRight={
                <Info
                    title="Suunniteltu valmistuspäivä"
                    content="Tässä voit valita päivän, jolloin aiot valmistaa tämän aterian. Valittuasi suunnitellun valmistuspäivän, ateria ilmestyy lukujärjestykseesi kyseisen päivän kohdalle. Voit muuttaa päivämäärää myöhemmin tarvittaessa. Luotu ateria jää myös talteen Ateriat-listaasi ja voit asettaa aina uudelleen suunnitellun valmistuspäivämää sille kun haluat taas valmistaa kyseisen aterian."
                />
            }
        />

        <PlannedEatingDates
            dates={plannedEatingDates}
            onChange={setPlannedEatingDates}
            cookingDate={plannedCookingDate}
            label="Suunnitellut syöntipäivät (valinnainen)"
            labelRight={
                <Info
                    title="Suunnitellut syöntipäivät"
                    content="Voit lisätä useita päivämääriä, jos aiot syödä saman aterian useampana päivänä. Jos jätät tämän tyhjäksi, syöntipäiväksi asetetaan sama päivä kuin valmistuspäivä."
                />
            }
            style={styles.eatingDatesContainer}
        />
    </>
)

const styles = StyleSheet.create({
    label: {
        paddingTop: 10,
        marginBottom: 5,
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    errorMsg: {
        color: '#e53e3e',
        marginLeft: 5,
        fontSize: 13,
    },
    collapsibleFormSection: {
        marginBottom: 10,
    },
    imagePicker: {
        borderWidth: 2,
        borderColor: '#5844BB',
        borderStyle: 'dashed',
        borderRadius: 8,
        marginBottom: 20,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    imagePlaceholderText: {
        marginTop: 8,
        color: '#5844BB',
        fontSize: 16,
        fontWeight: '500',
    },
    selectedImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    eatingDatesContainer: {
        marginBottom: 15,
        paddingTop: 0,
        paddingBottom: 0,
        borderBottomWidth: 0,
    },
})

export default MealFormBasicsSection
