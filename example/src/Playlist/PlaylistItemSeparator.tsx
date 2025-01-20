import React from 'react';
import {StyleSheet, View} from 'react-native';

export const PlaylistItemSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  separator: {
    height: 1,
    marginLeft: 74,
    backgroundColor: 'lightgray',
  },
});
