/**
 * Shared form styles used across FormAddMeal, FormAddShoppingList,
 * FormFoodItem and other form components.
 *
 * Import what you need:
 *   import { formStyles, buttonStyles } from '../styles/formStyles'
 */
import { StyleSheet } from 'react-native'

export const buttonStyles = StyleSheet.create({
    /** Päänappi – violetti, pyöreä */
    primaryButton: {
        borderRadius: 25,
        paddingVertical: 7,
        paddingHorizontal: 10,
        elevation: 2,
        backgroundColor: '#9C86FC',
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
    /** Yksittäinen tekstisyöttö – 'form'-variant vastaa CustomInput variant='form' */
    formInput: {
        backgroundColor: 'white',
        borderColor: '#bbb',
        borderStyle: 'solid',
        borderWidth: 1,
        height: 40,
        padding: 10,
        borderRadius: 4,
        marginBottom: 5,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    label: {
        marginTop: 10,
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
    inputError: {
        borderColor: '#e53e3e',
        borderWidth: 2,
    },
})
