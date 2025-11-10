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

const PrivacyPolicyScreen = () => {
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
                <CustomText style={styles.headerTitle}>
                    Tietosuojaseloste
                </CustomText>
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
                            Arkiapuri kunnioittaa käyttäjiensä yksityisyyttä.
                            Tämä tietosuojaseloste kertoo, miten keräämme,
                            käsittelemme ja suojaamme henkilötietojasi EU:n
                            yleisen tietosuoja-asetuksen (GDPR) mukaisesti.
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            1. Rekisterinpitäjä
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Arkiapuri{'\n'}
                            Sähköposti: tialaanna@gmail.com
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            2. Kerättävät tiedot
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Keräämme seuraavia tietoja:{'\n\n'}
                            <CustomText style={styles.bold}>
                                Rekisteröitymistiedot:
                            </CustomText>
                            {'\n'}• Käyttäjänimi{'\n'}• Sähköpostiosoite{'\n'}•
                            Salasana (salattu){'\n'}• Profiilikuva (valinnainen)
                            {'\n\n'}
                            <CustomText style={styles.bold}>
                                Käyttötiedot:
                            </CustomText>
                            {'\n'}• Luomasi ateriat, reseptit ja niiden
                            ainesosat{'\n'}• Ostoslistat{'\n'}• Ruokavaraston
                            tiedot{'\n'}• Aterioiden aikataulusuunnitelmat{'\n'}
                            • Perheen jäsenyystiedot{'\n\n'}
                            <CustomText style={styles.bold}>
                                Tekniset tiedot:
                            </CustomText>
                            {'\n'}• IP-osoite{'\n'}• Laitteen tyyppi ja
                            käyttöjärjestelmä{'\n'}• Sovelluksen käyttöajat
                            {'\n'}• Virhelokitiedot
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            3. Tietojen käyttötarkoitukset
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Käytämme tietojasi seuraaviin tarkoituksiin:{'\n'}•
                            Käyttäjätilin luominen ja hallinta{'\n'}• Palvelun
                            tarjoaminen ja toiminnallisuuksien mahdollistaminen
                            {'\n'}• Asiakastuen antaminen{'\n'}• Palvelun
                            parantaminen ja kehittäminen{'\n'}• Viestintä
                            käyttäjien kanssa{'\n'}• Turvallisuuden ja
                            väärinkäytösten estäminen
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            4. Tietojen säilytysaika
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            • Käyttäjätiedot säilytetään niin kauan kuin tili on
                            aktiivinen{'\n'}• Tilin sulkemisen jälkeen tiedot
                            poistetaan 30 päivän kuluttua{'\n'}• Lakisääteiset
                            tiedot (esim. laskutus) säilytetään lainsäädännön
                            edellyttämän ajan{'\n'}• Lokitiedot säilytetään 12
                            kuukautta
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            5. Tietojen luovuttaminen
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Emme myy, vuokraa tai luovuta henkilötietojasi
                            kolmansille osapuolille paitsi:{'\n'}•
                            Palveluntarjoajille (hosting, pilvipalvelut){'\n'}•
                            Lakisääteisistä syistä viranomaisille{'\n'}• Sinun
                            suostumuksellasi{'\n\n'}
                            Palveluntarjoajat ovat sitoutuneet tietosuojaan ja
                            käsittelevät tietojasi vain ohjeidemme mukaisesti.
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            6. Tietojen sijainti
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            • Tietosi tallennetaan turvallisille palvelimille
                            EU:n alueella{'\n'}• Noudatamme GDPR:n mukaisia
                            tiedonsiirto-ohjeita{'\n'}• Käytämme salattua
                            yhteyttä (HTTPS) kaiken tiedonsiirron aikana
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            7. Tietoturva
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Suojaamme tietojasi seuraavilla toimenpiteillä:
                            {'\n'}• Salasanat tallennetaan salattuna (bcrypt)
                            {'\n'}• Käytämme SSL/TLS-salausta{'\n'}• Rajoitamme
                            pääsyn tietoihin vain valtuutetuille henkilöille
                            {'\n'}• Varmuuskopioimme tiedot säännöllisesti{'\n'}
                            • Seuraamme järjestelmiä tietoturvauhkien varalta
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            8. Oikeutesi
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Sinulla on seuraavat oikeudet:{'\n\n'}
                            <CustomText style={styles.bold}>
                                Tarkastusoikeus:
                            </CustomText>{' '}
                            Voit pyytää kopion tallentamistamme tiedoista
                            {'\n\n'}
                            <CustomText style={styles.bold}>
                                Oikaisuoikeus:
                            </CustomText>{' '}
                            Voit pyytää virheellisten tietojen korjaamista
                            {'\n\n'}
                            <CustomText style={styles.bold}>
                                Poisto-oikeus:
                            </CustomText>{' '}
                            Voit pyytää tietojesi poistamista ("oikeus tulla
                            unohdetuksi")
                            {'\n\n'}
                            <CustomText style={styles.bold}>
                                Käsittelyn rajoittaminen:
                            </CustomText>{' '}
                            Voit pyytää tietojesi käsittelyn rajoittamista
                            {'\n\n'}
                            <CustomText style={styles.bold}>
                                Siirto-oikeus:
                            </CustomText>{' '}
                            Voit pyytää tietojesi siirtämistä toiseen palveluun
                            {'\n\n'}
                            <CustomText style={styles.bold}>
                                Vastustamisoikeus:
                            </CustomText>{' '}
                            Voit vastustaa tietojesi käsittelyä{'\n\n'}
                            <CustomText style={styles.bold}>
                                Suostumuksen peruutus:
                            </CustomText>{' '}
                            Voit perua antamasi suostumuksen
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            9. Evästeet (Cookies)
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Sovellus käyttää evästeitä:{'\n'}• Välttämättömät
                            evästeet (kirjautuminen, istunnon ylläpito)
                            {'\n'}• Toiminnalliset evästeet (käyttökokemuksen
                            parantaminen)
                            {'\n'}• Analytiikkaevästeet (käytön seuranta ja
                            parantaminen){'\n\n'}
                            Voit hallita evästeasetuksia selaimesi asetuksista.
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            10. Alaikäiset
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Palvelu on tarkoitettu 18 vuotta täyttäneille. Emme
                            tietoisesti kerää alle 18-vuotiaiden tietoja. Jos
                            huomaat, että alaikäinen on rekisteröitynyt, ota
                            yhteyttä.
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            11. Muutokset tietosuojaselosteeseen
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Voimme päivittää tätä tietosuojaselostetta aika
                            ajoin. Ilmoitamme merkittävistä muutoksista
                            sovelluksessa tai sähköpostitse.
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            12. Valvontaviranomainen
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Jos koet, että tietojasi on käsitelty
                            lainvastaisesti, voit tehdä valituksen:{'\n\n'}
                            Tietosuojavaltuutetun toimisto{'\n'}
                            www.tietosuoja.fi{'\n'}
                            tietosuoja@om.fi
                        </CustomText>

                        <CustomText style={styles.sectionTitle}>
                            13. Yhteystiedot
                        </CustomText>
                        <CustomText style={styles.paragraph}>
                            Tietosuoja-asioissa voit ottaa yhteyttä:{'\n'}
                            Sähköposti: tialaanna@gmail.com{'\n\n'}
                            Vastaamme tiedusteluihin 30 päivän kuluessa.
                        </CustomText>

                        <View style={styles.footer}>
                            <CustomText style={styles.footerText}>
                                © 2025 Arkiapuri. Tietosuojasi on meille
                                tärkeää.
                            </CustomText>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    )
}

export default PrivacyPolicyScreen

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
    bold: {
        fontWeight: '700',
        color: '#1f2937',
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
