import React, { memo, useCallback, useMemo, useState } from 'react';
import Animated, { Easing, runOnJS, runOnUI, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { ReorderableCellContext, ReorderableListContext } from '../contexts';
import { useContext } from '../hooks';
import { applyAnimatedStyles } from './helpers';
import { ReorderableListDropIndicator } from './ReorderableListDropIndicator';
export const ReorderableListCell = /*#__PURE__*/memo(({
  index,
  startDrag,
  item,
  children,
  onLayout,
  itemOffset,
  itemSize,
  dragXY,
  draggedIndex,
  animationDuration,
  renderDropIndicator
}) => {
  const {
    currentIndex,
    dropIndicatorTranslationXY,
    draggedSize,
    activeIndex,
    cellAnimations,
    itemLayoutAnimation,
    horizontal
  } = useContext(ReorderableListContext);
  const dragHandler = useCallback(() => runOnUI(startDrag)(index), [startDrag, index]);
  const [showDropIndicator, setShowDropIndicator] = useState(false);
  const isActive = activeIndex === index;
  const contextValue = useMemo(() => ({
    index,
    dragHandler,
    draggedIndex,
    isActive
  }), [index, dragHandler, draggedIndex, isActive]);

  // Keep separate animated reactions that update itemTranslateXY
  // otherwise animations might stutter if multiple are triggered
  // (even in other cells, e.g. released item and reordering cells)
  const itemTranslateXY = useSharedValue(0);
  const isActiveCell = useDerivedValue(() => {
    const value = draggedIndex.value === index;
    if (renderDropIndicator) {
      if (value) {
        runOnJS(setShowDropIndicator)(true);
      } else if (showDropIndicator) {
        runOnJS(setShowDropIndicator)(false);
      }
    }
    return value;
  });
  useAnimatedReaction(() => dragXY.value, () => {
    if (index === draggedIndex.value && currentIndex.value >= 0 && draggedIndex.value >= 0) {
      itemTranslateXY.value = dragXY.value;
    }
  });
  useAnimatedReaction(() => currentIndex.value, () => {
    if (index !== draggedIndex.value && currentIndex.value >= 0 && draggedIndex.value >= 0) {
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
          easing: Easing.out(Easing.ease)
        });
      }
    }
  });
  const animatedStyle = useAnimatedStyle(() => {
    const translatePropName = horizontal.value ? 'translateX' : 'translateY';
    if (isActiveCell.value) {
      const transform = [{
        [translatePropName]: itemTranslateXY.value
      }];
      if (Array.isArray(cellAnimations.transform)) {
        const customTransform = cellAnimations.transform.map(x => applyAnimatedStyles({}, x));
        transform.push(...customTransform);
      }
      return applyAnimatedStyles({
        transform,
        zIndex: 999
      }, cellAnimations, ['transform']);
    }
    return {
      transform: [{
        [translatePropName]: itemTranslateXY.value
      }],
      // We set zIndex here due to the following issue:
      // https://github.com/software-mansion/react-native-reanimated/issues/6681#issuecomment-2514228447
      zIndex: 0
    };
  });
  const handleLayout = e => {
    runOnUI((x, y, width, height) => {
      itemOffset.value[index] = horizontal.value ? x : y;
      itemSize.value[index] = horizontal.value ? width : height;
    })(e.nativeEvent.layout.x, e.nativeEvent.layout.y, e.nativeEvent.layout.width, e.nativeEvent.layout.height);
    onLayout === null || onLayout === void 0 || onLayout(e);
  };
  return /*#__PURE__*/React.createElement(ReorderableCellContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: animatedStyle,
    onLayout: handleLayout,
    layout: itemLayoutAnimation.current
  }, children), showDropIndicator && renderDropIndicator && /*#__PURE__*/React.createElement(ReorderableListDropIndicator, {
    index: index,
    item: item,
    animationDuration: animationDuration,
    dropIndicatorTranslationXY: dropIndicatorTranslationXY,
    renderDropIndicator: renderDropIndicator
  }));
}
// Memo breaks type inference, we cast it to maintain it.
);
//# sourceMappingURL=ReorderableListCell.js.map