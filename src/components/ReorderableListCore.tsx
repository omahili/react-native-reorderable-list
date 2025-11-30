import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  CellRendererProps,
  FlatList,
  FlatListProps,
  InteractionManager,
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
import {usePropAsSharedValue, useStableCallback} from '../hooks';

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList,
) as unknown as <T>(
  props: FlatListProps<T> & {ref?: React.Ref<FlatList<T>>},
) => React.ReactElement;

interface ReorderableListCoreProps<T> extends ReorderableListProps<T> {
  // Not optional but undefined to force passing the prop.
  scrollViewContainerRef: RefObject<ScrollView> | undefined;
  scrollViewPageXY: SharedValue<number> | undefined;
  scrollViewSize: SharedValue<number> | undefined;
  scrollViewScrollOffsetXY: SharedValue<number> | undefined;
  scrollViewScrollEnabledProp: SharedValue<boolean> | undefined;
  setScrollViewForceDisableScroll:
    | Dispatch<SetStateAction<boolean>>
    | undefined;
  outerScrollGesture: NativeGesture | undefined;
  scrollable: boolean | undefined;
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
    scrollViewPageXY,
    scrollViewSize,
    scrollViewScrollOffsetXY,
    scrollViewScrollEnabledProp,
    setScrollViewForceDisableScroll,
    scrollable,
    outerScrollGesture,
    cellAnimations,
    dragEnabled = true,
    shouldUpdateActiveItem,
    itemLayoutAnimation,
    panGesture,
    panEnabled = true,
    panActivateAfterLongPress,
    data,
    keyExtractor,
    ...rest
  }: ReorderableListCoreProps<T>,
  ref: React.ForwardedRef<FlatList<T>>,
) => {
  const scrollEnabled = rest.scrollEnabled ?? true;

  const flatListRef = useAnimatedRef<FlatList>();
  const markedCellsRef = useRef<Map<string, 1>>();
  const [activeIndex, setActiveIndex] = useState(-1);
  const prevItemCount = useRef(data.length);

  const [forceDisableScroll, setForceDisableScroll] = useState(false);
  const scrollEnabledProp = usePropAsSharedValue(scrollEnabled);
  const currentScrollEnabled = useSharedValue(scrollEnabled);

  const gestureState = useSharedValue<State>(State.UNDETERMINED);
  const currentXY = useSharedValue(0);
  const currentTranslationXY = useSharedValue(0);
  const currentItemDragCenterXY = useSharedValue<number | null>(null);
  const startItemDragCenterXY = useSharedValue<number>(0);
  const flatListScrollOffsetXY = useSharedValue(0);
  const flatListSize = useSharedValue(0);
  const flatListPageXY = useSharedValue(0);
  // The scroll x or y translation of the list since drag start
  const dragScrollTranslationXY = useSharedValue(0);
  // The initial scroll offset x or y of the list on drag start
  const dragInitialScrollOffsetXY = useSharedValue(0);
  // The scroll x or y translation of the ScrollViewContainer since drag start
  const scrollViewDragScrollTranslationXY = useSharedValue(0);
  // The initial scroll offset x or y of the ScrollViewContainer on drag start
  const scrollViewDragInitialScrollOffsetXY = useSharedValue(0);
  const draggedSize = useSharedValue(0);
  const itemOffset = useSharedValue<number[]>([]);
  const itemSize = useSharedValue<number[]>([]);
  // We need to track data length since itemOffset and itemSize might contain more data than we need.
  // e.g. items are removed from the list, in which case layout data for those items is set to 0.
  const itemCount = useSharedValue(data.length);
  const autoscrollTrigger = useSharedValue(-1);
  const lastAutoscrollTrigger = useSharedValue(-1);
  const dragXY = useSharedValue(0);
  const currentIndex = useSharedValue(-1);
  const draggedIndex = useSharedValue(-1);
  const state = useSharedValue<ReorderableListState>(ReorderableListState.IDLE);
  const dragEndHandlers = useSharedValue<
    ((from: number, to: number) => void)[][]
  >([]);
  const startXY = useSharedValue(0);
  const scaleDefault = useSharedValue(1);
  const opacityDefault = useSharedValue(1);
  const dragDirection = useSharedValue(0);
  const lastDragDirectionPivot = useSharedValue<number | null>(null);

  const itemLayoutAnimationPropRef = useRef(itemLayoutAnimation);
  itemLayoutAnimationPropRef.current = itemLayoutAnimation;

  const keyExtractorPropRef = useRef(keyExtractor);
  keyExtractorPropRef.current = keyExtractor;

  const animationDurationProp = usePropAsSharedValue(animationDuration);
  const autoscrollActivationDeltaProp = usePropAsSharedValue(
    autoscrollActivationDelta,
  );
  const dragEnabledProp = usePropAsSharedValue(dragEnabled ?? true);
  const horizontalProp = usePropAsSharedValue(!!rest.horizontal);

  // Position of the list relative to the scroll container
  const nestedFlatListPositionXY = useDerivedValue(
    () => flatListPageXY.value - (scrollViewPageXY?.value || 0),
  );

  useEffect(() => {
    itemCount.value = data.length;

    // This could be done unmount of the removed cell, however it leads to bugs.
    // Surprisingly the unmount gets sometimes called after the onLayout event
    // setting all layout data to 0 and breaking the list. So we solve it like this.
    if (data.length < prevItemCount.current) {
      for (let i = data.length; i < prevItemCount.current; i++) {
        runOnUI(() => {
          itemSize.value[i] = 0;
          itemOffset.value[i] = 0;
        })();
      }
    }

    prevItemCount.current = data.length;
  }, [data.length, itemSize, itemOffset, itemCount]);

  useEffect(() => {
    if (
      !markedCellsRef.current ||
      // Clean keys once they surpass by 10% the size of the list itself.
      markedCellsRef.current.size <= data.length + Math.ceil(data.length * 0.1)
    ) {
      return;
    }

    // Can be heavy to loop through all items, defer the task to run after interactions.
    const task = InteractionManager.runAfterInteractions(() => {
      if (!markedCellsRef.current) {
        return;
      }

      const map = new Map<string, 1>();
      for (let i = 0; i < data.length; i++) {
        const key = keyExtractorPropRef.current?.(data[i], i) || i.toString();
        if (markedCellsRef.current.has(key)) {
          map.set(key, markedCellsRef.current.get(key)!);
        }
      }

      markedCellsRef.current = map;
    });

    return () => {
      task.cancel();
    };
  }, [data]);

  const createCellKey = useCallback((cellKey: string) => {
    const mark = markedCellsRef.current?.get(cellKey) || 0;
    return `${cellKey}#${mark}`;
  }, []);

  const listContextValue = useMemo(
    () => ({
      draggedSize,
      currentIndex,
      draggedIndex,
      dragEndHandlers,
      activeIndex,
      itemLayoutAnimation: itemLayoutAnimationPropRef,
      horizontal: horizontalProp,
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
      draggedSize,
      currentIndex,
      draggedIndex,
      dragEndHandlers,
      activeIndex,
      cellAnimations,
      itemLayoutAnimationPropRef,
      scaleDefault,
      opacityDefault,
      horizontalProp,
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

      const absoluteXY = horizontalProp.value ? e.absoluteX : e.absoluteY;
      const velocityXY = horizontalProp.value ? e.velocityX : e.velocityY;

      const direction = velocityXY > 0 ? 1 : -1;
      if (direction !== dragDirection.value) {
        if (lastDragDirectionPivot.value === null) {
          lastDragDirectionPivot.value = absoluteXY;
        } else if (
          Math.abs(absoluteXY - lastDragDirectionPivot.value) >=
          autoscrollActivationDeltaProp.value
        ) {
          dragDirection.value = direction;
          lastDragDirectionPivot.value = absoluteXY;
        }
      }
    },
    [
      dragDirection,
      lastDragDirectionPivot,
      autoscrollActivationDeltaProp,
      horizontalProp,
    ],
  );

  const setCurrentItemDragCenterXY = useCallback(
    (e: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      'worklet';

      const translationXY = horizontalProp.value
        ? e.translationX
        : e.translationY;

      if (currentItemDragCenterXY.value === null) {
        if (currentIndex.value >= 0) {
          const itemCenter = itemSize.value[currentIndex.value] * 0.5;
          // the x or y coordinate of the item relative to the list
          const itemXY =
            itemOffset.value[currentIndex.value] -
            (flatListScrollOffsetXY.value +
              scrollViewDragScrollTranslationXY.value);

          const value = itemXY + itemCenter + translationXY;
          startItemDragCenterXY.value = value;
          currentItemDragCenterXY.value = value;
        }
      } else {
        currentItemDragCenterXY.value =
          startItemDragCenterXY.value + translationXY;
      }
    },
    [
      horizontalProp,
      currentItemDragCenterXY,
      currentIndex,
      startItemDragCenterXY,
      itemOffset,
      itemSize,
      flatListScrollOffsetXY,
      scrollViewDragScrollTranslationXY,
    ],
  );

  const panGestureHandler = useMemo(
    () =>
      (panGesture || Gesture.Pan())
        .onBegin(e => {
          'worklet';

          // prevent new dragging until item is completely released
          if (state.value === ReorderableListState.IDLE) {
            const xy = horizontalProp.value ? e.x : e.y;
            const translationXY = horizontalProp.value
              ? e.translationX
              : e.translationY;

            startXY.value = xy;
            currentXY.value = xy;
            currentTranslationXY.value = translationXY;
            dragXY.value = translationXY;
            gestureState.value = e.state;
          }
        })
        .onUpdate(e => {
          'worklet';

          if (state.value === ReorderableListState.DRAGGED) {
            setDragDirection(e);
          }

          if (state.value !== ReorderableListState.RELEASED) {
            setCurrentItemDragCenterXY(e);

            const translationXY = horizontalProp.value
              ? e.translationX
              : e.translationY;

            currentXY.value = startXY.value + translationXY;
            currentTranslationXY.value = translationXY;
            dragXY.value =
              translationXY +
              dragScrollTranslationXY.value +
              scrollViewDragScrollTranslationXY.value;
            gestureState.value = e.state;
          }
        })
        .onEnd(e => {
          'worklet';

          gestureState.value = e.state;
        })
        .onFinalize(e => {
          'worklet';

          gestureState.value = e.state;
        }),
    [
      panGesture,
      state,
      startXY,
      currentXY,
      currentTranslationXY,
      dragXY,
      gestureState,
      dragScrollTranslationXY,
      scrollViewDragScrollTranslationXY,
      setDragDirection,
      setCurrentItemDragCenterXY,
      horizontalProp,
    ],
  );

  const panGestureHandlerWithPropOptions = useMemo(() => {
    if (typeof panActivateAfterLongPress === 'number') {
      panGestureHandler.activateAfterLongPress(panActivateAfterLongPress);
    }

    if (!panEnabled) {
      panGestureHandler.enabled(panEnabled);
    }

    return panGestureHandler;
  }, [panActivateAfterLongPress, panEnabled, panGestureHandler]);

  const gestureHandler = useMemo(
    () =>
      Gesture.Simultaneous(Gesture.Native(), panGestureHandlerWithPropOptions),
    [panGestureHandlerWithPropOptions],
  );

  const setScrollEnabled = useCallback(
    (enabled: boolean) => {
      currentScrollEnabled.value = enabled;

      // IMPORTANT:
      // On web setNativeProps API is not available, so disabling scroll is controlled by a state.
      // On Android/iOS we can keep using setNativeProps which performs better and doesn't require re-renders.
      if (Platform.OS === 'web') {
        setForceDisableScroll(!enabled);

        if (setScrollViewForceDisableScroll) {
          setScrollViewForceDisableScroll(!enabled);
        }
      } else {
        if (!enabled || scrollEnabledProp.value) {
          // We disable the scroll or when re-enabling the scroll of the container we set it back to the current prop value.
          flatListRef.current?.setNativeProps({scrollEnabled: enabled});
        }

        if (!enabled || scrollViewScrollEnabledProp?.value) {
          // We disable the scroll or when re-enabling the scroll of the container we set it back to the current prop value.
          scrollViewContainerRef?.current?.setNativeProps({
            scrollEnabled: enabled,
          });
        }
      }
    },
    [
      currentScrollEnabled,
      flatListRef,
      scrollEnabledProp,
      scrollViewContainerRef,
      scrollViewScrollEnabledProp,
      setScrollViewForceDisableScroll,
    ],
  );

  const resetSharedValues = useCallback(() => {
    'worklet';

    state.value = ReorderableListState.IDLE;
    draggedIndex.value = -1;
    dragXY.value = 0;
    dragScrollTranslationXY.value = 0;
    scrollViewDragScrollTranslationXY.value = 0;
    dragDirection.value = 0;
    lastDragDirectionPivot.value = null;
    currentItemDragCenterXY.value = null;
  }, [
    state,
    draggedIndex,
    dragXY,
    dragScrollTranslationXY,
    scrollViewDragScrollTranslationXY,
    dragDirection,
    lastDragDirectionPivot,
    currentItemDragCenterXY,
  ]);

  const resetSharedValuesAfterAnimations = useCallback(() => {
    setTimeout(runOnUI(resetSharedValues), animationDurationProp.value);
  }, [resetSharedValues, animationDurationProp]);

  const markCells = (fromIndex: number, toIndex: number) => {
    if (!markedCellsRef.current) {
      markedCellsRef.current = new Map();
    }

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    for (let i = start; i <= end; i++) {
      const cellKey = keyExtractorPropRef.current?.(data[i], i) || i.toString();
      if (!markedCellsRef.current.has(cellKey)) {
        markedCellsRef.current.set(cellKey, 1);
      } else {
        markedCellsRef.current.delete(cellKey);
      }
    }
  };

  const reorder = (fromIndex: number, toIndex: number) => {
    runOnUI(resetSharedValues)();

    if (fromIndex !== toIndex) {
      markCells(fromIndex, toIndex);
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
      const newSize1 = itemSize.value[index2];
      const newOffset2 =
        itemOffset.value[index2] +
        itemSize.value[index2] -
        itemSize.value[index1];
      const newSize2 = itemSize.value[index1];

      itemOffset.value[index1] = newOffset1;
      itemSize.value[index1] = newSize1;
      itemOffset.value[index2] = newOffset2;
      itemSize.value[index2] = newSize2;
    },
    [itemOffset, itemSize],
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

    if (currentItemDragCenterXY.value === null) {
      return currentIndex.value;
    }

    // Apply scroll offset and scroll container translation.
    const relativeDragCenterXY =
      flatListScrollOffsetXY.value +
      scrollViewDragScrollTranslationXY.value +
      currentItemDragCenterXY.value;

    const currentOffset = itemOffset.value[currentIndex.value];
    const currentSize = itemSize.value[currentIndex.value];
    const currentCenter = currentOffset + currentSize * 0.5;

    const max = itemCount.value;
    const possibleIndex =
      relativeDragCenterXY < currentCenter
        ? Math.max(0, currentIndex.value - 1)
        : Math.min(max - 1, currentIndex.value + 1);

    if (currentIndex.value !== possibleIndex) {
      let possibleOffset = itemOffset.value[possibleIndex];
      if (possibleIndex > currentIndex.value) {
        possibleOffset += itemSize.value[possibleIndex] - currentSize;
      }

      const possibleCenter = possibleOffset + currentSize * 0.5;
      const distanceFromCurrent = Math.abs(
        relativeDragCenterXY - currentCenter,
      );
      const distanceFromPossible = Math.abs(
        relativeDragCenterXY - possibleCenter,
      );

      return distanceFromCurrent <= distanceFromPossible
        ? currentIndex.value
        : possibleIndex;
    }

    return currentIndex.value;
  }, [
    currentIndex,
    currentItemDragCenterXY,
    itemCount,
    itemOffset,
    itemSize,
    flatListScrollOffsetXY,
    scrollViewDragScrollTranslationXY,
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

      // If no custom opacity run the default.
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

        // Trigger onDragEnd event.
        let e = {from: draggedIndex.value, to: currentIndex.value};
        onDragEnd?.(e);

        const handlers = dragEndHandlers.value[draggedIndex.value];
        if (Array.isArray(handlers)) {
          handlers.forEach(fn => fn(e.from, e.to));
        }

        // they are actually swapped on drag translation
        const currentItemOffset = itemOffset.value[draggedIndex.value];
        const currentItemSize = itemSize.value[draggedIndex.value];
        const draggedItemOffset = itemOffset.value[currentIndex.value];
        const draggedItemSize = itemSize.value[currentIndex.value];

        const newPositionXY =
          currentIndex.value > draggedIndex.value
            ? draggedItemOffset - currentItemOffset
            : draggedItemOffset -
              currentItemOffset +
              (draggedItemSize - currentItemSize);

        runDefaultDragAnimations('end');

        if (dragXY.value !== newPositionXY) {
          // Animate dragged item to its new position on release.
          dragXY.value = withTiming(
            newPositionXY,
            {
              duration: animationDurationProp.value,
              easing: Easing.out(Easing.ease),
            },
            () => {
              runOnJS(reorder)(draggedIndex.value, currentIndex.value);
            },
          );
        } else {
          // User might drag and release the item without moving it so,
          // since the animation end callback is not executed in that case
          // we need to reset values as the reorder function would do.
          runOnJS(resetSharedValuesAfterAnimations)();
        }
      }
    },
  );

  const computeHiddenArea = useCallback(() => {
    'worklet';
    if (!scrollViewScrollOffsetXY || !scrollViewSize) {
      return {start: 0, end: 0};
    }

    // hidden area cannot be negative
    const start = Math.max(
      0,
      scrollViewScrollOffsetXY.value - nestedFlatListPositionXY.value,
    );
    const end = Math.max(
      0,
      nestedFlatListPositionXY.value +
        flatListSize.value -
        (scrollViewScrollOffsetXY.value + scrollViewSize.value),
    );

    return {start, end};
  }, [
    scrollViewScrollOffsetXY,
    scrollViewSize,
    nestedFlatListPositionXY,
    flatListSize,
  ]);

  const computeThresholdArea = useCallback(() => {
    'worklet';

    const hiddenArea = computeHiddenArea();

    const offsetStart = Math.max(
      0,
      autoscrollThresholdOffset?.start || autoscrollThresholdOffset?.top || 0,
    );
    const offsetEnd = Math.max(
      0,
      autoscrollThresholdOffset?.end || autoscrollThresholdOffset?.bottom || 0,
    );
    const threshold = Math.max(0, Math.min(autoscrollThreshold, 0.4));
    const visibleSize =
      flatListSize.value -
      (hiddenArea.start + hiddenArea.end) -
      (offsetStart + offsetEnd);

    const area = visibleSize * threshold;
    const start = area + offsetStart;
    const end = flatListSize.value - area - offsetEnd;

    return {start, end};
  }, [
    computeHiddenArea,
    autoscrollThreshold,
    autoscrollThresholdOffset,
    flatListSize,
  ]);

  const computeContainerThresholdArea = useCallback(() => {
    'worklet';
    if (!scrollViewSize) {
      return {start: -Infinity, end: Infinity};
    }

    const offsetStart = Math.max(
      0,
      autoscrollThresholdOffset?.start || autoscrollThresholdOffset?.top || 0,
    );
    const offsetEnd = Math.max(
      0,
      autoscrollThresholdOffset?.end || autoscrollThresholdOffset?.bottom || 0,
    );
    const threshold = Math.max(0, Math.min(autoscrollThreshold, 0.4));
    const visibleSize = scrollViewSize.value - (offsetStart + offsetEnd);

    const area = visibleSize * threshold;
    const start = area + offsetStart;
    const end = visibleSize - area - offsetEnd;

    return {start, end};
  }, [autoscrollThreshold, autoscrollThresholdOffset, scrollViewSize]);

  const shouldScrollContainer = useCallback(
    (y: number) => {
      'worklet';
      const containerThresholdArea = computeContainerThresholdArea();
      const nestedListHiddenArea = computeHiddenArea();

      // We should scroll the container if there's a hidden part of the nested list.
      // We might have floating errors like 0.0001 which we should ignore.
      return (
        (nestedListHiddenArea.start > 0.01 &&
          y <= containerThresholdArea.start) ||
        (nestedListHiddenArea.end > 0.01 && y >= containerThresholdArea.end)
      );
    },
    [computeHiddenArea, computeContainerThresholdArea],
  );

  const getRelativeContainerXY = useCallback(() => {
    'worklet';

    return (
      currentXY.value +
      nestedFlatListPositionXY.value -
      scrollViewDragInitialScrollOffsetXY.value
    );
  }, [
    currentXY,
    nestedFlatListPositionXY,
    scrollViewDragInitialScrollOffsetXY,
  ]);

  const getRelativeListXY = useCallback(() => {
    'worklet';

    return currentXY.value + scrollViewDragScrollTranslationXY.value;
  }, [currentXY, scrollViewDragScrollTranslationXY]);

  const scrollDirection = useCallback(() => {
    'worklet';

    const relativeContainerXY = getRelativeContainerXY();
    if (shouldScrollContainer(relativeContainerXY)) {
      const containerThresholdArea = computeContainerThresholdArea();
      if (relativeContainerXY <= containerThresholdArea.start) {
        return -1;
      }

      if (relativeContainerXY >= containerThresholdArea.end) {
        return 1;
      }
    } else if (scrollable) {
      const relativeListXY = getRelativeListXY();
      const thresholdArea = computeThresholdArea();

      if (relativeListXY <= thresholdArea.start) {
        return -1;
      }

      if (relativeListXY >= thresholdArea.end) {
        return 1;
      }
    }

    return 0;
  }, [
    shouldScrollContainer,
    computeThresholdArea,
    computeContainerThresholdArea,
    getRelativeContainerXY,
    getRelativeListXY,
    scrollable,
  ]);

  useAnimatedReaction(
    () => currentXY.value,
    () => {
      if (
        state.value === ReorderableListState.DRAGGED ||
        state.value === ReorderableListState.AUTOSCROLL
      ) {
        setCurrentIndex();

        // Trigger autoscroll when:
        // 1. Within the threshold area (start or end of list)
        // 2. Have dragged in the same direction as the scroll
        // 3. Not already in autoscroll mode
        if (dragDirection.value === scrollDirection()) {
          // When the first two conditions are met and it's already in autoscroll mode,
          // we let it continue (no-op).
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
          let scrollOffset = flatListScrollOffsetXY.value;
          let listRef =
            flatListRef as unknown as AnimatedRef<Animated.ScrollView>;

          // Checking on every autoscroll whether to scroll the container,
          // this allows to smoothly pass the scroll from the container to the nested list
          // without any gesture input.
          if (
            scrollViewScrollOffsetXY &&
            shouldScrollContainer(getRelativeContainerXY())
          ) {
            scrollOffset = scrollViewScrollOffsetXY.value;
            listRef =
              scrollViewContainerRef as unknown as AnimatedRef<Animated.ScrollView>;
          }
          const scrollToValue = scrollOffset + autoscrollIncrement;

          scrollTo(
            listRef,
            horizontalProp.value ? scrollToValue : 0,
            horizontalProp.value ? 0 : scrollToValue,
            true,
          );
        }

        // when autoscrolling user may not be moving his finger so we need
        // to update the current position of the dragged item here
        setCurrentIndex();
      }
    },
  );

  // flatlist scroll handler
  const handleScroll = useAnimatedScrollHandler(e => {
    flatListScrollOffsetXY.value = horizontalProp.value
      ? e.contentOffset.x
      : e.contentOffset.y;

    // Checking if the list is not scrollable instead of the scrolling state.
    // Fixes a bug on iOS where the item is shifted after autoscrolling and then
    // moving away from the area.
    if (!currentScrollEnabled.value) {
      dragScrollTranslationXY.value =
        flatListScrollOffsetXY.value - dragInitialScrollOffsetXY.value;
    }

    if (state.value === ReorderableListState.AUTOSCROLL) {
      dragXY.value =
        currentTranslationXY.value +
        dragScrollTranslationXY.value +
        scrollViewDragScrollTranslationXY.value;

      lastAutoscrollTrigger.value = autoscrollTrigger.value;
      autoscrollTrigger.value = withDelay(
        autoscrollDelay,
        withTiming(autoscrollTrigger.value * -1, {duration: 0}),
      );
    }
  });

  // container scroll handler
  useAnimatedReaction(
    () => scrollViewScrollOffsetXY?.value,
    value => {
      if (value) {
        // Checking if the list is not scrollable instead of the scrolling state.
        // Fixes a bug on iOS where the item is shifted, after autoscrolling and then
        // moving away from the area.
        if (!currentScrollEnabled.value) {
          scrollViewDragScrollTranslationXY.value =
            value - scrollViewDragInitialScrollOffsetXY.value;
        }

        if (state.value === ReorderableListState.AUTOSCROLL) {
          dragXY.value =
            currentTranslationXY.value +
            scrollViewDragScrollTranslationXY.value;

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

      if (!dragEnabledProp.value) {
        return;
      }

      // Allow new drag when item is completely released.
      if (state.value === ReorderableListState.IDLE) {
        // Resetting shared values again fixes a flickeing bug in nested lists where
        // after scrolling the parent list it would offset the new dragged item in another nested list.
        resetSharedValues();

        if (shouldUpdateActiveItem) {
          runOnJS(setActiveIndex)(index);
        }

        dragInitialScrollOffsetXY.value = flatListScrollOffsetXY.value;
        scrollViewDragInitialScrollOffsetXY.value =
          scrollViewScrollOffsetXY?.value || 0;

        draggedSize.value = itemSize.value[index];
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
      dragEnabledProp,
      resetSharedValues,
      shouldUpdateActiveItem,
      dragInitialScrollOffsetXY,
      scrollViewScrollOffsetXY,
      scrollViewDragInitialScrollOffsetXY,
      setScrollEnabled,
      currentIndex,
      draggedSize,
      draggedIndex,
      state,
      flatListScrollOffsetXY,
      itemSize,
      onDragStart,
      runDefaultDragAnimations,
    ],
  );

  const handleFlatListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      flatListSize.value = horizontalProp.value
        ? e.nativeEvent.layout.width
        : e.nativeEvent.layout.height;

      // If nested in a scroll container.
      if (scrollViewScrollOffsetXY) {
        // Timeout fixes a bug where measure returns width or height 0.
        setTimeout(() => {
          runOnUI(() => {
            const measurement = measure(flatListRef);
            if (!measurement) {
              return;
            }

            const pageXY = horizontalProp.value
              ? measurement.pageX
              : measurement.pageY;

            // We need to use pageY because the list might be nested into other views,
            // It's important that we take the measurement of the list without any scroll offset
            // from the scroll container.
            flatListPageXY.value =
              pageXY + (scrollViewScrollOffsetXY?.value || 0);
          })();
        }, 100);
      }

      onLayout?.(e);
    },
    [
      flatListRef,
      flatListPageXY,
      flatListSize,
      horizontalProp,
      scrollViewScrollOffsetXY,
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
    // Android is able to handle nested scroll view, but not the full size ones like iOS.
    if (outerScrollGesture && !(Platform.OS === 'android' && scrollable)) {
      return Gesture.Simultaneous(outerScrollGesture, gestureHandler);
    }

    return gestureHandler;
  }, [scrollable, outerScrollGesture, gestureHandler]);

  const composedScrollHandler = useComposedEventHandler([
    handleScroll,
    onScroll || null,
  ]);

  const renderAnimatedCell = useStableCallback(
    ({cellKey, ...props}: CellRendererProps<T>) => (
      <ReorderableListCell
        {...props}
        // forces remount with key change on reorder
        key={createCellKey(cellKey)}
        itemOffset={itemOffset}
        itemSize={itemSize}
        dragXY={dragXY}
        draggedIndex={draggedIndex}
        animationDuration={animationDurationProp}
        startDrag={startDrag}
      />
    ),
  );

  return (
    <ReorderableListContext.Provider value={listContextValue}>
      <GestureDetector gesture={combinedGesture}>
        <AnimatedFlatList
          {...rest}
          ref={handleRef}
          data={data}
          keyExtractor={keyExtractor}
          CellRendererComponent={renderAnimatedCell}
          onLayout={handleFlatListLayout}
          onScroll={composedScrollHandler}
          scrollEventThrottle={1}
          removeClippedSubviews={false}
          numColumns={1}
          // We force disable scroll or let the component prop control it.
          scrollEnabled={forceDisableScroll ? false : scrollEnabled}
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
