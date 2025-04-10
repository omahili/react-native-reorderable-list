import React, {memo, useCallback, useEffect, useMemo} from 'react';
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
import {applyAnimatedStyles} from './helpers';

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
    const {currentIndex, draggedHeight, activeIndex, cellAnimations} =
      useContext(ReorderableListContext);
    const dragHandler = useCallback(
      () => runOnUI(startDrag)(index),
      [startDrag, index],
    );

    const isActive = activeIndex === index;
    const contextValue = useMemo(
      () => ({
        index,
        dragHandler,
        draggedIndex,
        isActive,
      }),
      [index, dragHandler, draggedIndex, isActive],
    );

    // Keep separate animated reactions that update itemTranslateY
    // otherwise animations might stutter if multiple are triggered
    // (even in other cells, e.g. released item and reordering cells)
    const itemTranslateY = useSharedValue(0);
    const isActiveCell = useDerivedValue(() => draggedIndex.value === index);

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
          const moveUp = currentIndex.value > draggedIndex.value;
          const startMove = Math.min(draggedIndex.value, currentIndex.value);
          const endMove = Math.max(draggedIndex.value, currentIndex.value);

          let newValue = 0;
          if (index >= startMove && index <= endMove) {
            newValue = moveUp ? -draggedHeight.value : draggedHeight.value;
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
      if (isActiveCell.value) {
        const transform = [{translateY: itemTranslateY.value}];
        if (Array.isArray(cellAnimations.transform)) {
          const customTransform = cellAnimations.transform.map(x =>
            applyAnimatedStyles({}, x),
          ) as [];
          transform.push(...customTransform);
        }

        return applyAnimatedStyles(
          {
            transform,
            zIndex: 999,
          },
          cellAnimations,
          ['transform'],
        );
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

    useEffect(() => {
      return () => {
        runOnUI((idx: number) => {
          itemOffset.value[idx] = 0;
          itemHeight.value[idx] = 0;
        })(index);
      };
    }, [index, itemOffset, itemHeight]);

    return (
      <ReorderableCellContext.Provider value={contextValue}>
        <Animated.View style={animatedStyle} onLayout={handleLayout}>
          {children}
        </Animated.View>
      </ReorderableCellContext.Provider>
    );
  },
);
