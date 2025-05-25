import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';

import {ReorderableListCore} from './ReorderableListCore';
import {ScrollViewContainerContext} from '../contexts';
import {useContext} from '../hooks';
import type {NestedReorderableListProps} from '../types';

const NestedReorderableListWithRef = <T,>(
  {scrollable, ...rest}: NestedReorderableListProps<T>,
  ref?: React.ForwardedRef<FlatList<T>>,
) => {
  const {
    scrollViewContainerRef,
    scrollViewScrollOffsetY,
    scrollViewPageY,
    scrollViewHeightY,
    scrollViewScrollEnabledProp,
    scrollViewCurrentScrollEnabled,
    outerScrollGesture,
  } = useContext(ScrollViewContainerContext);

  return (
    <ReorderableListCore
      {...rest}
      ref={ref}
      scrollViewContainerRef={scrollViewContainerRef}
      scrollViewScrollOffsetY={scrollViewScrollOffsetY}
      scrollViewPageY={scrollViewPageY}
      scrollViewHeightY={scrollViewHeightY}
      outerScrollGesture={outerScrollGesture}
      scrollViewScrollEnabledProp={scrollViewScrollEnabledProp}
      scrollViewCurrentScrollEnabled={scrollViewCurrentScrollEnabled}
      scrollable={scrollable}
      nestedScrollEnabled
    />
  );
};

export const NestedReorderableList = forwardRef(
  NestedReorderableListWithRef,
) as <T>(
  props: NestedReorderableListProps<T> & React.RefAttributes<FlatList<T>>,
) => JSX.Element;
