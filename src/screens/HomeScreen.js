import { MaterialIcons } from '@expo/vector-icons'
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
import FilteredMealsCard from '../components/FilteredMealsCard'
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

const quickMealsImage = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/1fvToRJqesGgl6dJCFyyJl/0f484ccfe293cca2a0a4ab57d3324c34/undraw_breakfast_rgx5.png',
}

const staticWavePathData =
    'M0,96L40,112C80,128,160,160,240,186.7C320,213,400,235,480,208C560,181,640,107,720,69.3C800,32,880,32,960,74.7C1040,117,1120,203,1200,229.3C1280,256,1360,224,1400,208L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z'

// Desktop-specific wave path with higher curves and smooth flow
const desktopWavePathData =
    'M0,80L48,85C96,90,192,100,288,125C384,150,480,190,576,210C672,230,768,210,864,185C960,160,1056,120,1152,135C1248,150,1344,210,1392,225L1440,240L1440,320L0,320Z'

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
                    <View style={styles.desktopHeaderSection}>
                        <View style={styles.desktopHeaderCard}>
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

                    {/* Desktop SVG Wave */}
                    <View style={styles.desktopSvgContainer}>
                        <Svg
                            height={200}
                            width="100%"
                            viewBox="0 0 1440 320"
                            preserveAspectRatio="none"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                            }}
                        >
                            <Path d={desktopWavePathData} fill="#9C86FC" />
                        </Svg>
                    </View>

                    {/* Desktop Navigation Grid */}
                    <View style={styles.desktopNavigationWrapper}>
                        <LinearGradient
                            colors={['#9C86FC', '#7B61F8']}
                            style={[
                                styles.desktopNavigationGradient,
                                styles.desktopNavigationWithWave,
                            ]}
                        >
                            {renderDesktopGrid()}
                        </LinearGradient>
                    </View>

                    {/* Quick & Easy Meals Card - Desktop */}
                    <TouchableOpacity
                        style={styles.desktopQuickMealsCard}
                        onPress={() =>
                            navigation.navigate('MealsStack', {
                                screen: 'Ateriat',
                                params: {
                                    filterDifficulty: 'easy',
                                    filterMaxCookingTime: 30,
                                },
                            })
                        }
                    >
                        <Image
                            source={quickMealsImage}
                            style={styles.desktopQuickMealsImage}
                        />
                        <View style={styles.quickMealsContent}>
                            <CustomText style={styles.desktopQuickMealsTitle}>
                                Helpot ja nopeat arkiruuat
                            </CustomText>
                            <CustomText style={styles.quickMealsSubtitle}>
                                Helppoja ruokia alle 30 minuutissa
                            </CustomText>
                        </View>
                        <MaterialIcons
                            name="arrow-forward"
                            size={28}
                            color="#9C86FC"
                            style={styles.quickMealsArrow}
                        />
                    </TouchableOpacity>
                </ScrollView>
            </ResponsiveLayout>
        )
    }

    return (
        <ScrollView
            style={[styles.scrollView, styles.mobileScrollView]}
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

            {isTablet ? (
                // Tablet SVG Wave (responsive full-width)
                <View style={styles.tabletSvgContainer}>
                    <Svg
                        height={160}
                        width="100%"
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                        }}
                    >
                        <Path d={staticWavePathData} fill="#9C86FC" />
                    </Svg>
                </View>
            ) : (
                // Mobile Static Wave
                <View style={styles.svgContainer}>
                    <Svg
                        height={81}
                        width="100%"
                        viewBox="0 0 1440 320"
                        preserveAspectRatio="none"
                    >
                        <Path d={staticWavePathData} fill="#9C86FC" />
                    </Svg>
                </View>
            )}

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

                    {/* Filtered Meals Cards */}
                    <FilteredMealsCard
                        title="Helpot ja nopeat arkiruuat"
                        subtitle="Helppoja ruokia alle 30 minuutissa"
                        image={quickMealsImage}
                        filterDifficulty="easy"
                        filterMaxCookingTime={30}
                        onPress={() =>
                            navigation.navigate('MealsStack', {
                                screen: 'Ateriat',
                                params: {
                                    filterDifficulty: 'easy',
                                    filterMaxCookingTime: 30,
                                },
                            })
                        }
                    />

                    <FilteredMealsCard
                        title="Aamiaisruoat"
                        subtitle="Aloita päivä hyvin"
                        image={mealImage}
                        filterMealType="breakfast"
                        onPress={() =>
                            navigation.navigate('MealsStack', {
                                screen: 'Ateriat',
                                params: {
                                    filterMealType: 'breakfast',
                                },
                            })
                        }
                    />

                    <FilteredMealsCard
                        title="Jälkiruoat"
                        subtitle="Makeat herkut"
                        image={mealImage}
                        filterMealType="dessert"
                        onPress={() =>
                            navigation.navigate('MealsStack', {
                                screen: 'Ateriat',
                                params: {
                                    filterMealType: 'dessert',
                                },
                            })
                        }
                    />
                </View>
            </LinearGradient>
        </ScrollView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    mobileScrollView: {
        backgroundColor: '#fff',
    },
    scrollContentContainer: {
        flexGrow: 1,
    },
    homeViewTop: {
        backgroundColor: '#fff',
        paddingHorizontal: 25,
        paddingTop: 25,
        paddingBottom: 0,
    },
    header: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    svgContainer: {
        width: '100%',
        height: 81,
        minHeight: 81,
        backgroundColor: 'transparent',
        zIndex: 1,
    },
    linkAreaGradient: {
        flex: 1,
        paddingTop: 25,
        paddingBottom: 30,
        justifyContent: 'center',
    },
    tabletSvgContainer: {
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        height: 160,
        minHeight: 160,
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
    // Desktop-specific styles
    desktopSvgContainer: {
        width: '100%',
        minHeight: 200,
        alignSelf: 'stretch',
        position: 'relative',
        overflow: 'hidden',
    },
    desktopLinkAreaGradient: {
        paddingTop: 80,
        marginTop: -60,
        paddingBottom: 60,
    },
    desktopLinkAreaContent: {
        paddingHorizontal: 60,
        maxWidth: 1200,
        alignSelf: 'center',
    },
    desktopBox: {
        minWidth: 280,
        maxWidth: 350,
        flex: 1,
        paddingVertical: 25,
        paddingHorizontal: 25,
        marginBottom: 0,
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
    desktopHeaderSection: {
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    desktopHeaderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingTop: 20,
        paddingHorizontal: 30,
        alignItems: 'left',
    },
    desktopNavigationWrapper: {
        flex: 1,
    },
    desktopNavigationGradient: {
        paddingHorizontal: 40,
        flex: 1,
    },
    desktopNavigationWithWave: {
        paddingBottom: 60,
    },
    desktopIntroTitle: {
        fontSize: 32,
        textAlign: 'left',
        marginBottom: 8,
    },
    desktopIntroText: {
        fontSize: 21,
        textAlign: 'left',
        lineHeight: 26,
        maxWidth: 800,
        paddingLeft: 0,
        paddingVertical: 16,
    },
    desktopGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingBottom: 40,
        paddingHorizontal: 40,
        maxWidth: 960,
        gap: 30,
    },
    desktopCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        minWidth: 280,
        maxWidth: 350,
        flex: 1,
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
