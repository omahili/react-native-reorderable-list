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
    scrollViewScrollOffsetXY,
    scrollViewPageXY,
    scrollViewSize,
    scrollViewScrollEnabledProp,
    outerScrollGesture,
    setScrollViewForceDisableScroll,
  } = useContext(ScrollViewContainerContext);

  return (
    <ReorderableListCore
      {...rest}
      ref={ref}
      scrollViewContainerRef={scrollViewContainerRef}
      scrollViewScrollOffsetXY={scrollViewScrollOffsetXY}
      scrollViewPageXY={scrollViewPageXY}
      scrollViewSize={scrollViewSize}
      outerScrollGesture={outerScrollGesture}
      scrollViewScrollEnabledProp={scrollViewScrollEnabledProp}
      setScrollViewForceDisableScroll={setScrollViewForceDisableScroll}
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
