import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import {
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import CustomText from '../components/CustomText'
import { useResponsiveDimensions } from '../utils/responsive'

const TermsOfServiceScreen = () => {
    const navigation = useNavigation()
    const { isDesktop, isTablet } = useResponsiveDimensions()

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
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={24} color="#1f2937" />
                </TouchableOpacity>
                <CustomText style={styles.headerTitle}>Käyttöehdot</CustomText>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                <View style={getContainerStyle()}>
                    <View style={getContentStyle()}>
                        <CustomText style={styles.lastUpdated}>
                            Viimeksi päivitetty: 10.11.2025
                        </CustomText>

                        <CustomText style={styles.intro}>
                            Tervetuloa käyttämään Arkiapuri-sovellusta! Nämä
                            käyttöehdot määrittelevät oikeutesi ja
                            velvollisuutesi sovelluksen käyttäjänä. Käyttämällä
                            sovellusta hyväksyt nämä ehdot.
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            1. Palvelun kuvaus
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Arkiapuri on perheen arjen hallintaan suunniteltu
                            sovellus, joka tarjoaa työkaluja
                            ateriasuunnitteluun, ostoslistan hallintaan,
                            ruokavaraston seurantaan ja ruokalukujärjestyksen
                            koordinointiin.
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            2. Käyttäjätili
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            • Rekisteröityessäsi luot henkilökohtaisen
                            käyttäjätilin{'\n'}• Olet vastuussa tilisi
                            turvallisuudesta ja salasanan suojaamisesta{'\n'}•
                            Et saa jakaa kirjautumistietojasi muiden kanssa
                            {'\n'}• Ilmoita meille välittömästi, jos epäilet
                            tiliisi kohdistunutta luvat­onta käyttöä
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            3. Perheen jäsenet ja jaettu sisältö
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            • Voit kutsua muita käyttäjiä perheesi jäseniksi
                            {'\n'}• Perheen jäsenet näkevät jaetun sisällön
                            (ateriat, ostoslistat, ruokavaraston){'\n'}• Olet
                            vastuussa kutsumistasi henkilöistä{'\n'}• Voit
                            poistua perheestä tai poistaa muita jäseniä milloin
                            tahansa
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            4. Käyttäjän velvollisuudet
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Sitoudut:{'\n'}• Käyttämään palvelua vain laillisiin
                            tarkoituksiin{'\n'}• Olemaan loukkaamatta muiden
                            käyttäjien oikeuksia{'\n'}• Olemaan jakamatta
                            loukkaavaa tai laitonta sisältöä{'\n'}• Olemaan
                            yrittämättä häiritä palvelun toimintaa{'\n'}•
                            Antamaan totuudenmukaisia tietoja rekisteröityessä
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            5. Immateriaalioikeudet
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            • Sovellus ja sen sisältö ovat tekijänoikeudella
                            suojattuja{'\n'}• Sinulla on oikeus käyttää
                            sovellusta henkilökohtaisiin tarkoituksiin{'\n'}• Et
                            saa kopioida, muokata tai levittää sovellusta tai
                            sen osia{'\n'}• Omistatte luomanne sisällön
                            (reseptit, listat)
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            6. Palvelun saatavuus
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            • Pyrimme pitämään palvelun käytettävissä 24/7{'\n'}
                            • Emme kuitenkaan takaa keskeytyksitöntä toimintaa
                            {'\n'}• Voimme tehdä huoltotöitä ilman
                            ennakkoilmoitusta{'\n'}• Pidätämme oikeuden muuttaa
                            tai lopettaa palvelu
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            7. Vastuunrajoitus
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            • Palvelu tarjotaan "sellaisena kuin se on"{'\n'}•
                            Emme vastaa palvelun käytöstä aiheutuvista
                            vahingoista{'\n'}• Emme vastaa kadonneen datan
                            palauttamisesta{'\n'}• Suosittelemme
                            varmuuskopioimaan tärkeät tiedot
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            8. Tilin sulkeminen
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            • Voit sulkea tilisi milloin tahansa asetuksista
                            {'\n'}• Voimme sulkea tilin, jos rikot käyttöehtoja
                            {'\n'}• Tilin sulkemisen jälkeen tietosi poistetaan
                            30 päivän kuluttua
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            9. Muutokset käyttöehtoihin
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            • Voimme päivittää käyttöehtoja aika ajoin{'\n'}•
                            Ilmoitamme merkittävistä muutoksista sovelluksessa
                            {'\n'}• Jatkamalla palvelun käyttöä hyväksyt
                            muutokset
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            10. Sovellettava laki
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Näihin ehtoihin sovelletaan Suomen lakia.
                            Mahdolliset riita-asiat ratkaistaan Suomen
                            tuomioistuimissa.
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            11. Yhteystiedot
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Jos sinulla on kysyttävää käyttöehdoista, ota
                            yhteyttä:{'\n'}
                            Sähköposti: tialaanna@gmail.com
                        </CustomText>

                        <View style={styles.footer}>
                            <CustomText style={styles.footerText}>
                                © 2025 Arkiapuri. Kaikki oikeudet pidätetään.
                            </CustomText>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default TermsOfServiceScreen

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        ...(Platform.OS === 'web' && {
            cursor: 'pointer',
        }),
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginLeft: 12,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    desktopContainer: {
        paddingHorizontal: 40,
        paddingVertical: 40,
        alignItems: 'center',
        backgroundColor: '#fafafa',
    },
    tabletContainer: {
        paddingHorizontal: 32,
        paddingVertical: 32,
        alignItems: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 800,
    },
    desktopContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 40,
        ...(Platform.OS === 'web' && {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }),
    },
    tabletContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 32,
        ...(Platform.OS === 'web' && {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }),
    },
    lastUpdated: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    intro: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 24,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 24,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 15,
        color: '#4b5563',
        lineHeight: 24,
        marginBottom: 16,
    },
    footer: {
        marginTop: 40,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
})
