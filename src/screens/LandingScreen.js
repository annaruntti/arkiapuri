import * as React from 'react'
import { Dimensions, ImageBackground, StyleSheet, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import Button from '../components/Button'
import CustomText from '../components/CustomText'

const image = {
    uri: 'https://images.ctfassets.net/hef5a6s5axrs/4GwuSgvoXA0VX6cv5ix521/8545dbed4f7a510976eb78f8dcf4b91e/pexels-katerina-holmes-5907832.jpg',
}

const LandingScreen = ({ navigation }) => {
    const onSignUpPress = () => {
        navigation.navigate('Kirjaudu sisään')
    }
    return (
        <View style={styles.loginView}>
            <ImageBackground
                imageStyle={{
                    resizeMode: 'cover', // works only here!
                }}
                style={styles.image}
                source={image}
            >
                <View style={styles.bottomBox}>
                    <Svg
                        height={90}
                        width={Dimensions.get('screen').width}
                        viewBox="0 0 1440 280"
                        style={styles.bottomWavy}
                    >
                        <Path
                            fill="#fff"
                            d="M0,320L40,288C80,256,160,192,240,165.3C320,139,400,149,480,165.3C560,181,640,203,720,213.3C800,224,880,224,960,192C1040,160,1120,96,1200,64C1280,32,1360,32,1400,32L1440,32L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
                        />
                    </Svg>
                    <View style={styles.bottomBoxContent}>
                        <CustomText style={styles.introTextTitle}>
                            Tervetuloa Arkiapuriin!
                        </CustomText>
                        <CustomText style={styles.introText}>
                            Arkiapuri tuo apua jokaisen jokapäiväiseen elämään.
                        </CustomText>
                        <CustomText style={styles.bottomBoxText}>
                            Kirjaudu sisään tai rekisteröidy. Se on helppoa,
                            ilmaista ja vie vain hetken!
                        </CustomText>
                        <Button
                            title="Aloitetaan!"
                            onPress={onSignUpPress}
                            style={styles.primaryButtonStart}
                        />
                    </View>
                </View>
            </ImageBackground>
        </View>
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
        maxWidth: 400,
        alignSelf: 'center',
    },
    introText: {
        textAlign: 'center',
        fontSize: 19,
        marginBottom: 25,
        maxWidth: 400,
        alignSelf: 'center',
    },
    layer: {
        height: '100%',
    },
    bottomBox: {
        marginTop: 'auto',
    },
    bottomBoxContent: {
        paddingTop: 25,
        paddingRight: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        backgroundColor: '#fff',
        width: '100%',
        maxWidth: 400,
        minWidth: 360,
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
        maxWidth: 400,
        alignSelf: 'center',
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
})
