import React, {memo, useCallback, useMemo} from 'react';
import type {LayoutChangeEvent} from 'react-native';

import Animated, {
  Easing,
  SharedValue,
  runOnUI,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {ReorderableCellContext, ReorderableListContext} from '../contexts';
import {useContext} from '../hooks';

interface ReorderableListCellProps<T, U> {
  index: number;
  startDrag: (index: number) => void;
  itemOffset: SharedValue<number[]>;
  itemHeight: SharedValue<number[]>;
  dragY: SharedValue<number>;
  draggedIndex: SharedValue<number>;
  releasedIndex: SharedValue<number>;
  children: React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  // animation duration as a shared value allows to avoid re-renders on value change
  animationDuration: SharedValue<number>;
  item: T;
  extraData: U;
}

export const ReorderableListCell = memo(
  <T, U>({
    index,
    startDrag,
    children,
    onLayout,
    itemOffset,
    itemHeight,
    dragY,
    draggedIndex,
    releasedIndex,
    animationDuration,
  }: ReorderableListCellProps<T, U>) => {
    const dragHandler = useCallback(() => {
      'worklet';

      startDrag(index);
    }, [startDrag, index]);

    const contextValue = useMemo(
      () => ({
        index,
        dragHandler,
        draggedIndex,
        releasedIndex,
      }),
      [index, dragHandler, draggedIndex, releasedIndex],
    );
    const {currentIndex, draggedHeight} = useContext(ReorderableListContext);

    const itemZIndex = useSharedValue(0);
    const itemPositionY = useSharedValue(0);
    const itemDragY = useSharedValue(0);
    const itemIndex = useSharedValue(index);

    useAnimatedReaction(
      () => dragY.value,
      () => {
        if (
          itemIndex.value === draggedIndex.value &&
          currentIndex.value >= 0 &&
          draggedIndex.value >= 0
        ) {
          itemDragY.value = dragY.value;
        }
      },
    );

    useAnimatedReaction(
      () => currentIndex.value,
      () => {
        if (
          itemIndex.value !== draggedIndex.value &&
          currentIndex.value >= 0 &&
          draggedIndex.value >= 0
        ) {
          const moveDown = currentIndex.value > draggedIndex.value;
          const startMove = Math.min(draggedIndex.value, currentIndex.value);
          const endMove = Math.max(draggedIndex.value, currentIndex.value);
          let newValue = 0;

          if (itemIndex.value >= startMove && itemIndex.value <= endMove) {
            newValue = moveDown ? -draggedHeight.value : draggedHeight.value;
          }

          if (newValue !== itemPositionY.value) {
            itemPositionY.value = withTiming(newValue, {
              duration: animationDuration.value,
              easing: Easing.out(Easing.ease),
            });
          }
        }
      },
    );

    useAnimatedReaction(
      () => draggedIndex.value === index,
      newValue => {
        itemZIndex.value = newValue ? 999 : 0;
      },
    );

    const animatedStyle = useAnimatedStyle(() => ({
      zIndex: itemZIndex.value,
      transform: [
        {translateY: itemDragY.value},
        {translateY: itemPositionY.value},
      ],
    }));

    const handleLayout = (e: LayoutChangeEvent) => {
      runOnUI((y: number, height: number) => {
        itemOffset.value[index] = y;
        itemHeight.value[index] = height;
      })(e.nativeEvent.layout.y, e.nativeEvent.layout.height);

      if (onLayout) {
        onLayout(e);
      }
    };

    return (
      <ReorderableCellContext.Provider value={contextValue}>
        <Animated.View style={animatedStyle} onLayout={handleLayout}>
          {children}
        </Animated.View>
      </ReorderableCellContext.Provider>
    );
  },
  (prev, next) => prev.item === next.item && prev.extraData === next.extraData,
);