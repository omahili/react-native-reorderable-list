import React, { memo } from 'react';
import Animated, { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ReorderableListContext } from '../contexts';
import { useContext } from '../hooks';
export const ReorderableListDropIndicator = /*#__PURE__*/memo(({
  item,
  index,
  dropIndicatorTranslationXY,
  animationDuration,
  renderDropIndicator
}) => {
  const {
    draggedSize,
    horizontal
  } = useContext(ReorderableListContext);
  const animatedStyle = useAnimatedStyle(() => ({
    // We set the fixed styles here due to the following issue:
    // https://github.com/software-mansion/react-native-reanimated/issues/6681#issuecomment-2514228447
    // Negative zIndex fixes the drop indicator flickering over
    // the dropped item when its re-rendered on reorder.
    zIndex: -1,
    position: 'absolute',
    [horizontal.value ? 'height' : 'width']: '100%',
    [horizontal.value ? 'width' : 'height']: draggedSize.value,
    transform: [{
      [horizontal.value ? 'translateX' : 'translateY']: withTiming(dropIndicatorTranslationXY.value, {
        duration: animationDuration.value,
        easing: Easing.out(Easing.ease)
      })
    }]
  }));
  return /*#__PURE__*/React.createElement(Animated.View, {
    style: animatedStyle
  }, renderDropIndicator({
    item,
    index
  }));
}
// Memo breaks type inference, we cast it to maintain it.
);
//# sourceMappingURL=ReorderableListDropIndicator.js.map