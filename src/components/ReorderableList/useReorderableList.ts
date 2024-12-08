import React, {useCallback, useMemo} from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  unstable_batchedUpdates,
} from 'react-native';

import {Gesture, State} from 'react-native-gesture-handler';
import Animated, {
  AnimatedRef,
  Easing,
  cancelAnimation,
  measure,
  runOnJS,
  runOnUI,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {AUTOSCROLL_INCREMENT} from './constants';
import {ReorderableListState} from '../../types';
import type {ReorderableListReorderEvent} from '../../types';

const version = React.version.split('.');
const hasAutomaticBatching = version.length
  ? parseInt(version[0], 10) >= 18
  : false;

interface UseReorderableListArgs<T> {
  ref: React.ForwardedRef<FlatList<T>>;
  autoscrollThreshold: number;
  autoscrollSpeedScale: number;
  autoscrollDelay: number;
  animationDuration: number;
  dragReorderThreshold: number;
  onReorder: (event: ReorderableListReorderEvent) => void;
  onScroll?: (event: NativeScrollEvent) => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

export const useReorderableList = <T>({
  ref,
  autoscrollThreshold,
  autoscrollSpeedScale,
  autoscrollDelay,
  animationDuration,
  dragReorderThreshold,
  onLayout,
  onReorder,
  onScroll,
}: UseReorderableListArgs<T>) => {
  const scrollEnabled = useSharedValue(true);
  const flatList = useAnimatedRef<FlatList>();
  const gestureState = useSharedValue<State>(State.UNDETERMINED);
  const currentY = useSharedValue(0);
  const currentTranslationY = useSharedValue(0);
  const containerPositionY = useSharedValue(0);
  const currentScrollOffsetY = useSharedValue(0);
  const dragScrollTranslationY = useSharedValue(0);
  const dragInitialScrollOffsetY = useSharedValue(0);
  const draggedHeight = useSharedValue(0);
  const itemOffset = useSharedValue<number[]>([]);
  const itemHeight = useSharedValue<number[]>([]);
  const topAutoscrollArea = useSharedValue(0);
  const bottomAutoscrollArea = useSharedValue(0);
  const autoscrollTrigger = useSharedValue(-1);
  const lastAutoscrollTrigger = useSharedValue(-1);
  const previousY = useSharedValue(0);
  const dragY = useSharedValue(0);
  const previousDirection = useSharedValue(0);
  const previousIndex = useSharedValue(-1);
  const currentIndex = useSharedValue(-1);
  const draggedIndex = useSharedValue(-1);
  const releasedIndex = useSharedValue(-1);
  const state = useSharedValue<ReorderableListState>(ReorderableListState.IDLE);

  // animation duration as a shared value allows to avoid re-rendering of all cells on value change
  const duration = useSharedValue(animationDuration);
  if (duration.value !== animationDuration) {
    duration.value = animationDuration;
  }

  const listContextValue = useMemo(
    () => ({
      draggedHeight,
      currentIndex,
      draggedIndex,
    }),
    [draggedHeight, currentIndex, draggedIndex],
  );

  const startY = useSharedValue(0);

  const panGestureHandler = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(e => {
          // prevent new dragging until item is completely released
          if (state.value === ReorderableListState.IDLE) {
            const relativeY = e.absoluteY - containerPositionY.value;

            startY.value = relativeY;
            currentY.value = relativeY;
            currentTranslationY.value = e.translationY;
            if (draggedIndex.value >= 0) {
              dragY.value = e.translationY;
            }
            gestureState.value = e.state;
          }
        })
        .onUpdate(e => {
          if (state.value !== ReorderableListState.RELEASING) {
            currentY.value = startY.value + e.translationY;
            currentTranslationY.value = e.translationY;
            if (draggedIndex.value >= 0) {
              dragY.value = e.translationY + dragScrollTranslationY.value;
            }
            gestureState.value = e.state;
          }
        })
        .onEnd(e => (gestureState.value = e.state))
        .onFinalize(e => (gestureState.value = e.state)),
    [
      containerPositionY,
      currentTranslationY,
      currentY,
      dragScrollTranslationY,
      draggedIndex,
      gestureState,
      dragY,
      startY,
      state,
    ],
  );

  const gestureHandler = useMemo(
    () => Gesture.Simultaneous(Gesture.Native(), panGestureHandler),
    [panGestureHandler],
  );

  const setScrollEnabled = useCallback(
    (enabled: boolean) => {
      scrollEnabled.value = enabled;
      flatList.current?.setNativeProps({scrollEnabled: enabled});
    },
    [flatList, scrollEnabled],
  );

  const resetSharedValues = useCallback(() => {
    'worklet';

    // must be reset before the reorder function is called
    // to avoid triggering on drag end event twice
    releasedIndex.value = -1;
    draggedIndex.value = -1;
    // current index is reset on item render for the on end event
    dragY.value = 0;
    // released flag is reset after release is triggered in the item
    state.value = ReorderableListState.IDLE;
    dragScrollTranslationY.value = 0;
  }, [releasedIndex, draggedIndex, dragY, state, dragScrollTranslationY]);

  const reorder = (fromIndex: number, toIndex: number) => {
    runOnUI(resetSharedValues)();

    if (fromIndex !== toIndex) {
      const updateState = () => {
        onReorder({from: fromIndex, to: toIndex});
      };

      if (!hasAutomaticBatching) {
        unstable_batchedUpdates(updateState);
      } else {
        updateState();
      }
    }
  };

  const getIndexFromY = useCallback(
    (y: number) => {
      'worklet';

      const relativeY = currentScrollOffsetY.value + y;
      const count = itemOffset.value.length;

      for (let i = 0; i < count; i++) {
        if (currentIndex.value === i) {
          continue;
        }

        const direction = i > currentIndex.value ? 1 : -1;
        const threshold = Math.max(0, Math.min(1, dragReorderThreshold));
        const height = itemHeight.value[i];
        const offset = itemOffset.value[i] + height * threshold * direction;

        if (
          (i === 0 && relativeY <= offset) ||
          (i === count - 1 && relativeY >= offset + height) ||
          (relativeY >= offset && relativeY <= offset + height)
        ) {
          return {index: i, direction};
        }
      }

      return {
        index: currentIndex.value,
        direction: previousDirection.value,
      };
    },
    [
      dragReorderThreshold,
      currentIndex,
      currentScrollOffsetY,
      previousDirection,
      itemOffset,
      itemHeight,
    ],
  );

  const setCurrentIndex = useCallback(
    (y: number) => {
      'worklet';

      const {index: newIndex, direction: newDirection} = getIndexFromY(y);
      const delta = Math.abs(previousY.value - y);

      if (
        currentIndex.value !== newIndex &&
        // if the same two items re-swap index check delta and direction to avoid swap flickering
        (previousIndex.value !== newIndex ||
          (previousDirection.value !== newDirection && delta >= 5))
      ) {
        const itemDirection = newIndex > currentIndex.value;
        const index1 = itemDirection ? currentIndex.value : newIndex;
        const index2 = itemDirection ? newIndex : currentIndex.value;

        const newOffset1 = itemOffset.value[index1];
        const newHeight1 = itemHeight.value[index2];
        const newOffset2 =
          itemOffset.value[index2] +
          (itemHeight.value[index2] - itemHeight.value[index1]);
        const newHeight2 = itemHeight.value[index1];

        itemOffset.value[index1] = newOffset1;
        itemHeight.value[index1] = newHeight1;
        itemOffset.value[index2] = newOffset2;
        itemHeight.value[index2] = newHeight2;

        previousY.value = y;
        previousDirection.value = newDirection;
        previousIndex.value = currentIndex.value;
        currentIndex.value = newIndex;
      }
    },
    [
      currentIndex,
      previousIndex,
      previousDirection,
      previousY,
      itemOffset,
      itemHeight,
      getIndexFromY,
    ],
  );

  useAnimatedReaction(
    () => gestureState.value,
    () => {
      if (
        gestureState.value !== State.ACTIVE &&
        gestureState.value !== State.BEGAN &&
        (state.value === ReorderableListState.DRAGGING ||
          state.value === ReorderableListState.AUTO_SCROLL)
      ) {
        state.value = ReorderableListState.RELEASING;
        releasedIndex.value = draggedIndex.value;

        // enable back scroll on releasing
        runOnJS(setScrollEnabled)(true);

        // they are actually swapped on drag translation
        const currentItemOffset = itemOffset.value[draggedIndex.value];
        const currentItemHeight = itemHeight.value[draggedIndex.value];
        const draggedItemOffset = itemOffset.value[currentIndex.value];
        const draggedItemHeight = itemHeight.value[currentIndex.value];

        const newTopPosition =
          currentIndex.value > draggedIndex.value
            ? draggedItemOffset - currentItemOffset
            : draggedItemOffset -
              currentItemOffset +
              (draggedItemHeight - currentItemHeight);

        if (dragY.value !== newTopPosition) {
          // animate dragged item to its new position on release
          dragY.value = withTiming(
            newTopPosition,
            {
              duration: duration.value,
              easing: Easing.out(Easing.ease),
            },
            () => {
              runOnJS(reorder)(draggedIndex.value, currentIndex.value);
            },
          );
        } else {
          // user might drag and release the item without moving it so,
          // since the animation end callback is not executed in that case
          // we need to reset values as the reorder function would do
          resetSharedValues();
        }
      }
    },
  );

  useAnimatedReaction(
    () => currentY.value,
    y => {
      if (
        state.value === ReorderableListState.DRAGGING ||
        state.value === ReorderableListState.AUTO_SCROLL
      ) {
        setCurrentIndex(y);

        if (y <= topAutoscrollArea.value || y >= bottomAutoscrollArea.value) {
          if (state.value !== ReorderableListState.AUTO_SCROLL) {
            // trigger autoscroll
            lastAutoscrollTrigger.value = autoscrollTrigger.value;
            autoscrollTrigger.value *= -1;
          }
          state.value = ReorderableListState.AUTO_SCROLL;
        } else {
          state.value = ReorderableListState.DRAGGING;
        }
      }
    },
  );

  useAnimatedReaction(
    () => autoscrollTrigger.value,
    () => {
      if (
        autoscrollTrigger.value !== lastAutoscrollTrigger.value &&
        state.value === ReorderableListState.AUTO_SCROLL
      ) {
        const autoscrollIncrement =
          (currentY.value <= topAutoscrollArea.value
            ? -AUTOSCROLL_INCREMENT
            : AUTOSCROLL_INCREMENT) * autoscrollSpeedScale;

        if (autoscrollIncrement !== 0) {
          scrollTo(
            flatList as unknown as AnimatedRef<Animated.ScrollView>,
            0,
            currentScrollOffsetY.value + autoscrollIncrement,
            true,
          );
        }

        // when autoscrolling user may not be moving his finger so we need
        // to update the current position of the dragged item here
        setCurrentIndex(currentY.value);
      }
    },
  );

  const handleScroll = useAnimatedScrollHandler(e => {
    currentScrollOffsetY.value = e.contentOffset.y;

    // checking if the list is not scrollable instead of the scrolling state
    // fixes a bug on iOS where the item is shifted after autoscrolling and then
    // moving await from autoscroll area
    if (!scrollEnabled.value) {
      dragScrollTranslationY.value =
        currentScrollOffsetY.value - dragInitialScrollOffsetY.value;
    }

    if (state.value === ReorderableListState.AUTO_SCROLL) {
      dragY.value = currentTranslationY.value + dragScrollTranslationY.value;

      cancelAnimation(autoscrollTrigger);

      lastAutoscrollTrigger.value = autoscrollTrigger.value;
      autoscrollTrigger.value = withDelay(
        autoscrollDelay,
        withTiming(autoscrollTrigger.value * -1, {duration: 0}),
      );
    } else {
    }

    if (onScroll) {
      onScroll(e);
    }
  });

  const startDrag = useCallback(
    (index: number) => {
      'worklet';

      // allow new drag when item is completely released
      if (state.value === ReorderableListState.IDLE) {
        draggedHeight.value = itemHeight.value[index];
        draggedIndex.value = index;
        previousIndex.value = -1;
        currentIndex.value = index;
        state.value = ReorderableListState.DRAGGING;
        dragInitialScrollOffsetY.value = currentScrollOffsetY.value;

        runOnJS(setScrollEnabled)(false);
      }
    },
    [
      setScrollEnabled,
      currentIndex,
      previousIndex,
      draggedHeight,
      draggedIndex,
      state,
      currentScrollOffsetY,
      dragInitialScrollOffsetY,
      itemHeight,
    ],
  );

  const measureFlatList = useCallback(() => {
    'worklet';

    const measurement = measure(flatList);
    if (measurement === null) {
      return;
    }

    containerPositionY.value = measurement.pageY;
  }, [flatList, containerPositionY]);

  const handleFlatListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      runOnUI(measureFlatList)();

      const threshold = Math.max(0, Math.min(autoscrollThreshold, 0.4));
      const {height} = e.nativeEvent.layout;

      topAutoscrollArea.value = height * threshold;
      bottomAutoscrollArea.value = height * (1 - threshold);

      if (onLayout) {
        onLayout(e);
      }
    },
    [
      measureFlatList,
      topAutoscrollArea,
      bottomAutoscrollArea,
      autoscrollThreshold,
      onLayout,
    ],
  );

  const handleRef = (value: FlatList<T>) => {
    flatList(value);

    if (typeof ref === 'function') {
      ref(value);
    } else if (ref) {
      ref.current = value;
    }
  };

  return {
    gestureHandler,
    handleScroll,
    handleFlatListLayout,
    handleRef,
    startDrag,
    listContextValue,
    itemOffset,
    itemHeight,
    draggedIndex,
    releasedIndex,
    dragY,
    duration,
  };
};
