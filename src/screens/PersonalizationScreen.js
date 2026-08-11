import React, { useState } from 'react'
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import axios from 'axios'
import { useNavigation, useRoute } from '@react-navigation/native'
import Button from '../components/Button'
import CustomRadioButton from '../components/CustomRadioButton'
import CustomText from '../components/CustomText'
import { useLogin } from '../context/LoginProvider'
import { getServerUrl } from '../utils/getServerUrl'
import { getShowNutrition } from '../utils/userPreferences'
import { useResponsiveDimensions } from '../utils/responsive'
import storage from '../utils/storage'

const PersonalizationScreen = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { isDesktop, isTablet } = useResponsiveDimensions()
    const { setProfile, setIsLoggedIn, profile } = useLogin()
    const initialShowNutrition = getShowNutrition(
        route.params?.userData || profile
    )
    const [showNutrition, setShowNutrition] = useState(initialShowNutrition)
    const [loading, setLoading] = useState(false)

    const completeLogin = async (userData) => {
        const token =
            route.params?.token || (await storage.getItem('userToken'))
        if (token) {
            await storage.setItem('userToken', token)
        }
        await storage.setItem('profile', JSON.stringify(userData))
        await storage.setItem('isLoggedIn', 'true')
        setProfile({
            ...userData,
            profileImage:
                userData?.profileImage?.url || userData?.profileImage || null,
        })
        setIsLoggedIn(true)
    }

    const onContinue = async () => {
        try {
            setLoading(true)
            const token =
                route.params?.token || (await storage.getItem('userToken'))
            if (!token) {
                throw new Error('No token found')
            }

            const response = await axios.put(
                getServerUrl('/profile'),
                {
                    preferences: {
                        showNutrition,
                        personalizationCompleted: true,
                    },
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            if (!response.data.success) {
                throw new Error(
                    response.data.message ||
                        'Preferenssien tallennus epäonnistui'
                )
            }

            const userData = {
                ...(route.params?.userData || profile || {}),
                ...response.data.user,
            }
            await completeLogin(userData)

            if (route.params?.fromPrompt) {
                navigation.navigate('Main')
            } else {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }],
                })
            }
        } catch (error) {
            console.error('Error saving personalization:', error)
            Alert.alert(
                'Virhe',
                error.response?.data?.message ||
                    error.message ||
                    'Asetusten tallennus epäonnistui'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
                styles.container,
                (isDesktop || isTablet) && styles.wideContainer,
            ]}
        >
            <CustomText
                style={[
                    styles.title,
                    (isDesktop || isTablet) && styles.wideTitle,
                ]}
            >
                Personoi Arkiapuri
            </CustomText>
            <CustomText style={styles.subtitle}>
                Voit muuttaa valintoja myöhemmin profiilissa kohdasta Muokkaa
                tietoja.
            </CustomText>

            <View style={styles.card}>
                <CustomText style={styles.question}>
                    Haluatko nähdä elintarvikkeiden ja aterioiden kalorit sekä
                    ravintoarvot?
                </CustomText>
                <CustomText style={styles.hint}>
                    Jos et, niitä ei näytetä eikä kysytä tuotetta lisättäessä.
                </CustomText>

                <TouchableOpacity
                    style={[
                        styles.optionButton,
                        showNutrition && styles.optionButtonSelected,
                    ]}
                    onPress={() => setShowNutrition(true)}
                    activeOpacity={0.7}
                >
                    <CustomRadioButton
                        status={showNutrition ? 'checked' : 'unchecked'}
                        onPress={() => setShowNutrition(true)}
                    />
                    <CustomText style={styles.optionLabel}>
                        Kyllä, näytä ravintoarvot
                    </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.optionButton,
                        !showNutrition && styles.optionButtonSelected,
                    ]}
                    onPress={() => setShowNutrition(false)}
                    activeOpacity={0.7}
                >
                    <CustomRadioButton
                        status={!showNutrition ? 'checked' : 'unchecked'}
                        onPress={() => setShowNutrition(false)}
                    />
                    <CustomText style={styles.optionLabel}>
                        Ei, piilota ravintoarvot
                    </CustomText>
                </TouchableOpacity>
            </View>

            <Button
                title={loading ? 'Tallennetaan...' : 'Jatka'}
                onPress={onContinue}
                disabled={loading}
                style={styles.continueButton}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        padding: 24,
        paddingBottom: 48,
        maxWidth: 640,
        width: '100%',
        alignSelf: 'center',
    },
    wideContainer: {
        paddingHorizontal: 40,
        paddingVertical: 40,
        alignSelf: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    wideTitle: {
        fontSize: 28,
    },
    subtitle: {
        fontSize: 15,
        color: '#6b7280',
        marginBottom: 24,
        lineHeight: 22,
    },
    card: {
        marginBottom: 28,
        gap: 10,
    },
    question: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
        lineHeight: 24,
    },
    hint: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 8,
        lineHeight: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 14,
        minHeight: 48,
    },
    optionButtonSelected: {
        borderColor: '#5844BB',
        backgroundColor: '#f3f0ff',
    },
    optionLabel: {
        fontSize: 16,
        color: '#1f2937',
        flex: 1,
    },
    continueButton: {
        marginTop: 8,
        alignSelf: 'flex-start',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 24,
        minHeight: 44,
        backgroundColor: '#AE9CFC',
    },
})

export default PersonalizationScreen
