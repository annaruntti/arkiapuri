import * as React from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    ImageBackground,
    ScrollView,
} from 'react-native'
import Button from '../components/Button'

const HomeScreen = ({ navigation }) => {
    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.homeView}>
                <View style={styles.header}>
                    <Image
                        style={styles.image}
                        source={require('../assets/images/family-cooking.png')}
                        alt="Perhe tekemässä ruokaa"
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
                    <Button
                        style={styles.pantryButton}
                        title="Ruokakomero"
                        onPress={() => navigation.navigate('Pantry')}
                    />
                    <Button
                        style={styles.mealsButton}
                        title="Ateriat"
                        onPress={() => navigation.navigate('Meals')}
                    />
                    <Button
                        style={styles.readingOrderButton}
                        title="Lukujärjestys"
                        onPress={() => navigation.navigate('Reading order')}
                    />
                    <Button
                        style={styles.shoppingListButton}
                        title="Ostoslista"
                        onPress={() => navigation.navigate('Shopping list')}
                    />
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
        width: '100%',
        height: 300,
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
