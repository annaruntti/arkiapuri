/**
 * Shared form styles used across FormAddMeal, FormAddShoppingList,
 * FormFoodItem and other form components.
 *
 * Import what you need:
 *   import { formStyles, buttonStyles } from '../styles/formStyles'
 *
 * Spacing model (form fields):
 * - Each field group has marginBottom: FIELD_SPACING
 * - Labels have only marginBottom (no marginTop)
 * - CustomInput variant="form" uses the same bottom spacing
 */
import { StyleSheet } from 'react-native'

/** Vertical space between form fields */
export const FIELD_SPACING = 16

/** Space between a field label and its control */
export const LABEL_SPACING = 6

export const buttonStyles = StyleSheet.create({
    /** Päänappi – violetti, pyöreä */
    primaryButton: {
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 10,
        elevation: 2,
        backgroundColor: '#AE9CFC',
        width: '100%',
        marginBottom: 10,
    },
    desktopPrimaryButton: {
        maxWidth: 300,
        alignSelf: 'center',
    },
    /** Toissijainen nappi – sinivihreä, pyöreä */
    secondaryButton: {
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        width: '100%',
        marginBottom: 10,
    },
    desktopSecondaryButton: {
        flex: 1,
        width: 'auto',
    },
    /** Kolmasluokan nappi – valkoinen, violetti reunus */
    tertiaryButton: {
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 10,
        elevation: 2,
        backgroundColor: '#fff',
        borderWidth: 3,
        borderColor: '#5844BB',
        width: 'auto',
    },
    tertiaryButtonDesktop: {
        alignSelf: 'flex-start',
        minWidth: 200,
        maxWidth: 250,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    /** Nappirivi rinnakkain (desktop) */
    buttonsRowDesktop: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        paddingTop: 20,
    },
    /** Nappipino allekkain (mobile) */
    buttonsColumnMobile: {
        flexDirection: 'column',
        gap: 15,
        width: '100%',
        paddingTop: 20,
    },
    buttonGroup: {
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
        paddingTop: 15,
    },
})

export const formStyles = StyleSheet.create({
    /** Wrapper for one labeled form field */
    fieldGroup: {
        width: '100%',
        marginBottom: FIELD_SPACING,
    },
    /** Shared field label (matches CustomInput form label) */
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: LABEL_SPACING,
    },
    /** Input sitting next to a unit/metric suffix inside a fieldGroup */
    inputInRow: {
        flex: 1,
        marginTop: 0,
        marginBottom: 0,
    },
    /** Row: input + trailing unit/icon (€, kcal, calendar…) */
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: 10,
    },
    /** Fixed-width trailing slot so suffixes/icons align across fields */
    inputTrailing: {
        width: 48,
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputMetric: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
        textAlign: 'center',
    },
    /** Form-styled date input (matches CustomInput form height/look) */
    dateInput: {
        width: '100%',
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderWidth: 1,
        height: 40,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 4,
        fontSize: 16,
        color: '#333',
        fontFamily: 'FiraSans-Regular',
    },
    /** Yksittäinen tekstisyöttö – 'form'-variant vastaa CustomInput variant='form' */
    formInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 0,
    },
    errorMsg: {
        color: '#e53e3e',
        marginLeft: 5,
        fontSize: 13,
    },
    inputError: {
        borderColor: '#e53e3e',
        borderWidth: 2,
    },
})
