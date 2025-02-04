import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import TableOne from '../components/Table'
import CustomText from '../components/CustomText'

const ReadingOrderScreen = ({}) => {
    return (
        <View style={styles.container}>
            <CustomText style={styles.introText}>
                Täältä löydät viikon lukujärjestyksesi
            </CustomText>
            <CustomText style={styles.infoText}>
                Luo lukujärjestys ja suunnittele viikon ohjelma ja ateriat.
                Lisää ateriat lukujärjestykseen helpottaaksesi arkea.
            </CustomText>
            <View>
                <TableOne />
            </View>
        </View>
    )
}

export default ReadingOrderScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    introText: {
        fontSize: 25,
        textAlign: 'center',
        padding: 20,
        marginBottom: 10,
    },
})
