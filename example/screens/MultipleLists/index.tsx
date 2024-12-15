import React from 'react';
import {StyleSheet, View} from 'react-native';

import {List} from './List';

export const MultipleListsScreen = () => (
  <View style={styles.container}>
    <List />
    <View style={styles.separator} />
    <List />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  separator: {
    height: 20,
    backgroundColor: 'lightblue',
  },
});
