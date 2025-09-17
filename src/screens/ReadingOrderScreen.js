import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import ResponsiveLayout from '../components/ResponsiveLayout'
import TableWeek from '../components/TableWeek'

const ReadingOrderScreen = ({}) => {
    return (
        <ResponsiveLayout activeRoute="ReadingOrderStack">
            <View style={styles.container}>
                <TableWeek />
            </View>
        </ResponsiveLayout>
    )
}

export default ReadingOrderScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
})
