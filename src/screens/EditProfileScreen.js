import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import Button from '../components/Button'
import CustomInput from '../components/CustomInput'
import CustomRadioButton from '../components/CustomRadioButton'
import CustomText from '../components/CustomText'
import ResponsiveLayout from '../components/ResponsiveLayout'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import { passwordLengthRules } from '../utils/passwordRules'
import { getShowNutrition } from '../utils/userPreferences'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

const EditProfileScreen = () => {
    const { profile, setProfile, logout } = useLogin()
    const navigation = useNavigation()
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const [loading, setLoading] = useState(false)
    const [showPasswordFields, setShowPasswordFields] = useState(false)
    const [showNutrition, setShowNutrition] = useState(
        getShowNutrition(profile)
    )

    const { control, handleSubmit, watch, reset } = useForm({
        defaultValues: {
            username: profile?.username || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

    const newPassword = watch('newPassword')

    const onSavePressed = async (data) => {
        try {
            setLoading(true)
            const token = await storage.getItem('userToken')

            // Prepare update data
            const updateData = {
                username: data.username,
                preferences: {
                    showNutrition,
                },
            }

            // If user wants to change password
            if (
                showPasswordFields &&
                data.currentPassword &&
                data.newPassword
            ) {
                updateData.currentPassword = data.currentPassword
                updateData.newPassword = data.newPassword
            }

            const response = await axios.put(
                getServerUrl('/profile'),
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (response.data.success) {
                if (response.data.token) {
                    await storage.setItem('userToken', response.data.token)
                }

                // Update profile in context
                setProfile({
                    ...profile,
                    ...response.data.user,
                    username: data.username,
                    preferences: {
                        ...(profile?.preferences || {}),
                        ...(response.data.user?.preferences || {}),
                        showNutrition,
                    },
                    profileImage:
                        response.data.user?.profileImage?.url ||
                        profile?.profileImage ||
                        null,
                })

                // Reset password fields after successful save
                reset({
                    username: data.username,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                })
                setShowPasswordFields(false)

                Alert.alert(
                    'Onnistui!',
                    'Tietosi on päivitetty onnistuneesti.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                )
            } else {
                Alert.alert(
                    'Virhe',
                    response.data.message || 'Tietojen päivitys epäonnistui'
                )
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    'Tietojen päivitys epäonnistui',
                [{ text: 'OK' }]
            )
        } finally {
            setLoading(false)
        }
    }

    const onDeleteAccountPressed = () => {
        console.log('Delete account button pressed')

        // Use window.confirm on web, Alert.alert on mobile
        if (Platform.OS === 'web') {
            const confirmed = window.confirm(
                '⚠️ POISTA TILI PYSYVÄSTI\n\n' +
                    'Oletko varma, että haluat poistaa tilisi?\n\n' +
                    'Tämä toiminto on lopullinen ja kaikki tietosi poistetaan pysyvästi.\n\n' +
                    'Tämä sisältää:\n' +
                    '• Käyttäjätilisi\n' +
                    '• Kaikki luomasi ateriat ja reseptit\n' +
                    '• Ostoslistat\n' +
                    '• Ruokavaraston tiedot\n\n' +
                    'Tätä toimintoa ei voi peruuttaa.'
            )

            console.log('Web confirm result:', confirmed)

            if (confirmed) {
                console.log('Delete confirmed on web')
                confirmDeleteAccount()
            } else {
                console.log('Delete cancelled on web')
            }
        } else {
            // Mobile: Use Alert.alert
            Alert.alert(
                '⚠️ Poista tili pysyvästi',
                'Oletko varma, että haluat poistaa tilisi? Tämä toiminto on lopullinen ja kaikki tietosi poistetaan pysyvästi.\n\nTämä sisältää:\n• Käyttäjätilisi\n• Kaikki luomasi ateriat ja reseptit\n• Ostoslistat\n• Ruokavaraston tiedot\n\nTätä toimintoa ei voi peruuttaa.',
                [
                    {
                        text: 'Peruuta',
                        style: 'cancel',
                        onPress: () => console.log('Delete cancelled'),
                    },
                    {
                        text: 'Poista tili',
                        style: 'destructive',
                        onPress: () => {
                            console.log('Delete confirmed')
                            confirmDeleteAccount()
                        },
                    },
                ]
            )
        }
    }

    const confirmDeleteAccount = async () => {
        try {
            console.log('Starting account deletion...')
            setLoading(true)
            const token = await storage.getItem('userToken')
            console.log('Token retrieved:', token ? 'exists' : 'missing')

            const url = getServerUrl('/profile')
            console.log('Calling DELETE:', url)

            const response = await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            console.log('Delete response:', response.data)

            if (response.data.success) {
                console.log('Account deleted successfully, logging out...')
                // Logout user (clears storage and context)
                await logout()

                Alert.alert(
                    'Tili poistettu',
                    'Tilisi on poistettu onnistuneesti. Toivomme, että palaat takaisin!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                console.log('Navigating to Auth screen')
                                // Navigate to auth screen
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Auth' }],
                                })
                            },
                        },
                    ]
                )
            } else {
                console.error('Delete failed:', response.data.message)
                Alert.alert(
                    'Virhe',
                    response.data.message || 'Tilin poisto epäonnistui'
                )
            }
        } catch (error) {
            console.error('Error deleting account:', error)
            console.error('Error response:', error.response?.data)
            Alert.alert(
                'Virhe',
                error.response?.data?.message || 'Tilin poisto epäonnistui',
                [{ text: 'OK' }]
            )
        } finally {
            setLoading(false)
        }
    }

    const getContainerStyle = () => [
        styles.container,
        isDesktop && styles.desktopContainer,
        isTablet && styles.tabletContainer,
    ]

    const getContentStyle = () => [
        styles.content,
        isDesktop && styles.desktopContent,
        isTablet && styles.tabletContent,
    ]

    return (
        <ResponsiveLayout activeRoute="ProfileStack">
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={getContainerStyle()}>
                    <View style={getContentStyle()}>
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                            >
                                <Feather
                                    name="arrow-left"
                                    size={24}
                                    color="#1f2937"
                                />
                            </TouchableOpacity>
                            <CustomText
                                style={[
                                    styles.title,
                                    isDesktop && styles.desktopTitle,
                                ]}
                            >
                                Muokkaa tietoja
                            </CustomText>
                        </View>

                        <View style={styles.form}>
                            {/* Username */}
                            <CustomInput
                                label="Käyttäjänimi"
                                name="username"
                                control={control}
                                placeholder="Kirjoita käyttäjänimesi"
                                rules={{
                                    required: 'Käyttäjätunnus on pakollinen',
                                    minLength: {
                                        value: 3,
                                        message: 'Vähintään 3 merkkiä',
                                    },
                                    maxLength: {
                                        value: 24,
                                        message: 'Enintään 24 merkkiä',
                                    },
                                }}
                            />

                            {/* Email (read-only) */}
                            <View style={styles.fieldContainer}>
                                <CustomText style={styles.label}>
                                    Sähköpostiosoite
                                </CustomText>
                                <View style={styles.readOnlyField}>
                                    <CustomText style={styles.readOnlyText}>
                                        {profile?.email}
                                    </CustomText>
                                    <CustomText style={styles.helperText}>
                                        Sähköpostia ei voi muuttaa
                                    </CustomText>
                                </View>
                            </View>

                            <View style={styles.fieldContainer}>
                                <CustomText style={styles.label}>
                                    Näyttöasetukset
                                </CustomText>
                                <CustomText style={styles.helperText}>
                                    Näytetäänkö elintarvikkeiden ja aterioiden
                                    kalorit sekä ravintoarvot?
                                </CustomText>
                                <TouchableOpacity
                                    style={[
                                        styles.preferenceOption,
                                        showNutrition &&
                                            styles.preferenceOptionSelected,
                                    ]}
                                    onPress={() => setShowNutrition(true)}
                                    activeOpacity={0.7}
                                >
                                    <CustomRadioButton
                                        status={
                                            showNutrition
                                                ? 'checked'
                                                : 'unchecked'
                                        }
                                        onPress={() => setShowNutrition(true)}
                                    />
                                    <CustomText style={styles.preferenceLabel}>
                                        Kyllä, näytä ravintoarvot
                                    </CustomText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.preferenceOption,
                                        !showNutrition &&
                                            styles.preferenceOptionSelected,
                                    ]}
                                    onPress={() => setShowNutrition(false)}
                                    activeOpacity={0.7}
                                >
                                    <CustomRadioButton
                                        status={
                                            !showNutrition
                                                ? 'checked'
                                                : 'unchecked'
                                        }
                                        onPress={() => setShowNutrition(false)}
                                    />
                                    <CustomText style={styles.preferenceLabel}>
                                        Ei, piilota ravintoarvot
                                    </CustomText>
                                </TouchableOpacity>
                            </View>

                            {/* Password Change Section */}
                            <TouchableOpacity
                                style={styles.passwordToggle}
                                onPress={() =>
                                    setShowPasswordFields(!showPasswordFields)
                                }
                            >
                                <CustomText style={styles.passwordToggleText}>
                                    {showPasswordFields
                                        ? '− Sulje salasanan vaihto'
                                        : '+ Vaihda salasana'}
                                </CustomText>
                            </TouchableOpacity>

                            {showPasswordFields && (
                                <View style={styles.passwordSection}>
                                    <CustomInput
                                        label="Nykyinen salasana"
                                        name="currentPassword"
                                        control={control}
                                        placeholder="Syötä nykyinen salasana"
                                        secureTextEntry
                                        rules={{
                                            required: showPasswordFields
                                                ? 'Nykyinen salasana vaaditaan'
                                                : false,
                                        }}
                                    />

                                    <CustomInput
                                        label="Uusi salasana"
                                        name="newPassword"
                                        control={control}
                                        placeholder="Syötä uusi salasana"
                                        secureTextEntry
                                        rules={{
                                            required: showPasswordFields
                                                ? 'Uusi salasana vaaditaan'
                                                : false,
                                            ...passwordLengthRules,
                                        }}
                                    />

                                    <CustomInput
                                        label="Vahvista uusi salasana"
                                        name="confirmPassword"
                                        control={control}
                                        placeholder="Vahvista uusi salasana"
                                        secureTextEntry
                                        rules={{
                                            required: showPasswordFields
                                                ? 'Vahvista salasana'
                                                : false,
                                            validate: (value) =>
                                                value === newPassword ||
                                                'Salasanat eivät täsmää',
                                        }}
                                    />
                                </View>
                            )}
                        </View>

                        <View style={styles.buttonSection}>
                            <Button
                                title={
                                    loading
                                        ? '⏳ Tallennetaan...'
                                        : 'Tallenna muutokset'
                                }
                                type="PRIMARY"
                                style={styles.primaryButton}
                                onPress={handleSubmit(onSavePressed)}
                                disabled={loading}
                            />
                            <Button
                                title="Peruuta"
                                style={styles.tertiaryButton}
                                type="TERTIARY"
                                onPress={() => navigation.goBack()}
                                disabled={loading}
                            />
                        </View>

                        <View
                            style={[
                                styles.accountSection,
                                { borderTopColor: '#e5e7eb' },
                            ]}
                        >
                            <View style={styles.accountSectionHeader}>
                                <CustomText
                                    style={[
                                        styles.accountSectionTitle,
                                        { color: '#1f2937' },
                                    ]}
                                >
                                    Vaarallinen alue
                                </CustomText>
                                <CustomText style={styles.accountSectionSubtitle}>
                                    Näitä toimintoja ei voi peruuttaa
                                </CustomText>
                            </View>
                            <Button
                                title="Poista tili pysyvästi"
                                type="TERTIARY"
                                fullWidth
                                style={styles.tertiaryButton}
                                onPress={onDeleteAccountPressed}
                                disabled={loading}
                                icon={
                                    <Feather
                                        name="alert-circle"
                                        size={18}
                                        color="#1f2937"
                                    />
                                }
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ResponsiveLayout>
    )
}

