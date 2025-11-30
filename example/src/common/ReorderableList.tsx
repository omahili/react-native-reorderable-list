import React from 'react';

import RNReorderableList, {
  ReorderableListProps,
} from 'react-native-reorderable-list';

import {useHorizontal} from '../common';

/**
 * A wrapper around ReorderableList to automatically
 * enable the horizontal layout through the context horizontal state.
 */
export const ReorderableList = <T,>(
  props: ReorderableListProps<T>,
): React.ReactElement => {
  const {horizontal} = useHorizontal();

  return <RNReorderableList {...props} horizontal={horizontal} />;
};
