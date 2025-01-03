import React, {useCallback, useMemo} from 'react';
import {
  CellRendererProps,
  FlatList,
  FlatListProps,
  Platform,
  ScrollView,
} from 'react-native';

import {
  Gesture,
  GestureDetector,
  NativeGesture,
} from 'react-native-gesture-handler';
import Animated, {SharedValue} from 'react-native-reanimated';

import {AUTOSCROLL_DELAY} from './constants';
import {useReorderableListCore} from './useReorderableListCore';
import {ReorderableListContext} from '../../contexts';
import type {ReorderableListProps} from '../../types';
import {ReorderableListCell} from '../ReorderableListCell';

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList,
) as unknown as <T>(
  props: FlatListProps<T> & {ref?: React.Ref<FlatList<T>>},
) => React.ReactElement;

interface ReorderableListCoreProps<T> extends ReorderableListProps<T> {
  // not optional but undefined to avoid forgetting to pass a prop
  scrollViewContainerRef: React.RefObject<ScrollView> | undefined;
  scrollViewHeightY: SharedValue<number> | undefined;
  scrollViewScrollOffsetY: SharedValue<number> | undefined;
  scrollViewScrollEnabled: SharedValue<boolean> | undefined;
  outerScrollGesture: NativeGesture | undefined;
  initialScrollViewScrollEnabled: boolean | undefined;
  scrollable: boolean | undefined;
  scrollEnabled: boolean | undefined;
}

const ReorderableListCore = <T,>(
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
    scrollViewContainerRef,
    scrollViewHeightY,
    scrollViewScrollOffsetY,
    scrollViewScrollEnabled,
    scrollEnabled,
    initialScrollViewScrollEnabled,
    scrollable,
    outerScrollGesture,
    ...rest
  }: ReorderableListCoreProps<T>,
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
  } = useReorderableListCore({
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
    scrollViewContainerRef,
    scrollViewHeightY,
    scrollViewScrollOffsetY,
    scrollViewScrollEnabled,
    // flatlist will default to true if we pass explicitly undefined,
    // but internally we would treat it as false, so we force true
    initialScrollEnabled:
      typeof scrollEnabled === 'undefined' ? true : scrollEnabled,
    initialScrollViewScrollEnabled:
      typeof initialScrollViewScrollEnabled === 'undefined'
        ? true
        : initialScrollViewScrollEnabled,
    nestedScrollable: scrollable,
  });

  const combinedGesture = useMemo(() => {
    // android is able to handle nested scroll view, but not the full height ones like iOS
    if (outerScrollGesture && !(Platform.OS === 'android' && scrollable)) {
      return Gesture.Simultaneous(outerScrollGesture, gestureHandler);
    }

    return gestureHandler;
  }, [scrollable, outerScrollGesture, gestureHandler]);

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
      <GestureDetector gesture={combinedGesture}>
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
          scrollEnabled={scrollEnabled}
        />
      </GestureDetector>
    </ReorderableListContext.Provider>
  );
};

const MemoizedReorderableListCore = React.memo(
  React.forwardRef(ReorderableListCore),
) as <T>(
  props: ReorderableListCoreProps<T> & {
    ref?: React.ForwardedRef<FlatList<T> | null>;
  },
) => React.ReactElement;

export {MemoizedReorderableListCore as ReorderableListCore};
