import React from 'react';
import {FlatList, StyleSheet, Text} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {PressableOpacity} from 'react-native-pressable-opacity';

import screens from './screens';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <FlatList
      data={screens}
      renderItem={x => (
        <PressableOpacity
          style={styles.item}
          onPress={() => navigation.navigate(x.item.name)}>
          <Text style={styles.text}>{x.item.name}</Text>
        </PressableOpacity>
      )}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  item: {
    padding: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: 'lightgray',
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
});
