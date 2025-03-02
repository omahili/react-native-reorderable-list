import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  ScrollView,
  unstable_batchedUpdates,
} from 'react-native';

import {Gesture, State} from 'react-native-gesture-handler';
import Animated, {
  AnimatedRef,
  Easing,
  SharedValue,
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

import {
  OPACITY_ANIMATION_CONFIG_DEFAULT,
  SCALE_ANIMATION_CONFIG_DEFAULT,
} from './animationDefaults';
import {AUTOSCROLL_CONFIG} from './autoscrollConfig';
import {
  ReorderableListCellAnimations,
  ReorderableListDragEndEvent,
  ReorderableListDragStartEvent,
  ReorderableListIndexChangeEvent,
  ReorderableListState,
} from '../../types';
import type {ReorderableListReorderEvent} from '../../types';

const version = React.version.split('.');
const hasAutomaticBatching = version.length
  ? parseInt(version[0], 10) >= 18
  : false;

interface UseReorderableListCoreArgs<T> {
  ref: React.ForwardedRef<FlatList<T>>;
  autoscrollThreshold: number;
  autoscrollThresholdOffset: {top?: number; bottom?: number} | undefined;
  autoscrollSpeedScale: number;
  autoscrollDelay: number;
  animationDuration: number;
  dragReorderThreshold: number;
  onReorder: (event: ReorderableListReorderEvent) => void;
  onDragStart?: (event: ReorderableListDragStartEvent) => void;
  onDragEnd?: (event: ReorderableListDragEndEvent) => void;
  onIndexChange?: (event: ReorderableListIndexChangeEvent) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  scrollViewContainerRef: React.RefObject<ScrollView> | undefined;
  scrollViewHeightY: SharedValue<number> | undefined;
  scrollViewScrollOffsetY: SharedValue<number> | undefined;
  scrollViewScrollEnabled: SharedValue<boolean> | undefined;
  initialScrollEnabled: boolean | undefined;
  initialScrollViewScrollEnabled: boolean | undefined;
  nestedScrollable: boolean | undefined;
  cellAnimations: ReorderableListCellAnimations | undefined;
  shouldUpdateActiveItem: boolean | undefined;
  panEnabled: boolean;
  panActivateAfterLongPress: number | undefined;
}

export const useReorderableListCore = <T>({
  ref,
  autoscrollThreshold,
  autoscrollThresholdOffset,
  autoscrollSpeedScale,
  autoscrollDelay,
  animationDuration,
  dragReorderThreshold,
  onReorder,
  onDragStart,
  onDragEnd,
  onLayout,
  onIndexChange,
  scrollViewContainerRef,
  scrollViewHeightY,
  scrollViewScrollOffsetY,
  scrollViewScrollEnabled,
  initialScrollEnabled,
  initialScrollViewScrollEnabled,
  nestedScrollable,
  cellAnimations,
  shouldUpdateActiveItem,
  panActivateAfterLongPress,
  panEnabled,
}: UseReorderableListCoreArgs<T>) => {
  const flatListRef = useAnimatedRef<FlatList>();
  const [activeIndex, setActiveIndex] = useState(-1);
  const scrollEnabled = useSharedValue(initialScrollEnabled);
  const gestureState = useSharedValue<State>(State.UNDETERMINED);
  const currentY = useSharedValue(0);
  const currentTranslationY = useSharedValue(0);
  const flatListScrollOffsetY = useSharedValue(0);
  const flatListHeightY = useSharedValue(0);
  const nestedFlatListPositionY = useSharedValue(0);
  const dragScrollTranslationY = useSharedValue(0);
  const dragInitialScrollOffsetY = useSharedValue(0);
  const scrollViewDragScrollTranslationY = useSharedValue(0);
  const scrollViewDragInitialScrollOffsetY = useSharedValue(0);
  const draggedHeight = useSharedValue(0);
  const itemOffset = useSharedValue<number[]>([]);
  const itemHeight = useSharedValue<number[]>([]);
  const autoscrollTrigger = useSharedValue(-1);
  const lastAutoscrollTrigger = useSharedValue(-1);
  const previousY = useSharedValue(0);
  const dragY = useSharedValue(0);
  const previousDirection = useSharedValue(0);
  const previousIndex = useSharedValue(-1);
  const currentIndex = useSharedValue(-1);
  const draggedIndex = useSharedValue(-1);
  const state = useSharedValue<ReorderableListState>(ReorderableListState.IDLE);
  const dragEndHandlers = useSharedValue<
    ((from: number, to: number) => void)[][]
  >([]);
  const startY = useSharedValue(0);
  const duration = useSharedValue(animationDuration);
  const scaleDefault = useSharedValue(1);
  const opacityDefault = useSharedValue(1);

  useEffect(() => {
    duration.value = animationDuration;
  }, [duration, animationDuration]);

  const listContextValue = useMemo(
    () => ({
      draggedHeight,
      currentIndex,
      draggedIndex,
      dragEndHandlers,
      activeIndex,
      cellAnimations: {
        ...cellAnimations,
        transform:
          cellAnimations && 'transform' in cellAnimations
            ? cellAnimations.transform
            : [{scale: scaleDefault}],
        opacity:
          cellAnimations && 'opacity' in cellAnimations
            ? cellAnimations.opacity
            : opacityDefault,
      },
    }),
    [
      draggedHeight,
      currentIndex,
      draggedIndex,
      dragEndHandlers,
      activeIndex,
      cellAnimations,
      scaleDefault,
      opacityDefault,
    ],
  );

  const panGestureHandler = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(e => {
          // prevent new dragging until item is completely released
          if (state.value === ReorderableListState.IDLE) {
            startY.value = e.y;
            currentY.value = e.y;
            currentTranslationY.value = e.translationY;
            dragY.value = e.translationY;
            gestureState.value = e.state;
          }
        })
        .onUpdate(e => {
          if (state.value !== ReorderableListState.RELEASED) {
            currentY.value = startY.value + e.translationY;
            currentTranslationY.value = e.translationY;
            dragY.value =
              e.translationY +
              dragScrollTranslationY.value +
              scrollViewDragScrollTranslationY.value;
            gestureState.value = e.state;
          }
        })
        .onEnd(e => (gestureState.value = e.state))
        .onFinalize(e => (gestureState.value = e.state)),
    [
      currentTranslationY,
      currentY,
      dragScrollTranslationY,
      scrollViewDragScrollTranslationY,
      gestureState,
      dragY,
      startY,
      state,
    ],
  );

  const panGestureHandlerWithOptions = useMemo(() => {
    if (typeof panActivateAfterLongPress === 'number') {
      panGestureHandler.activateAfterLongPress(panActivateAfterLongPress);
    }

    if (!panEnabled) {
      panGestureHandler.enabled(panEnabled);
    }

    return panGestureHandler;
  }, [panActivateAfterLongPress, panEnabled, panGestureHandler]);

  const gestureHandler = useMemo(
    () => Gesture.Simultaneous(Gesture.Native(), panGestureHandlerWithOptions),
    [panGestureHandlerWithOptions],
  );

  const setScrollEnabled = useCallback(
    (enabled: boolean) => {
      // if scroll is enabled on list props then we can toggle it
      if (initialScrollEnabled) {
        scrollEnabled.value = enabled;
        flatListRef.current?.setNativeProps({scrollEnabled: enabled});
      }

      if (
        scrollViewContainerRef &&
        scrollViewScrollEnabled &&
        initialScrollViewScrollEnabled
      ) {
        scrollViewScrollEnabled.value = enabled;
        scrollViewContainerRef.current?.setNativeProps({
          scrollEnabled: enabled,
        });
      }
    },
    [
      initialScrollEnabled,
      flatListRef,
      scrollEnabled,
      initialScrollViewScrollEnabled,
      scrollViewContainerRef,
      scrollViewScrollEnabled,
    ],
  );

  const resetSharedValues = useCallback(() => {
    'worklet';

    state.value = ReorderableListState.IDLE;
    draggedIndex.value = -1;
    dragY.value = 0;
    dragScrollTranslationY.value = 0;
    scrollViewDragScrollTranslationY.value = 0;
  }, [
    draggedIndex,
    dragY,
    dragScrollTranslationY,
    scrollViewDragScrollTranslationY,
    state,
  ]);

  const resetSharedValuesAfterAnimations = useCallback(() => {
    setTimeout(runOnUI(resetSharedValues), duration.value);
  }, [resetSharedValues, duration]);

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

      const relativeY = flatListScrollOffsetY.value + y;
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
      flatListScrollOffsetY,
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

        onIndexChange?.({index: newIndex});
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
      onIndexChange,
    ],
  );

  const runDefaultDragAnimations = useCallback(
    (type: 'start' | 'end') => {
      'worklet';

      // if no custom scale run default
      if (!(cellAnimations && 'transformtra' in cellAnimations)) {
        const scaleConfig = SCALE_ANIMATION_CONFIG_DEFAULT[type];
        scaleDefault.value = withTiming(scaleConfig.toValue, scaleConfig);
      }

      // if no custom opacity run the default
      if (!(cellAnimations && 'opacity' in cellAnimations)) {
        const opacityConfig = OPACITY_ANIMATION_CONFIG_DEFAULT[type];
        opacityDefault.value = withTiming(opacityConfig.toValue, opacityConfig);
      }
    },
    [cellAnimations, scaleDefault, opacityDefault],
  );

  useAnimatedReaction(
    () => gestureState.value,
    () => {
      if (
        gestureState.value !== State.ACTIVE &&
        gestureState.value !== State.BEGAN &&
        (state.value === ReorderableListState.DRAGGED ||
          state.value === ReorderableListState.AUTOSCROLL)
      ) {
        state.value = ReorderableListState.RELEASED;

        // enable back scroll on releasing
        runOnJS(setScrollEnabled)(true);

        if (shouldUpdateActiveItem) {
          runOnJS(setActiveIndex)(-1);
        }

        // trigger onDragEnd event
        let e = {from: draggedIndex.value, to: currentIndex.value};
        onDragEnd?.(e);

        const handlers = dragEndHandlers.value[draggedIndex.value];
        if (Array.isArray(handlers)) {
          handlers.forEach(fn => fn(e.from, e.to));
        }

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

        runDefaultDragAnimations('end');

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
          runOnJS(resetSharedValuesAfterAnimations)();
        }
      }
    },
  );

  const calculateHiddenArea = useCallback(() => {
    'worklet';
    if (!scrollViewScrollOffsetY || !scrollViewHeightY) {
      return {top: 0, bottom: 0};
    }

    // hidden area cannot be negative
    const top = Math.max(
      0,
      scrollViewScrollOffsetY.value - nestedFlatListPositionY.value,
    );
    const bottom = Math.max(
      0,
      nestedFlatListPositionY.value +
        flatListHeightY.value -
        (scrollViewScrollOffsetY.value + scrollViewHeightY.value),
    );

    return {top, bottom};
  }, [
    scrollViewScrollOffsetY,
    scrollViewHeightY,
    nestedFlatListPositionY,
    flatListHeightY,
  ]);

  const calculateThresholdArea = useCallback(
    (hiddenArea: {top: number; bottom: number}) => {
      'worklet';
      const offsetTop = Math.max(0, autoscrollThresholdOffset?.top || 0);
      const offsetBottom = Math.max(0, autoscrollThresholdOffset?.bottom || 0);
      const threshold = Math.max(0, Math.min(autoscrollThreshold, 0.4));
      const visibleHeight =
        flatListHeightY.value -
        (hiddenArea.top + hiddenArea.bottom) -
        (offsetTop + offsetBottom);

      const area = visibleHeight * threshold;
      const top = area + offsetTop;
      const bottom = flatListHeightY.value - area - offsetBottom;

      return {top, bottom};
    },
    [autoscrollThreshold, autoscrollThresholdOffset, flatListHeightY],
  );

  const calculateThresholdAreaParent = useCallback(
    (hiddenArea: {top: number; bottom: number}) => {
      'worklet';
      const offsetTop = Math.max(0, autoscrollThresholdOffset?.top || 0);
      const offsetBottom = Math.max(0, autoscrollThresholdOffset?.bottom || 0);
      const threshold = Math.max(0, Math.min(autoscrollThreshold, 0.4));

      const area = flatListHeightY.value * threshold;
      const top = area + offsetTop;
      const bottom = flatListHeightY.value - area - offsetBottom;

      // if the hidden area is 0 then we don't have a threshold area
      // we might have floating errors like 0.0001 which we should ignore
      return {
        top: hiddenArea.top > 0.1 ? top + hiddenArea.top : 0,
        bottom: hiddenArea.bottom > 0.1 ? bottom - hiddenArea.bottom : 0,
      };
    },
    [autoscrollThreshold, autoscrollThresholdOffset, flatListHeightY],
  );

  const shouldScrollParent = useCallback(
    (y: number) => {
      'worklet';
      const hiddenArea = calculateHiddenArea();
      const thresholdAreaParent = calculateThresholdAreaParent(hiddenArea);

      // we might have floating errors like 0.0001 which we should ignore
      return (
        (hiddenArea.top > 0.1 && y <= thresholdAreaParent.top) ||
        (hiddenArea.bottom > 0.1 && y >= thresholdAreaParent.bottom)
      );
    },
    [calculateHiddenArea, calculateThresholdAreaParent],
  );

  const scrollDirection = useCallback(
    (y: number) => {
      'worklet';
      const hiddenArea = calculateHiddenArea();

      if (shouldScrollParent(y)) {
        const thresholdAreaParent = calculateThresholdAreaParent(hiddenArea);
        if (y <= thresholdAreaParent.top) {
          return -1;
        }

        if (y >= thresholdAreaParent.bottom) {
          return 1;
        }

        return 0;
      } else if (nestedScrollable) {
        const thresholdArea = calculateThresholdArea(hiddenArea);
        if (y <= thresholdArea.top) {
          return -1;
        }

        if (y >= thresholdArea.bottom) {
          return 1;
        }
      }

      return 0;
    },
    [
      nestedScrollable,
      shouldScrollParent,
      calculateHiddenArea,
      calculateThresholdArea,
      calculateThresholdAreaParent,
    ],
  );

  useAnimatedReaction(
    () => currentY.value + scrollViewDragScrollTranslationY.value,
    y => {
      if (
        state.value === ReorderableListState.DRAGGED ||
        state.value === ReorderableListState.AUTOSCROLL
      ) {
        setCurrentIndex(y);

        // Trigger scrolls when:
        // 1. Within the threshold area (top or bottom of list)
        // 2. Have dragged in the same direction as the scroll
        const currentDragDirection = currentTranslationY.value > 0 ? 1 : -1;
        if (
          state.value === ReorderableListState.DRAGGED &&
          currentDragDirection === scrollDirection(y)
        ) {
          lastAutoscrollTrigger.value = autoscrollTrigger.value;
          autoscrollTrigger.value *= -1;
          state.value = ReorderableListState.AUTOSCROLL;
        } else if (state.value === ReorderableListState.AUTOSCROLL) {
          state.value = ReorderableListState.DRAGGED;
        }
      }
    },
  );

  useAnimatedReaction(
    () => autoscrollTrigger.value,
    () => {
      if (
        autoscrollTrigger.value !== lastAutoscrollTrigger.value &&
        state.value === ReorderableListState.AUTOSCROLL
      ) {
        let y = currentY.value + scrollViewDragScrollTranslationY.value;
        const autoscrollIncrement =
          scrollDirection(y) *
          AUTOSCROLL_CONFIG.increment *
          autoscrollSpeedScale;

        if (autoscrollIncrement !== 0) {
          let scrollOffset = flatListScrollOffsetY.value;
          let listRef =
            flatListRef as unknown as AnimatedRef<Animated.ScrollView>;

          if (shouldScrollParent(y) && scrollViewScrollOffsetY) {
            scrollOffset = scrollViewScrollOffsetY.value;
            listRef =
              scrollViewContainerRef as unknown as AnimatedRef<Animated.ScrollView>;
          }

          scrollTo(listRef, 0, scrollOffset + autoscrollIncrement, true);
        }

        // when autoscrolling user may not be moving his finger so we need
        // to update the current position of the dragged item here
        setCurrentIndex(y);
      }
    },
  );

  // flatlist scroll handler
  const handleScroll = useAnimatedScrollHandler(e => {
    flatListScrollOffsetY.value = e.contentOffset.y;

    // checking if the list is not scrollable instead of the scrolling state
    // fixes a bug on iOS where the item is shifted after autoscrolling and then
    // moving away from autoscroll area
    if (!scrollEnabled.value) {
      dragScrollTranslationY.value =
        flatListScrollOffsetY.value - dragInitialScrollOffsetY.value;
    }

    if (state.value === ReorderableListState.AUTOSCROLL) {
      dragY.value =
        currentTranslationY.value +
        dragScrollTranslationY.value +
        scrollViewDragScrollTranslationY.value;

      lastAutoscrollTrigger.value = autoscrollTrigger.value;
      autoscrollTrigger.value = withDelay(
        autoscrollDelay,
        withTiming(autoscrollTrigger.value * -1, {duration: 0}),
      );
    }
  });

  // parent scroll handler
  useAnimatedReaction(
    () => scrollViewScrollOffsetY?.value,
    value => {
      if (value && scrollViewScrollEnabled) {
        // checking if the list is not scrollable instead of the scrolling state
        // fixes a bug on iOS where the item is shifted after autoscrolling and then
        // moving await from autoscroll area
        if (!scrollViewScrollEnabled.value) {
          scrollViewDragScrollTranslationY.value =
            value - scrollViewDragInitialScrollOffsetY.value;
        }

        if (state.value === ReorderableListState.AUTOSCROLL) {
          dragY.value =
            currentTranslationY.value + scrollViewDragScrollTranslationY.value;

          lastAutoscrollTrigger.value = autoscrollTrigger.value;
          autoscrollTrigger.value = withDelay(
            autoscrollDelay,
            withTiming(autoscrollTrigger.value * -1, {duration: 0}),
          );
        }
      }
    },
  );

  const startDrag = useCallback(
    (index: number) => {
      'worklet';

      // allow new drag when item is completely released
      if (state.value === ReorderableListState.IDLE) {
        // resetting shared values again fixes a flickeing bug in nested lists where
        // after scrolling the parent list it would offset the new dragged item in another nested list
        resetSharedValues();

        if (shouldUpdateActiveItem) {
          runOnJS(setActiveIndex)(index);
        }

        dragInitialScrollOffsetY.value = flatListScrollOffsetY.value;
        scrollViewDragInitialScrollOffsetY.value = scrollViewScrollOffsetY
          ? scrollViewScrollOffsetY.value
          : 0;

        draggedHeight.value = itemHeight.value[index];
        draggedIndex.value = index;
        previousIndex.value = -1;
        currentIndex.value = index;
        state.value = ReorderableListState.DRAGGED;

        runOnJS(setScrollEnabled)(false);

        // run animation before onDragStart to avoid potentially waiting for it
        runDefaultDragAnimations('start');
        onDragStart?.({index});
      }
    },
    [
      resetSharedValues,
      shouldUpdateActiveItem,
      dragInitialScrollOffsetY,
      scrollViewScrollOffsetY,
      scrollViewDragInitialScrollOffsetY,
      setScrollEnabled,
      currentIndex,
      previousIndex,
      draggedHeight,
      draggedIndex,
      state,
      flatListScrollOffsetY,
      itemHeight,
      onDragStart,
      runDefaultDragAnimations,
    ],
  );

  const handleFlatListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      nestedFlatListPositionY.value = e.nativeEvent.layout.y;
      flatListHeightY.value = e.nativeEvent.layout.height;

      onLayout?.(e);
    },
    [nestedFlatListPositionY, flatListHeightY, onLayout],
  );

  const handleRef = (value: FlatList<T>) => {
    flatListRef(value);

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
    dragY,
    duration,
  };
};
