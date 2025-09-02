import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import CustomText from '../components/CustomText'
import ResponsiveLayout from '../components/ResponsiveLayout'
import { useResponsiveDimensions } from '../utils/responsive'

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

const staticWavePathData =
    'M0,96L40,112C80,128,160,160,240,186.7C320,213,400,235,480,208C560,181,640,107,720,69.3C800,32,880,32,960,74.7C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z'

const HomeScreen = () => {
    const navigation = useNavigation()
    const { isDesktop, isTablet, responsivePadding } = useResponsiveDimensions()

    const navigationCards = [
        {
            title: 'Ateriat',
            image: mealImage,
            route: 'MealsStack',
            screen: 'Ateriat',
        },
        {
            title: 'Pentteri',
            image: pantryImage,
            route: 'PantryStack',
            screen: 'Pentteri',
        },
        {
            title: 'Ostoslista',
            image: shoppingListImage,
            route: 'ShoppingListStack',
            screen: 'Ostoslista',
        },
        {
            title: 'Lukujärjestys',
            image: readingOrderImage,
            route: 'ReadingOrderStack',
            screen: 'Lukujärjestys',
        },
    ]

    const renderDesktopGrid = () => {
        return (
            <View style={styles.desktopGrid}>
                {navigationCards.map((card, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.desktopCard, { width: '48%' }]}
                        onPress={() =>
                            navigation.navigate(card.route, {
                                screen: card.screen,
                            })
                        }
                    >
                        <Image
                            source={card.image}
                            style={styles.desktopCardImage}
                        />
                        <View style={styles.desktopCardContent}>
                            <CustomText style={styles.desktopCardTitle}>
                                {card.title}
                            </CustomText>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        )
    }

    if (isDesktop) {
        return (
            <ResponsiveLayout activeRoute="HomeStack">
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContentContainer}
                >
                    <View style={styles.homeViewTop}>
                        <View style={styles.header}>
                            <CustomText
                                style={[
                                    styles.introTitle,
                                    styles.desktopIntroTitle,
                                ]}
                            >
                                Tervetuloa käyttämään Arkiapuria!
                            </CustomText>
                            <CustomText
                                style={[
                                    styles.introText,
                                    styles.desktopIntroText,
                                ]}
                            >
                                Arkiapurin avulla voit helposti suunnitella ja
                                selata aterioita ja reseptejä, luoda oman
                                lukujärjestyksesi, sekä luoda älykkäitä
                                ostoslistoja.
                            </CustomText>
                        </View>
                    </View>
                    {renderDesktopGrid()}
                </ScrollView>
            </ResponsiveLayout>
        )
    }

    return (
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContentContainer}
        >
            {/* Top Section */}
            <View
                style={[
                    styles.homeViewTop,
                    isTablet && styles.tabletHomeViewTop,
                ]}
            >
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

            {/* Static SVG Wave */}
            <View
                style={[
                    styles.svgContainer,
                    isTablet && styles.tabletSvgContainer,
                ]}
            >
                <Svg
                    height={isTablet ? 120 : 80}
                    width="100%"
                    viewBox="0 0 1440 280"
                    preserveAspectRatio="xMidYMax slice"
                >
                    <Path d={staticWavePathData} fill="#9C86FC" />
                </Svg>
            </View>

            {/* Gradient Area Below Static Wave */}
            <LinearGradient
                colors={['#9C86FC', '#7B61F8']}
                style={[
                    styles.linkAreaGradient,
                    isTablet && styles.tabletLinkAreaGradient,
                ]}
            >
                <View
                    style={[
                        styles.linkAreaContent,
                        isTablet && styles.tabletLinkAreaContent,
                    ]}
                >
                    <View style={styles.container}>
                        <View style={styles.boxRow}>
                            <TouchableOpacity
                                style={[
                                    styles.box,
                                    isTablet && styles.tabletBox,
                                ]}
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
                                style={[
                                    styles.box,
                                    isTablet && styles.tabletBox,
                                ]}
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
                                style={[
                                    styles.box,
                                    isTablet && styles.tabletBox,
                                ]}
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
                                style={[
                                    styles.box,
                                    isTablet && styles.tabletBox,
                                ]}
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
            </LinearGradient>
        </ScrollView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#fff',
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
    },
    homeViewTop: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 0,
    },
    header: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    svgContainer: {
        width: '100%',
        aspectRatio: 1440 / (280 - 96),
        minHeight: 100,
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    linkAreaGradient: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingTop: 25,
        paddingBottom: 30,
        marginTop: -25,
    },
    tabletSvgContainer: {
        minHeight: 140,
        aspectRatio: 1440 / (280 - 60),
    },
    tabletLinkAreaGradient: {
        paddingTop: 60,
        marginTop: -40,
    },
    tabletHomeViewTop: {
        paddingBottom: 30,
    },
    tabletLinkAreaContent: {
        paddingHorizontal: 40,
    },
    tabletBox: {
        marginHorizontal: 15,
        marginVertical: 12,
    },
    linkAreaContent: {
        backgroundColor: 'transparent',
        paddingHorizontal: 15,
    },
    container: {
        alignItems: 'center',
        width: '100%',
    },
    introTitle: {
        textAlign: 'center',
        fontSize: 25,
        fontWeight: 'bold',
        color: '#333',
        paddingTop: 15,
    },
    introText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#555',
        paddingTop: 20,
        paddingHorizontal: 10,
    },
    boxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 10,
        width: '100%',
    },
    box: {
        flex: 1,
        marginHorizontal: 7,
        paddingVertical: 15,
        paddingHorizontal: 5,
        height: 160,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxImage: {
        width: 85,
        height: 68,
        marginBottom: 15,
    },
    boxTextContent: {
        alignItems: 'center',
    },
    boxTextTitle: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    // Desktop-specific styles
    desktopIntroTitle: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 20,
    },
    desktopIntroText: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 26,
        maxWidth: 800,
    },
    desktopGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    desktopCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    desktopCardImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    desktopCardContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        alignItems: 'center',
    },
    desktopCardTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
})
