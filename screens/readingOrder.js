import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native'
import TableOne from '../components/Table';

const ReadingOrderScreen = ({}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.introText}>Check out your weekly outlook here</Text>
      <View>
        <TableOne/>
      </View>
    </View>
  );
};

export default ReadingOrderScreen;

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
  },
  introText: {
    fontSize: 25,
    textAlign: 'center',
    padding: 20,
    marginBottom: 10,
  },
})