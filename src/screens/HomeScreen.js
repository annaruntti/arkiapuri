import * as React from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import Button from '../components/Button'
// import images from '../assets/images'

const image = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/uLiBysHEdvHowvtmiYGqT/99de25c240728adfb41eb83554c19f04/family-cooking.png',
}

const HomeScreen = ({ navigation }) => {
    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.homeView}>
                <View style={styles.header}>
                    <Image
                        style={styles.image}
                        source={image}
                        alt="Perhe tekemässä ruokaa"
                        resizeMode={'cover'}
                    />
                    <Text style={styles.introTitle}>
                        Tervetuloa Arkiapuriin!
                    </Text>
                    <Text style={styles.introText}>
                        Arkiapurin avulla voit helposti suunnitella ja selata
                        aterioita ja reseptejä, luoda oman lukujärjestyksesi,
                        sekä luoda älykkäitä ostoslistoja.
                    </Text>
                </View>
            </View>
            <View style={styles.homeViewBottom}>
                <Svg
                    height={86}
                    width={Dimensions.get('screen').width}
                    style={styles.bottomWavy}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 280"
                >
                    <Path
                        fill="#5000ca"
                        fill-opacity="1"
                        d="M0,32L34.3,53.3C68.6,75,137,117,206,128C274.3,139,343,117,411,128C480,139,549,181,617,165.3C685.7,149,754,75,823,85.3C891.4,96,960,192,1029,234.7C1097.1,277,1166,267,1234,218.7C1302.9,171,1371,85,1406,42.7L1440,0L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
                    />
                </Svg>
                <View style={styles.buttonArea}>
                    <View style={styles.container}>
                        <TouchableOpacity style={styles.button}>
                            <Button
                                style={styles.pantryButton}
                                title="Ruokakomero"
                                onPress={() =>
                                    navigation.navigate('Ruokakomero')
                                }
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}>
                            <Button
                                style={styles.mealsButton}
                                title="Ateriat"
                                onPress={() => navigation.navigate('Ateriat')}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}>
                            <Button
                                style={styles.readingOrderButton}
                                title="Lukujärjestys"
                                onPress={() =>
                                    navigation.navigate('Lukujärjestys')
                                }
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button}>
                            <Button
                                style={styles.shoppingListButton}
                                title="Ostoslista"
                                onPress={() =>
                                    navigation.navigate('Ostoslista')
                                }
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    homeView: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    homeViewBottom: {
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 30,
    },
    introTitle: {
        textAlign: 'center',
        fontSize: 24,
        paddingTop: 20,
    },
    introText: {
        fontSize: 18,
        textAlign: 'center',
        paddingVertical: 20,
        marginBottom: 10,
    },
    header: {
        minHeight: 400,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
    layer: {
        backgroundColor: 'rgba(248, 247, 216, 0.7)',
        width: '100%',
        height: '100%',
    },
    image: {
        width: 300,
        height: 240,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    buttonArea: {
        backgroundColor: '#5000ca',
        width: '100%',
        padding: 20,
    },
    button: {
        borderRadius: 15,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 50,
        paddingRight: 50,
        backgroundColor: '#FFFFFF',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOpacity: 0.8,
        elevation: 6,
        shadowRadius: 15,
        shadowOffset: { width: 1, height: 13 },
        width: '100%',
        marginBottom: 8,
    },
    buttonHover: {
        marginTop: 10,
        borderRadius: 25,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 50,
        paddingRight: 50,
        shadowColor: 'rgba(46, 229, 157, 0.4)',
        shadowOpacity: 1.5,
        elevation: 8,
        shadowRadius: 20,
        shadowOffset: { width: 1, height: 13 },
        backgroundColor: '#2EE59D',
        color: '#FFFFFF',
    },
    pantryButton: {
        width: '100%',
        borderRadius: 5,
        padding: 10,
    },
    mealsButton: {
        width: '100%',
        borderRadius: 5,
        padding: 10,
    },
    readingOrderButton: {
        width: '100%',
        borderRadius: 5,
        padding: 10,
    },
    shoppingListButton: {
        width: '100%',
        borderRadius: 5,
        padding: 10,
    },
})
