import * as React from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import TableWeek from '../components/TableWeek'
import CustomText from '../components/CustomText'

const ReadingOrderScreen = ({}) => {
    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                <CustomText style={styles.introText}>
                    Täältä löydät viikon lukujärjestyksesi
                </CustomText>
                <CustomText style={styles.infoText}>
                    Luo lukujärjestys ja suunnittele viikon ohjelma ja ateriat.
                    Lisää ateriat lukujärjestykseen helpottaaksesi arkea.
                </CustomText>
                <View style={styles.tableContainer}>
                    <TableWeek />
                </View>
            </View>
        </ScrollView>
    )
}

export default ReadingOrderScreen

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    introText: {
        fontSize: 19,
        textAlign: 'center',
        padding: 20,
        marginBottom: 10,
    },
    infoText: {
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    tableContainer: {
        width: '100%',
    },
})
