import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  CellRendererProps,
  FlatList,
  FlatListProps,
  LayoutChangeEvent,
  Platform,
  ScrollView,
} from 'react-native';

import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  NativeGesture,
  PanGestureHandlerEventPayload,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  AnimatedRef,
  Easing,
  SharedValue,
  measure,
  runOnJS,
  runOnUI,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useComposedEventHandler,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import {ReorderableListContext} from '../contexts';
import {ReorderableListProps, ReorderableListState} from '../types';
import {
  AUTOSCROLL_CONFIG,
  OPACITY_ANIMATION_CONFIG_DEFAULT,
  SCALE_ANIMATION_CONFIG_DEFAULT,
} from './constants';
import {ReorderableListCell} from './ReorderableListCell';

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList,
) as unknown as <T>(
  props: FlatListProps<T> & {ref?: React.Ref<FlatList<T>>},
) => React.ReactElement;

interface ReorderableListCoreProps<T> extends ReorderableListProps<T> {
  // Not optional but undefined to force passing the prop.
  scrollViewContainerRef: React.RefObject<ScrollView> | undefined;
  scrollViewPageY: SharedValue<number> | undefined;
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
    autoscrollActivationDelta = 5,
    animationDuration = 200,
    onLayout,
    onReorder,
    onScroll,
    onDragStart,
    onDragEnd,
    onIndexChange,
    scrollViewContainerRef,
    scrollViewPageY,
    scrollViewHeightY,
    scrollViewScrollOffsetY,
    scrollViewScrollEnabled,
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
  // FlatList will default to true if we pass explicitly undefined,
  // but internally we would treat it as false, so we force true.
  const initialScrollEnabled =
    typeof rest.scrollEnabled === 'undefined' ? true : rest.scrollEnabled;
  const initialScrollViewScrollEnabled =
    typeof rest.initialScrollViewScrollEnabled === 'undefined'
      ? true
      : rest.initialScrollViewScrollEnabled;

  const flatListRef = useAnimatedRef<FlatList>();
  const [activeIndex, setActiveIndex] = useState(-1);
  const scrollEnabled = useSharedValue(initialScrollEnabled);
  const gestureState = useSharedValue<State>(State.UNDETERMINED);
  const currentY = useSharedValue(0);
  const currentTranslationY = useSharedValue(0);
  const currentItemDragCenterY = useSharedValue<number | null>(null);
  const startItemDragCenterY = useSharedValue<number>(0);
  const flatListScrollOffsetY = useSharedValue(0);
  const flatListHeightY = useSharedValue(0);
  const flatListPageY = useSharedValue(0);
  // The scroll y translation of the list since drag start
  const dragScrollTranslationY = useSharedValue(0);
  // The initial scroll offset y of the list on drag start
  const dragInitialScrollOffsetY = useSharedValue(0);
  // The scroll y translation of the ScrollViewContainer since drag start
  const scrollViewDragScrollTranslationY = useSharedValue(0);
  // The initial scroll offset y of the ScrollViewContainer on drag start
  const scrollViewDragInitialScrollOffsetY = useSharedValue(0);
  const draggedHeight = useSharedValue(0);
  const itemOffset = useSharedValue<number[]>([]);
  const itemHeight = useSharedValue<number[]>([]);
  const autoscrollTrigger = useSharedValue(-1);
  const lastAutoscrollTrigger = useSharedValue(-1);
  const dragY = useSharedValue(0);
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
  const dragDirection = useSharedValue(0);
  const lastDragDirectionPivot = useSharedValue<number | null>(null);
  const autoscrollDelta = useSharedValue(autoscrollActivationDelta);

  // Position of the list relative to the scroll container
  const nestedFlatListPositionY = useDerivedValue(
    () => flatListPageY.value - (scrollViewPageY?.value || 0),
  );

  useEffect(() => {
    duration.value = animationDuration;
    autoscrollDelta.value = autoscrollActivationDelta;
  }, [duration, animationDuration, autoscrollDelta, autoscrollActivationDelta]);

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

