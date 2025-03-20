import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';

import {ReorderableListCore} from './ReorderableListCore';
import {ScrollViewContainerContext} from '../contexts';
import {useContext} from '../hooks';
import type {NestedReorderableListProps} from '../types';

const NestedReorderableListWithRef = <T,>(
  {scrollable, scrollEnabled = true, ...rest}: NestedReorderableListProps<T>,
  ref?: React.ForwardedRef<FlatList<T>>,
) => {
  const {
    scrollViewContainerRef,
    scrollViewScrollOffsetY,
    scrollViewPageY,
    scrollViewHeightY,
    scrollViewScrollEnabled,
    outerScrollGesture,
    initialScrollViewScrollEnabled,
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
      scrollViewScrollEnabled={scrollViewScrollEnabled}
      initialScrollViewScrollEnabled={initialScrollViewScrollEnabled}
      scrollable={scrollable}
      scrollEnabled={scrollEnabled}
      nestedScrollEnabled
    />
  );
};

export const NestedReorderableList = forwardRef(
  NestedReorderableListWithRef,
) as <T>(
  props: NestedReorderableListProps<T> & React.RefAttributes<FlatList<T>>,
) => JSX.Element;