export default EditProfileScreen

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20,
        minHeight: '100%',
    },
    desktopContainer: {
        paddingHorizontal: 40,
        paddingVertical: 24,
        alignItems: 'flex-start',
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: 960,
        alignSelf: 'flex-start',
        minHeight: '100%',
    },
    tabletContainer: {
        paddingHorizontal: 32,
        paddingVertical: 24,
        alignItems: 'flex-start',
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: 960,
        alignSelf: 'flex-start',
    },
    content: {
        width: '100%',
        maxWidth: 500,
        marginHorizontal: 'auto',
    },
    desktopContent: {
        maxWidth: 640,
        width: '100%',
        alignSelf: 'flex-start',
        padding: 0,
        marginVertical: 0,
    },
    tabletContent: {
        maxWidth: 640,
        width: '100%',
        alignSelf: 'flex-start',
        padding: 0,
        marginVertical: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        ...(Platform.OS === 'web' && {
            cursor: 'pointer',
        }),
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        flex: 1,
        textAlign: 'center',
        marginRight: 40, // Balance the back button
    },
    desktopTitle: {
        fontSize: 28,
    },
    form: {
        width: '100%',
        gap: 10,
        marginBottom: 32,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    readOnlyField: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    readOnlyText: {
        fontSize: 16,
        color: '#6b7280',
    },
    helperText: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
    },
    preferenceOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginTop: 8,
    },
    preferenceOptionSelected: {
        borderColor: '#5844BB',
        backgroundColor: '#f3f0ff',
    },
    preferenceLabel: {
        fontSize: 15,
        color: '#1f2937',
        flex: 1,
    },
    passwordToggle: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        marginTop: 8,
        ...(Platform.OS === 'web' && {
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: '#e5e7eb',
            },
        }),
        marginBottom: 10,
    },
    passwordToggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5844BB',
        textAlign: 'center',
    },
    passwordSection: {
        gap: 5,
        paddingTop: 8,
    },
    buttonSection: {
        width: '100%',
        gap: 15,
        alignItems: 'center',
    },
    primaryButton: {
        borderRadius: 25,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#AE9CFC',
        elevation: 2,
        width: '100%',
    },
    tertiaryButton: {
        width: '100%',
    },
    accountSection: {
        marginTop: 40,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        width: '100%',
    },
    accountSectionHeader: {
        marginBottom: 16,
    },
    accountSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    accountSectionSubtitle: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 5,
    },
})
