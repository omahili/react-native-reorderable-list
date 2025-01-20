import React from 'react';
import {StyleSheet, View} from 'react-native';

export const ItemSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: '#ddd',
  },
});
