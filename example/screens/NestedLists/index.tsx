import React from 'react';
import {StyleSheet} from 'react-native';

import {ScrollViewContainer} from 'react-native-reorderable-list';

import {NestedList} from './NestedList';

export const NestedListsScreen = () => (
  <ScrollViewContainer style={styles.container}>
    <NestedList index={0} />
    <NestedList index={1} />
    <NestedList index={2} />
  </ScrollViewContainer>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
