import * as React from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    ScrollView,
    TouchableOpacity,
} from 'react-native'
import Button from '../components/Button'
import images from '../assets/images'

const HomeScreen = ({ navigation }) => {
    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.homeView}>
                <View style={styles.header}>
                    <Image
                        style={styles.image}
                        source={images.homeImage}
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
                <View style={styles.container}>
                    <TouchableOpacity style={styles.button}>
                        <Button
                            style={styles.pantryButton}
                            title="Ruokakomero"
                            onPress={() => navigation.navigate('Ruokakomero')}
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
                            onPress={() => navigation.navigate('Lukujärjestys')}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Button
                            style={styles.shoppingListButton}
                            title="Ostoslista"
                            onPress={() => navigation.navigate('Ostoslista')}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    // scrollView: {
    //     paddingHorizontal: 20,
    // },
    homeView: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingVertical: 20,
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
