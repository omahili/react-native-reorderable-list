import React, {memo, useCallback, useMemo} from 'react';
import {CellRendererProps, LayoutChangeEvent} from 'react-native';

import Animated, {
  Easing,
  SharedValue,
  runOnUI,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {ReorderableCellContext, ReorderableListContext} from '../contexts';
import {useContext} from '../hooks';

interface ReorderableListCellProps<T>
  extends Omit<CellRendererProps<T>, 'cellKey'> {
  startDrag: (index: number) => void;
  itemOffset: SharedValue<number[]>;
  itemHeight: SharedValue<number[]>;
  dragY: SharedValue<number>;
  draggedIndex: SharedValue<number>;
  animationDuration: SharedValue<number>;
}

export const ReorderableListCell = memo(
  <T,>({
    index,
    startDrag,
    children,
    onLayout,
    itemOffset,
    itemHeight,
    dragY,
    draggedIndex,
    animationDuration,
  }: ReorderableListCellProps<T>) => {
    const {currentIndex, draggedHeight, scale, opacity} = useContext(
      ReorderableListContext,
    );
    const dragHandler = useCallback(
      () => runOnUI(startDrag)(index),
      [startDrag, index],
    );

    const contextValue = useMemo(
      () => ({
        index,
        dragHandler,
        draggedIndex,
      }),
      [index, dragHandler, draggedIndex],
    );

    // Keep separate animated reactions that update itemTranslateY
    // otherwise animations might stutter if multiple are triggered
    // (even in other cells, e.g. released item and reordering cells)
    const itemTranslateY = useSharedValue(0);
    const isActive = useDerivedValue(() => draggedIndex.value === index);

    useAnimatedReaction(
      () => dragY.value,
      () => {
        if (
          index === draggedIndex.value &&
          currentIndex.value >= 0 &&
          draggedIndex.value >= 0
        ) {
          itemTranslateY.value = dragY.value;
        }
      },
    );

    useAnimatedReaction(
      () => currentIndex.value,
      () => {
        if (
          index !== draggedIndex.value &&
          currentIndex.value >= 0 &&
          draggedIndex.value >= 0
        ) {
          const moveDown = currentIndex.value > draggedIndex.value;
          const startMove = Math.min(draggedIndex.value, currentIndex.value);
          const endMove = Math.max(draggedIndex.value, currentIndex.value);
          let newValue = 0;

          if (index >= startMove && index <= endMove) {
            newValue = moveDown ? -draggedHeight.value : draggedHeight.value;
          }

          if (newValue !== itemTranslateY.value) {
            itemTranslateY.value = withTiming(newValue, {
              duration: animationDuration.value,
              easing: Easing.out(Easing.ease),
            });
          }
        }
      },
    );

    const animatedStyle = useAnimatedStyle(() => {
      if (isActive.value) {
        return {
          transform: [{translateY: itemTranslateY.value}, {scale: scale.value}],
          opacity: opacity.value,
          zIndex: 999,
        };
      }

      return {
        transform: [{translateY: itemTranslateY.value}],
        // TODO: move to stylesheet when this is fixed
        // https://github.com/software-mansion/react-native-reanimated/issues/6681#issuecomment-2514228447
        zIndex: 0,
      };
    });

    const handleLayout = (e: LayoutChangeEvent) => {
      runOnUI((y: number, height: number) => {
        itemOffset.value[index] = y;
        itemHeight.value[index] = height;
      })(e.nativeEvent.layout.y, e.nativeEvent.layout.height);

      onLayout?.(e);
    };

    return (
      <ReorderableCellContext.Provider value={contextValue}>
        <Animated.View style={animatedStyle} onLayout={handleLayout}>
          {children}
        </Animated.View>
      </ReorderableCellContext.Provider>
    );
  },
);