  /**
   * Decides the intended drag direction of the user.
   * This is used to to determine if the user intends to autoscroll
   * when within the threshold area.
   *
   * @param e - The payload of the pan gesture update event.
   */
  const setDragDirection = useCallback(
    (e: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      'worklet';

      const direction = e.velocityY > 0 ? 1 : -1;
      if (direction !== dragDirection.value) {
        if (lastDragDirectionPivot.value === null) {
          lastDragDirectionPivot.value = e.absoluteY;
        } else if (
          Math.abs(e.absoluteY - lastDragDirectionPivot.value) >=
          autoscrollDelta.value
        ) {
          dragDirection.value = direction;
          lastDragDirectionPivot.value = e.absoluteY;
        }
      }
    },
    [dragDirection, lastDragDirectionPivot, autoscrollDelta],
  );

  const setCurrentItemDragCenterY = useCallback(
    (e: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      'worklet';

      if (currentItemDragCenterY.value === null) {
        if (currentIndex.value >= 0) {
          const itemCenter = itemHeight.value[currentIndex.value] * 0.5;
          // the y coordinate of the item relative to the list
          const itemY =
            itemOffset.value[currentIndex.value] -
            (flatListScrollOffsetY.value +
              scrollViewDragScrollTranslationY.value);

          const value = itemY + itemCenter + e.translationY;
          startItemDragCenterY.value = value;
          currentItemDragCenterY.value = value;
        }
      } else {
        currentItemDragCenterY.value =
          startItemDragCenterY.value + e.translationY;
      }
    },
    [
      currentItemDragCenterY,
      currentIndex,
      startItemDragCenterY,
      itemOffset,
      itemHeight,
      flatListScrollOffsetY,
      scrollViewDragScrollTranslationY,
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
          if (state.value === ReorderableListState.DRAGGED) {
            setDragDirection(e);
          }

          if (state.value !== ReorderableListState.RELEASED) {
            setCurrentItemDragCenterY(e);

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
      state,
      startY,
      currentY,
      currentTranslationY,
      dragY,
      gestureState,
      dragScrollTranslationY,
      scrollViewDragScrollTranslationY,
      setDragDirection,
      setCurrentItemDragCenterY,
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
    dragDirection.value = 0;
    lastDragDirectionPivot.value = null;
    currentItemDragCenterY.value = null;
  }, [
    state,
    draggedIndex,
    dragY,
    dragScrollTranslationY,
    scrollViewDragScrollTranslationY,
    dragDirection,
    lastDragDirectionPivot,
    currentItemDragCenterY,
  ]);

  const resetSharedValuesAfterAnimations = useCallback(() => {
    setTimeout(runOnUI(resetSharedValues), duration.value);
  }, [resetSharedValues, duration]);

  const reorder = (fromIndex: number, toIndex: number) => {
    runOnUI(resetSharedValues)();

    if (fromIndex !== toIndex) {
      onReorder({from: fromIndex, to: toIndex});
    }
  };

  const recomputeLayout = useCallback(
    (from: number, to: number) => {
      'worklet';

      const itemDirection = to > from;
      const index1 = itemDirection ? from : to;
      const index2 = itemDirection ? to : from;

      const newOffset1 = itemOffset.value[index1];
      const newHeight1 = itemHeight.value[index2];
      const newOffset2 =
        itemOffset.value[index2] +
        itemHeight.value[index2] -
        itemHeight.value[index1];
      const newHeight2 = itemHeight.value[index1];

      itemOffset.value[index1] = newOffset1;
      itemHeight.value[index1] = newHeight1;
      itemOffset.value[index2] = newOffset2;
      itemHeight.value[index2] = newHeight2;
    },
    [itemOffset, itemHeight],
  );

  /**
   * Computes a potential new drop container for the current dragged item and evaluates
   * whether the dragged item center is nearer to the center of the current container or the new one.
   *
   * @returns The new index if the center of the dragged item is closer to the center of
   * the new drop container or the current index if closer to the current drop container.
   */
  const computeCurrentIndex = useCallback(() => {
    'worklet';

    if (currentItemDragCenterY.value === null) {
      return currentIndex.value;
    }

    // apply scroll offset and scroll container translation
    const relativeDragCenterY =
      flatListScrollOffsetY.value +
      scrollViewDragScrollTranslationY.value +
      currentItemDragCenterY.value;

    const currentOffset = itemOffset.value[currentIndex.value];
    const currentHeight = itemHeight.value[currentIndex.value];
    const currentCenter = currentOffset + currentHeight * 0.5;

    const max = itemOffset.value.length;
    const possibleIndex =
      relativeDragCenterY < currentCenter
        ? Math.max(0, currentIndex.value - 1)
        : Math.min(max - 1, currentIndex.value + 1);

    if (currentIndex.value !== possibleIndex) {
      let possibleOffset = itemOffset.value[possibleIndex];
      if (possibleIndex > currentIndex.value) {
        possibleOffset += itemHeight.value[possibleIndex] - currentHeight;
      }

      const possibleCenter = possibleOffset + currentHeight * 0.5;
      const distanceFromCurrent = Math.abs(relativeDragCenterY - currentCenter);
      const distanceFromPossible = Math.abs(
        relativeDragCenterY - possibleCenter,
      );

      return distanceFromCurrent <= distanceFromPossible
        ? currentIndex.value
        : possibleIndex;
    }

    return currentIndex.value;
  }, [
    currentIndex,
    currentItemDragCenterY,
    itemOffset,
    itemHeight,
    flatListScrollOffsetY,
    scrollViewDragScrollTranslationY,
  ]);

  const setCurrentIndex = useCallback(() => {
    'worklet';

    const newIndex = computeCurrentIndex();

    if (currentIndex.value !== newIndex) {
      recomputeLayout(currentIndex.value, newIndex);
      currentIndex.value = newIndex;

      onIndexChange?.({index: newIndex});
    }
  }, [currentIndex, computeCurrentIndex, recomputeLayout, onIndexChange]);

  const runDefaultDragAnimations = useCallback(
    (type: 'start' | 'end') => {
      'worklet';

      // if no custom scale run default
      if (!(cellAnimations && 'transform' in cellAnimations)) {
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

  const computeHiddenArea = useCallback(() => {
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

  const computeThresholdArea = useCallback(() => {
    'worklet';

    const hiddenArea = computeHiddenArea();

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
  }, [
    computeHiddenArea,
    autoscrollThreshold,
    autoscrollThresholdOffset,
    flatListHeightY,
  ]);

  const computeContainerThresholdArea = useCallback(() => {
    'worklet';
    if (!scrollViewHeightY) {
      return {top: -Infinity, bottom: Infinity};
    }

    const offsetTop = Math.max(0, autoscrollThresholdOffset?.top || 0);
    const offsetBottom = Math.max(0, autoscrollThresholdOffset?.bottom || 0);
    const threshold = Math.max(0, Math.min(autoscrollThreshold, 0.4));
    const visibleHeight = scrollViewHeightY.value - (offsetTop + offsetBottom);

    const area = visibleHeight * threshold;
    const top = area + offsetTop;
    const bottom = visibleHeight - area - offsetBottom;

    return {top, bottom};
  }, [autoscrollThreshold, autoscrollThresholdOffset, scrollViewHeightY]);

  const shouldScrollContainer = useCallback(
    (y: number) => {
      'worklet';
      const containerThresholdArea = computeContainerThresholdArea();
      const nestedListHiddenArea = computeHiddenArea();

      // We should scroll the container if there's a hidden part of the nested list.
      // We might have floating errors like 0.0001 which we should ignore.
      return (
        (nestedListHiddenArea.top > 0.01 && y <= containerThresholdArea.top) ||
        (nestedListHiddenArea.bottom > 0.01 &&
          y >= containerThresholdArea.bottom)
      );
    },
    [computeHiddenArea, computeContainerThresholdArea],
  );

  const getRelativeContainerY = useCallback(() => {
    'worklet';

    return (
      currentY.value +
      nestedFlatListPositionY.value -
      scrollViewDragInitialScrollOffsetY.value
    );
  }, [currentY, nestedFlatListPositionY, scrollViewDragInitialScrollOffsetY]);

  const getRelativeListY = useCallback(() => {
    'worklet';

    return currentY.value + scrollViewDragScrollTranslationY.value;
  }, [currentY, scrollViewDragScrollTranslationY]);

  const scrollDirection = useCallback(() => {
    'worklet';

    const relativeContainerY = getRelativeContainerY();
    if (shouldScrollContainer(relativeContainerY)) {
      const containerThresholdArea = computeContainerThresholdArea();
      if (relativeContainerY <= containerThresholdArea.top) {
        return -1;
      }

      if (relativeContainerY >= containerThresholdArea.bottom) {
        return 1;
      }
    } else if (scrollable) {
      const relativeListY = getRelativeListY();
      const thresholdArea = computeThresholdArea();

      if (relativeListY <= thresholdArea.top) {
        return -1;
      }

      if (relativeListY >= thresholdArea.bottom) {
        return 1;
      }
    }

    return 0;
  }, [
    shouldScrollContainer,
    computeThresholdArea,
    computeContainerThresholdArea,
    getRelativeContainerY,
    getRelativeListY,
    scrollable,
  ]);

  useAnimatedReaction(
    () => currentY.value,
    () => {
      if (
        state.value === ReorderableListState.DRAGGED ||
        state.value === ReorderableListState.AUTOSCROLL
      ) {
        setCurrentIndex();

        // Trigger autoscroll when:
        // 1. Within the threshold area (top or bottom of list)
        // 2. Have dragged in the same direction as the scroll
        // 3. Not already in autoscroll mode
        if (dragDirection.value === scrollDirection()) {
          // When the first two conditions are met and it's already in autoscroll mode, we let it continue (no-op)
          if (state.value !== ReorderableListState.AUTOSCROLL) {
            state.value = ReorderableListState.AUTOSCROLL;
            lastAutoscrollTrigger.value = autoscrollTrigger.value;
            autoscrollTrigger.value *= -1;
          }
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
        const autoscrollIncrement =
          dragDirection.value *
          AUTOSCROLL_CONFIG.increment *
          autoscrollSpeedScale;

        if (autoscrollIncrement !== 0) {
          let scrollOffset = flatListScrollOffsetY.value;
          let listRef =
            flatListRef as unknown as AnimatedRef<Animated.ScrollView>;

          // Checking on every autoscroll whether to scroll the container,
          // this allows to smoothly pass the scroll from the container to the nested list
          // without any gesture input.
          if (
            scrollViewScrollOffsetY &&
            shouldScrollContainer(getRelativeContainerY())
          ) {
            scrollOffset = scrollViewScrollOffsetY.value;
            listRef =
              scrollViewContainerRef as unknown as AnimatedRef<Animated.ScrollView>;
          }

          scrollTo(listRef, 0, scrollOffset + autoscrollIncrement, true);
        }

        // when autoscrolling user may not be moving his finger so we need
        // to update the current position of the dragged item here
        setCurrentIndex();
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

  // container scroll handler
  useAnimatedReaction(
    () => scrollViewScrollOffsetY?.value,
    value => {
      if (value && scrollViewScrollEnabled) {
        // checking if the list is not scrollable instead of the scrolling state
        // fixes a bug on iOS where the item is shifted after autoscrolling and moving away from the area
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
        scrollViewDragInitialScrollOffsetY.value =
          scrollViewScrollOffsetY?.value || 0;

        draggedHeight.value = itemHeight.value[index];
        draggedIndex.value = index;
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
      flatListHeightY.value = e.nativeEvent.layout.height;

      // If nested in a scroll container.
      if (scrollViewScrollOffsetY) {
        // Timeout fixes a bug where measure returns height 0.
        setTimeout(() => {
          runOnUI(() => {
            const measurement = measure(flatListRef);
            if (!measurement) {
              return;
            }

            flatListPageY.value = measurement.pageY;
          })();
        }, 100);
      }

      onLayout?.(e);
    },
    [
      flatListRef,
      flatListPageY,
      flatListHeightY,
      scrollViewScrollOffsetY,
      onLayout,
    ],
  );

  const handleRef = useCallback(
    (value: FlatList<T>) => {
      flatListRef(value);

      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    },
    [flatListRef, ref],
  );

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
