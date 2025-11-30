import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';

import {ReorderableListCore} from './ReorderableListCore';
import type {ReorderableListProps} from '../types';

const ReorderableListWithRef = <T,>(
  props: ReorderableListProps<T>,
  ref: React.Ref<FlatList<T>>,
) => (
  <ReorderableListCore
    {...props}
    ref={ref}
    scrollViewContainerRef={undefined}
    scrollViewScrollOffsetXY={undefined}
    scrollViewPageXY={undefined}
    scrollViewSize={undefined}
    outerScrollGesture={undefined}
    scrollViewScrollEnabledProp={undefined}
    setScrollViewForceDisableScroll={undefined}
    scrollable
  />
);

export const ReorderableList = forwardRef(ReorderableListWithRef) as <T>(
  props: ReorderableListProps<T> & React.RefAttributes<FlatList<T>>,
) => JSX.Element;
