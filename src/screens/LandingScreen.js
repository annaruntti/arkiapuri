import * as React from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import Button from '../components/Button'
import CustomText from '../components/CustomText'
import FullWidthLayout from '../components/FullWidthLayout'
import { useResponsiveDimensions } from '../utils/responsive'

const image = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/4GwuSgvoXA0VX6cv5ix521/8545dbed4f7a510976eb78f8dcf4b91e/pexels-katerina-holmes-5907832.jpg',
}

const LandingScreen = ({ navigation }) => {
    const { isDesktop, isTablet, containerMaxWidth } = useResponsiveDimensions()

    const onSignUpPress = () => {
        navigation.navigate('Kirjaudu sisään')
    }
    return (
        <FullWidthLayout>
            <View style={styles.loginView}>
                <ImageBackground
                    imageStyle={{
                        resizeMode: 'cover', // works only here!
                    }}
                    style={styles.image}
                    source={image}
                >
                    <View
                        style={[
                            styles.bottomBox,
                            isTablet && styles.tabletBottomBox,
                            isDesktop && styles.desktopBottomBox,
                        ]}
                    >
                        {!isDesktop && !isTablet && (
                            <Svg
                                height={90}
                                width="100%"
                                viewBox="0 0 1440 280"
                                style={styles.bottomWavy}
                            >
                                <Path
                                    fill="#fff"
                                    d="M0,320L40,288C80,256,160,192,240,165.3C320,139,400,149,480,165.3C560,181,640,203,720,213.3C800,224,880,224,960,192C1040,160,1120,96,1200,64C1280,32,1360,32,1400,32L1440,32L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
                                />
                            </Svg>
                        )}
                        <View
                            style={[
                                styles.bottomBoxContent,
                                isDesktop && styles.desktopBottomBoxContent,
                                isTablet && styles.tabletBottomBoxContent,
                            ]}
                        >
                            <CustomText
                                style={[
                                    styles.introTextTitle,
                                    isTablet && styles.tabletIntroTextTitle,
                                    isDesktop && styles.desktopIntroTextTitle,
                                ]}
                            >
                                Tervetuloa Arkiapuriin!
                            </CustomText>
                            <CustomText
                                style={[
                                    styles.introText,
                                    isTablet && styles.tabletIntroText,
                                    isDesktop && styles.desktopIntroText,
                                ]}
                            >
                                Arkiapuri tuo apua jokaisen jokapäiväiseen
                                elämään.
                            </CustomText>
                            <CustomText
                                style={[
                                    styles.bottomBoxText,
                                    isTablet && styles.tabletBottomBoxText,
                                    isDesktop && styles.desktopBottomBoxText,
                                ]}
                            >
                                Kirjaudu sisään tai rekisteröidy. Se on helppoa,
                                ilmaista ja vie vain hetken!
                            </CustomText>
                            <Button
                                title="Aloitetaan!"
                                onPress={onSignUpPress}
                                style={[
                                    styles.primaryButtonStart,
                                    isDesktop && styles.desktopPrimaryButton,
                                ]}
                            />
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </FullWidthLayout>
    )
}

export default LandingScreen

const styles = StyleSheet.create({
    loginView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    background: {
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingVertical: 20,
        marginHorizontal: 20,
        marginVertical: 15,
        minHeight: 150,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    textContentArea: {
        flex: 1,
        justifyContent: 'top',
        width: '100%',
        padding: 40,
    },
    introTextTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
    },
    introText: {
        textAlign: 'center',
        fontSize: 19,
        marginBottom: 25,
    },
    layer: {
        height: '100%',
    },
    bottomBox: {
        marginTop: 'auto',
        alignItems: 'center',
    },
    bottomBoxContent: {
        paddingTop: 25,
        paddingRight: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        backgroundColor: '#fff',
        width: '100%',
        alignItems: 'center',
        alignSelf: 'center',
    },
    bottomBoxText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    primaryButtonStart: {
        borderRadius: 25,
        paddingTop: 12,
        paddingBottom: 12,
        paddingLeft: 20,
        paddingRight: 20,
        elevation: 2,
        backgroundColor: '#9C86FC',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        marginHorizontal: 'auto',
        minWidth: 200,
        maxWidth: 400,
        width: '60%',
        alignSelf: 'center',
    },
    secondaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
    tertiaryButton: {
        borderRadius: 25,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 2,
        backgroundColor: '#38E4D9',
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
        width: 'auto',
    },
    // Desktop responsive styles
    tabletBottomBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    desktopBottomBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 60,
    },
    desktopBottomBoxContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        paddingHorizontal: 60,
        paddingVertical: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    tabletBottomBoxContent: {
        paddingHorizontal: 40,
        paddingVertical: 30,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    tabletIntroTextTitle: {
        fontSize: 30,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    tabletIntroText: {
        fontSize: 20,
        lineHeight: 28,
        marginBottom: 20,
        color: '#555',
        fontWeight: '400',
    },
    tabletBottomBoxText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 28,
        color: '#666',
        fontWeight: '400',
    },
    desktopIntroTextTitle: {
        fontSize: 36,
        fontWeight: '700',
        marginBottom: 16,
        color: '#333',
        textAlign: 'center',
    },
    desktopIntroText: {
        fontSize: 22,
        lineHeight: 32,
        marginBottom: 24,
        color: '#555',
        textAlign: 'center',
        fontWeight: '400',
    },
    desktopBottomBoxText: {
        fontSize: 18,
        lineHeight: 28,
        marginBottom: 32,
        color: '#666',
        textAlign: 'center',
        fontWeight: '400',
    },
    desktopPrimaryButton: {
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        backgroundColor: '#9C86FC',
        shadowColor: '#9C86FC',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 200,
    },
})
