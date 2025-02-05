import { StyleSheet, FlatList, Text, View } from 'react-native'
import React from 'react'
import CustomText from './CustomText'

const data = [
    { id: 1, meal: 'Aamiainen', food: 'Voileipä' },
    { id: 2, meal: 'Lounas', food: 'Linssikeitto' },
    { id: 3, meal: 'Välipala', food: 'Marjarahka' },
    { id: 4, meal: 'Päivällinen', food: 'Kikhernecurry' },
    { id: 5, meal: 'Iltapala', food: 'Pinaattilätyt ja raejuusto' },
]
const TableOne = () => {
    const item = ({ item }) => (
        <View
            style={{
                flexDirection: 'row',
                borderBottomColor: '#ccc',
                borderBottomWidth: 1,
            }}
        >
            <View
                style={{
                    width: '50%',
                    padding: 10,
                    borderRightColor: '#ccc',
                    borderRightWidth: 1,
                }}
            >
                <CustomText
                    style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        textAlign: 'left',
                    }}
                >
                    {item.meal}
                </CustomText>
            </View>
            <View style={{ width: '50%', padding: 10 }}>
                <CustomText
                    style={{
                        fontSize: 16,
                        fontWeight: '400',
                        textAlign: 'left',
                    }}
                >
                    {item.food}
                </CustomText>
            </View>
        </View>
    )
    return (
        <View style={styles.table}>
            <View style={styles.tableSection}>
                {/* Table Head */}
                <View style={styles.table_head}>
                    <View style={{ width: '100%' }}>
                        <CustomText style={styles.table_head_captions}>
                            Maanantai
                        </CustomText>
                    </View>
                </View>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        borderColor: '#ccc',
                        borderWidth: 1,
                    }}
                >
                    <FlatList
                        data={data}
                        renderItem={item}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>
            </View>
            <View style={styles.tableSection}>
                {/* Table Head */}
                <View style={styles.table_head}>
                    <View style={{ width: '100%' }}>
                        <CustomText style={styles.table_head_captions}>
                            Tiistai
                        </CustomText>
                    </View>
                </View>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        borderColor: '#ccc',
                        borderWidth: 1,
                    }}
                >
                    <FlatList
                        data={data}
                        renderItem={item}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>
            </View>
            <View style={styles.tableSection}>
                {/* Table Head */}
                <View style={styles.table_head}>
                    <View style={{ width: '100%' }}>
                        <CustomText style={styles.table_head_captions}>
                            Keskiviikko
                        </CustomText>
                    </View>
                </View>
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        borderColor: '#ccc',
                        borderWidth: 1,
                    }}
                >
                    <FlatList
                        data={data}
                        renderItem={item}
                        keyExtractor={(item) => item.id.toString()}
                    />
                </View>
            </View>
        </View>
    )
}
export default TableOne

const styles = StyleSheet.create({
    table: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        width: '100%',
    },
    tableSection: {
        width: '100%',
    },
    table_head: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        padding: 8,
        backgroundColor: '#FFC121',
    },
    table_head_captions: {
        fontSize: 20,
        fontWeight: 500,
        color: '#000',
    },

    table_body_single_row: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
        padding: 7,
    },
    table_data: {
        fontSize: 11,
    },
})
