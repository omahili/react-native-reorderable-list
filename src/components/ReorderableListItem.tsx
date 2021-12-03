import React from 'react';
import {ViewProps} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  useSharedValue,
  useAnimatedReaction,
} from 'react-native-reanimated';

import {ItemOffset} from 'types/misc';

interface ReorderableListItemProps extends Animated.AnimateProps<ViewProps> {
  index: number;
  itemOffsets: Animated.SharedValue<ItemOffset>[];
  draggedIndex: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  enabledOpacity: Animated.SharedValue<boolean>;
  children: React.ReactNode;
}

const ReorderableListItem: React.FC<ReorderableListItemProps> = ({
  index,
  itemOffsets,
  draggedIndex,
  currentIndex,
  enabledOpacity,
  children,
  ...rest
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  useAnimatedReaction(
    () => currentIndex.value,
    () => {
      if (currentIndex.value >= 0 && draggedIndex.value >= 0) {
        const moveDown = currentIndex.value > draggedIndex.value;
        const startMove = Math.min(draggedIndex.value, currentIndex.value);
        const endMove = Math.max(draggedIndex.value, currentIndex.value);
        let newValue = 0;

        if (index === draggedIndex.value) {
          for (let i = startMove; i < endMove; i++) {
            newValue = moveDown
              ? newValue + itemOffsets[i].value.length
              : newValue - itemOffsets[i].value.length;
          }

          // if items have different heights and the dragged item is moved forward
          // then its new offset position needs to be adjusted
          const offsetCorrection = moveDown
            ? itemOffsets[currentIndex.value].value.length -
              itemOffsets[draggedIndex.value].value.length
            : 0;
          newValue += offsetCorrection;
        } else if (index >= startMove && index <= endMove) {
          const draggedHeight = itemOffsets[draggedIndex.value].value.length;
          newValue = moveDown ? -draggedHeight : draggedHeight;
        }

        if (newValue !== translateY.value) {
          translateY.value = withTiming(newValue, {
            duration: 100,
            easing: Easing.out(Easing.ease),
          });
        }
      }
    },
  );

  useAnimatedReaction(
    () => enabledOpacity.value,
    (enabled) => {
      opacity.value = enabled && index === draggedIndex.value ? 0 : 1;
    },
    [index],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View {...rest} style={[rest.style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export default ReorderableListItem;
