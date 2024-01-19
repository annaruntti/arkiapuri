import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native'
import Button from '../components/Button';

const MealsScreen = ({}) => {
  return (
    <View style={styles.container}>
        <Text style={styles.introText}>Täällä voit lisätä, suunnitella ja selata aterioita.</Text>
        <Button
            title="Luo uusi ateria"
            onPress={() => {
              console.log('You tapped the button!');
            }}
        />
    </View>
  );
};

export default MealsScreen;

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
