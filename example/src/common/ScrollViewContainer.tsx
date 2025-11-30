import React from 'react';

import {
  ScrollViewContainer as RNScrollViewContainer,
  ScrollViewContainerProps,
} from 'react-native-reorderable-list';

import {useHorizontal} from '../common';

/**
 * A wrapper around ScrollViewContainer to automatically
 * enable the horizontal layout through the context horizontal state.
 */
export const ScrollViewContainer: React.FC<
  ScrollViewContainerProps
> = props => {
  const {horizontal} = useHorizontal();

  return <RNScrollViewContainer {...props} horizontal={horizontal} />;
};
