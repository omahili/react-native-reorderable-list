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
    releasedIndex,
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
  });

  const renderAnimatedCell = useCallback(
    ({index, children, item, onLayout: onCellLayout}: CellRendererProps<T>) => (
      <ReorderableListCell
        // forces remount of components with key change
        key={keyExtractor ? keyExtractor(item, index) : index}
        item={item}
        extraData={extraData}
        index={index}
        itemOffset={itemOffset}
        itemHeight={itemHeight}
        dragY={dragY}
        draggedIndex={draggedIndex}
        releasedIndex={releasedIndex}
        animationDuration={duration}
        startDrag={startDrag}
        children={children}
        onLayout={onCellLayout}
      />
    ),
    [
      itemOffset,
      itemHeight,
      startDrag,
      dragY,
      draggedIndex,
      releasedIndex,
      duration,
      keyExtractor,
      extraData,
    ],
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
