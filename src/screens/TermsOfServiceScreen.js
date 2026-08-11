import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import CustomText from '../components/CustomText'
import { useResponsiveDimensions } from '../utils/responsive'

const TermsOfServiceScreen = () => {
    const { isDesktop, isTablet } = useResponsiveDimensions()

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
                styles.scrollContent,
                (isDesktop || isTablet) && styles.wideScrollContent,
            ]}
            showsVerticalScrollIndicator
        >
            <View
                style={[
                    styles.content,
                    (isDesktop || isTablet) && styles.wideContent,
                ]}
            >
                <CustomText style={styles.pageTitle}>Käyttöehdot</CustomText>
                <CustomText style={styles.lastUpdated}>
                    Viimeksi päivitetty: 10.11.2025
                </CustomText>

                <CustomText style={styles.intro}>
                    Tervetuloa käyttämään Arkiapuri-sovellusta! Nämä käyttöehdot
                    määrittelevät oikeutesi ja velvollisuutesi sovelluksen
                    käyttäjänä. Käyttämällä sovellusta hyväksyt nämä ehdot.
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
        </ScrollView>
    )
}

export default TermsOfServiceScreen

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    wideScrollContent: {
        paddingHorizontal: 40,
        paddingVertical: 40,
        alignItems: 'center',
    },
    content: {
        width: '100%',
        maxWidth: 800,
    },
    wideContent: {
        width: '100%',
        maxWidth: 800,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
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
