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
import { useNavigation } from '@react-navigation/native'
import Svg, { Path } from 'react-native-svg'
import CustomText from '../components/CustomText'

const mealImage = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/1fvToRJqesGgl6dJCFyyJl/0f484ccfe293cca2a0a4ab57d3324c34/undraw_breakfast_rgx5.png',
}

const pantryImage = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/ShAURfxCIu9Og4KJZW5dW/ace0e55a861fa451eec6090a9b79c44e/undraw_online-groceries_n03y.png',
}

const shoppingListImage = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/4RDsykanJeWsUOE9vZJWsT/be968786ae294ee4dcedbc29823dbbdc/undraw_shopping-app_b80f.png',
}

const readingOrderImage = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/5s04BoMG8Blt6H2mvimgUK/ec13e9499e1d6e280ad8ae44c13e674b/undraw_diet_zdwe.png',
}

const HomeScreen = () => {
    const navigation = useNavigation()
    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.homeViewTop}>
                <View style={styles.header}>
                    <CustomText style={styles.introTitle}>
                        Tervetuloa käyttämään Arkiapuria!
                    </CustomText>
                    <CustomText style={styles.introText}>
                        Arkiapurin avulla voit helposti suunnitella ja selata
                        aterioita ja reseptejä, luoda oman lukujärjestyksesi,
                        sekä luoda älykkäitä ostoslistoja.
                    </CustomText>
                </View>
            </View>
            <View style={styles.homeViewBottom}>
                <Svg
                    height={90}
                    width={Dimensions.get('screen').width}
                    style={styles.bottomWavy}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1440 280"
                >
                    <Path
                        fill="#9C86FC"
                        fillOpacity="1"
                        d="M0,96L40,112C80,128,160,160,240,186.7C320,213,400,235,480,208C560,181,640,107,720,69.3C800,32,880,32,960,74.7C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
                    />
                </Svg>
                <View style={styles.linkArea}>
                    <View style={styles.container}>
                        <View style={styles.boxRow}>
                            <TouchableOpacity
                                style={styles.box}
                                onPress={() =>
                                    navigation.navigate('MealsStack', {
                                        screen: 'Ateriat',
                                    })
                                }
                            >
                                <Image
                                    source={mealImage}
                                    style={styles.boxImage}
                                />
                                <View style={styles.boxTextContent}>
                                    <CustomText style={styles.boxTextTitle}>
                                        Ateriat
                                    </CustomText>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.box}
                                onPress={() =>
                                    navigation.navigate('PantryStack', {
                                        screen: 'Pentteri',
                                    })
                                }
                            >
                                <Image
                                    source={pantryImage}
                                    style={styles.boxImage}
                                />
                                <View style={styles.boxTextContent}>
                                    <CustomText style={styles.boxTextTitle}>
                                        Pentteri
                                    </CustomText>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.boxRow}>
                            <TouchableOpacity
                                style={styles.box}
                                onPress={() =>
                                    navigation.navigate('ShoppingListStack', {
                                        screen: 'Ostoslista',
                                    })
                                }
                            >
                                <Image
                                    source={shoppingListImage}
                                    style={styles.boxImage}
                                />
                                <View style={styles.boxTextContent}>
                                    <CustomText style={styles.boxTextTitle}>
                                        Ostoslista
                                    </CustomText>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.box}
                                onPress={() =>
                                    navigation.navigate('ReadingOrderStack', {
                                        screen: 'Lukujärjestys',
                                    })
                                }
                            >
                                <Image
                                    source={readingOrderImage}
                                    style={styles.boxImage}
                                />
                                <View style={styles.boxTextContent}>
                                    <CustomText style={styles.boxTextTitle}>
                                        Lukujärjestys
                                    </CustomText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    homeViewTop: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    homeViewBottom: {
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 15,
    },
    introTitle: {
        textAlign: 'center',
        fontSize: 24,
        paddingTop: 15,
    },
    introText: {
        fontSize: 17,
        textAlign: 'center',
        paddingTop: 20,
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
    headerImage: {
        width: 250,
        height: 190,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    linkArea: {
        flex: 1,
        backgroundColor: '#9C86FC',
        justifyContent: 'center',
    },
    box: {
        flex: 1,
        margin: 10,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    boxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    boxImage: {
        width: 90,
        height: 70,
        marginBottom: 20,
        marginHorizontal: 'auto',
    },
    boxTextContent: {
        flex: 'auto',
        alignItems: 'center',
    },
    boxTextTitle: {
        fontSize: 17,
        color: '#000',
    },
    boxText: {
        fontSize: 12,
        color: '#000',
        textAlign: 'center',
        marginBottom: 5,
    },
})
