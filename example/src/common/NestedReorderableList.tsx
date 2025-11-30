import React from 'react';

import {
  NestedReorderableListProps,
  NestedReorderableList as RNNestedReorderableList,
} from 'react-native-reorderable-list';

import {useHorizontal} from '../common';

/**
 * A wrapper around NestedReorderableList to automatically
 * enable the horizontal layout through the context horizontal state.
 */
export const NestedReorderableList = <T,>(
  props: NestedReorderableListProps<T>,
): React.ReactElement => {
  const {horizontal} = useHorizontal();

  return <RNNestedReorderableList {...props} horizontal={horizontal} />;
};
