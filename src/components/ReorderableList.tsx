import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';

import {ReorderableListCore} from './ReorderableListCore';
import type {ReorderableListProps} from '../types';

const ReorderableListWithRef = <T,>(
  {scrollEnabled = true, ...rest}: ReorderableListProps<T>,
  ref: React.Ref<FlatList<T>>,
) => (
  <ReorderableListCore
    {...rest}
    ref={ref}
    scrollEnabled={scrollEnabled}
    scrollViewContainerRef={undefined}
    scrollViewScrollOffsetY={undefined}
    scrollViewPageY={undefined}
    scrollViewHeightY={undefined}
    outerScrollGesture={undefined}
    scrollViewScrollEnabled={undefined}
    initialScrollViewScrollEnabled
    scrollable
  />
);

export const ReorderableList = forwardRef(ReorderableListWithRef) as <T>(
  props: ReorderableListProps<T> & React.RefAttributes<FlatList<T>>,
) => JSX.Element;
