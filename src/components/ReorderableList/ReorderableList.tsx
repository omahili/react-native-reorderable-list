import React, {useCallback} from 'react';
import {CellRendererProps, FlatList, FlatListProps} from 'react-native';

import {GestureDetector} from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

import {AUTOSCROLL_DELAY} from './constants';
import {useReorderableList} from './useReorderableList';
import {ReorderableListContext} from '../../contexts';
import type {ReorderableListProps} from '../../types';
import {ReorderableListCell} from '../ReorderableListCell';

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList,
) as unknown as <T>(
  props: FlatListProps<T> & {ref?: React.Ref<FlatList<T>>},
) => React.ReactElement;

const ReorderableList = <T,>(
  {
    data,
    autoscrollThreshold = 0.1,
    autoscrollSpeedScale = 1,
    autoscrollDelay = AUTOSCROLL_DELAY,
    animationDuration = 200,
    dragReorderThreshold = 0.2,
    onLayout,
    onReorder,
    onScroll,
    onDragEnd,
    keyExtractor,
    extraData,
    ...rest
  }: ReorderableListProps<T>,
  ref: React.ForwardedRef<FlatList<T>>,
) => {
  const {
    gestureHandler,
    handleScroll,
    handleFlatListLayout,
    handleRef,
    startDrag,
    listContextValue,
    itemOffset,
    itemHeight,
    dragY,
    draggedIndex,
    duration,
  } = useReorderableList({
    ref,
    autoscrollThreshold,
    autoscrollSpeedScale,
    autoscrollDelay,
    animationDuration,
    dragReorderThreshold,
    onLayout,
    onReorder,
    onScroll,
    onDragEnd,
  });

  const renderAnimatedCell = useCallback(
    ({cellKey, ...props}: CellRendererProps<T>) => (
      <ReorderableListCell
        {...props}
        // forces remount with key change on reorder
        key={`${cellKey}+${props.index}`}
        itemOffset={itemOffset}
        itemHeight={itemHeight}
        dragY={dragY}
        draggedIndex={draggedIndex}
        animationDuration={duration}
        startDrag={startDrag}
      />
    ),
    [itemOffset, itemHeight, dragY, draggedIndex, duration, startDrag],
  );

  return (
    <ReorderableListContext.Provider value={listContextValue}>
      <GestureDetector gesture={gestureHandler}>
        <AnimatedFlatList
          {...rest}
          ref={handleRef}
          data={data}
          CellRendererComponent={renderAnimatedCell}
          onLayout={handleFlatListLayout}
          onScroll={handleScroll}
          scrollEventThrottle={1}
          horizontal={false}
          removeClippedSubviews={false}
          keyExtractor={keyExtractor}
          extraData={extraData}
          numColumns={1}
        />
      </GestureDetector>
    </ReorderableListContext.Provider>
  );
};

const MemoizedReorderableList = React.memo(
  React.forwardRef(ReorderableList),
) as <T>(
  props: ReorderableListProps<T> & {
    ref?: React.ForwardedRef<FlatListProps<T>>;
  },
) => React.ReactElement;

export {MemoizedReorderableList as ReorderableList};
