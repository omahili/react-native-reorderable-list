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
import {applyAnimatedStyles} from './helpers';

interface ReorderableListCellProps<T>
  extends Omit<CellRendererProps<T>, 'cellKey'> {
  startDrag: (index: number) => void;
  itemOffset: SharedValue<number[]>;
  itemSize: SharedValue<number[]>;
  dragXY: SharedValue<number>;
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
    itemSize,
    dragXY,
    draggedIndex,
    animationDuration,
  }: ReorderableListCellProps<T>) => {
    const {
      currentIndex,
      draggedSize,
      activeIndex,
      cellAnimations,
      itemLayoutAnimation,
      horizontal,
    } = useContext(ReorderableListContext);

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

    // Keep separate animated reactions that update itemTranslateXY
    // otherwise animations might stutter if multiple are triggered
    // (even in other cells, e.g. released item and reordering cells)
    const itemTranslateXY = useSharedValue(0);
    const isActiveCell = useDerivedValue(() => draggedIndex.value === index);

    useAnimatedReaction(
      () => dragXY.value,
      () => {
        if (
          index === draggedIndex.value &&
          currentIndex.value >= 0 &&
          draggedIndex.value >= 0
        ) {
          itemTranslateXY.value = dragXY.value;
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
            newValue = moveUp ? -draggedSize.value : draggedSize.value;
          }

          if (newValue !== itemTranslateXY.value) {
            itemTranslateXY.value = withTiming(newValue, {
              duration: animationDuration.value,
              easing: Easing.out(Easing.ease),
            });
          }
        }
      },
    );

    const animatedStyle = useAnimatedStyle(() => {
      const translatePropName = horizontal.value ? 'translateX' : 'translateY';

      if (isActiveCell.value) {
        const transform = [{[translatePropName]: itemTranslateXY.value}];
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
        transform: [{[translatePropName]: itemTranslateXY.value}],
        // We set zIndex here due to the following issue:
        // https://github.com/software-mansion/react-native-reanimated/issues/6681#issuecomment-2514228447
        zIndex: 0,
      };
    });

    const handleLayout = (e: LayoutChangeEvent) => {
      runOnUI((x: number, y: number, width: number, height: number) => {
        itemOffset.value[index] = horizontal.value ? x : y;
        itemSize.value[index] = horizontal.value ? width : height;
      })(
        e.nativeEvent.layout.x,
        e.nativeEvent.layout.y,
        e.nativeEvent.layout.width,
        e.nativeEvent.layout.height,
      );

      onLayout?.(e);
    };

    return (
      <ReorderableCellContext.Provider value={contextValue}>
        <Animated.View
          style={animatedStyle}
          onLayout={handleLayout}
          layout={itemLayoutAnimation.current}>
          {children}
        </Animated.View>
      </ReorderableCellContext.Provider>
    );
  },
);
