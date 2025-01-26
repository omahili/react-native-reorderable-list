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
import Animated, {
  SharedValue,
  useComposedEventHandler,
} from 'react-native-reanimated';

import {AUTOSCROLL_CONFIG} from './autoscrollConfig';
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
    autoscrollThreshold = 0.1,
    autoscrollThresholdOffset,
    autoscrollSpeedScale = 1,
    autoscrollDelay = AUTOSCROLL_CONFIG.delay,
    animationDuration = 200,
    dragReorderThreshold = 0.2,
    onLayout,
    onReorder,
    onScroll,
    onDragStart,
    onDragEnd,
    scrollViewContainerRef,
    scrollViewHeightY,
    scrollViewScrollOffsetY,
    scrollViewScrollEnabled,
    initialScrollViewScrollEnabled,
    scrollable,
    outerScrollGesture,
    cellAnimations,
    shouldUpdateActiveItem,
    panEnabled = true,
    panActivateAfterLongPress,
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
    autoscrollThresholdOffset,
    autoscrollSpeedScale,
    autoscrollDelay,
    animationDuration,
    dragReorderThreshold,
    onLayout,
    onReorder,
    onDragStart,
    onDragEnd,
    scrollViewContainerRef,
    scrollViewHeightY,
    scrollViewScrollOffsetY,
    scrollViewScrollEnabled,
    // flatlist will default to true if we pass explicitly undefined,
    // but internally we would treat it as false, so we force true
    initialScrollEnabled:
      typeof rest.scrollEnabled === 'undefined' ? true : rest.scrollEnabled,
    initialScrollViewScrollEnabled:
      typeof initialScrollViewScrollEnabled === 'undefined'
        ? true
        : initialScrollViewScrollEnabled,
    nestedScrollable: scrollable,
    cellAnimations,
    shouldUpdateActiveItem,
    panEnabled,
    panActivateAfterLongPress,
  });

  const combinedGesture = useMemo(() => {
    // android is able to handle nested scroll view, but not the full height ones like iOS
    if (outerScrollGesture && !(Platform.OS === 'android' && scrollable)) {
      return Gesture.Simultaneous(outerScrollGesture, gestureHandler);
    }

    return gestureHandler;
  }, [scrollable, outerScrollGesture, gestureHandler]);

  const composedScrollHandler = useComposedEventHandler([
    handleScroll,
    onScroll || null,
  ]);

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
          CellRendererComponent={renderAnimatedCell}
          onLayout={handleFlatListLayout}
          onScroll={composedScrollHandler}
          scrollEventThrottle={1}
          horizontal={false}
          removeClippedSubviews={false}
          numColumns={1}
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
