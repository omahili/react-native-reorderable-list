import React, {memo} from 'react';
import {ViewStyle} from 'react-native';

import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import {ReorderableListContext} from '../contexts';
import {useContext} from '../hooks';
import {ReorderableListRenderItem} from '../types';

interface ReorderableListDropIndicatorProps<T> {
  item: T;
  index: number;
  animationDuration: SharedValue<number>;
  dropIndicatorTranslationXY: SharedValue<number>;
  renderDropIndicator: ReorderableListRenderItem<T>;
}

export const ReorderableListDropIndicator = memo(
  <T,>({
    item,
    index,
    dropIndicatorTranslationXY,
    animationDuration,
    renderDropIndicator,
  }: ReorderableListDropIndicatorProps<T>) => {
    const {draggedSize, horizontal} = useContext(ReorderableListContext);

    const animatedStyle = useAnimatedStyle(() => ({
      // We set the fixed styles here due to the following issue:
      // https://github.com/software-mansion/react-native-reanimated/issues/6681#issuecomment-2514228447
      // Negative zIndex fixes the drop indicator flickering over
      // the dropped item when its re-rendered on reorder.
      zIndex: -1,
      position: 'absolute',
      [horizontal.value ? 'height' : 'width']: '100%',
      [horizontal.value ? 'width' : 'height']: draggedSize.value,
      transform: [
        {
          [horizontal.value ? 'translateX' : 'translateY']: withTiming(
            dropIndicatorTranslationXY.value,
            {
              duration: animationDuration.value,
              easing: Easing.out(Easing.ease),
            },
          ),
        },
      ] as unknown as ViewStyle['transform'],
    }));

    return (
      <Animated.View style={animatedStyle}>
        {renderDropIndicator({item, index})}
      </Animated.View>
    );
  },
  // Memo breaks type inference, we cast it to maintain it.
) as <T>(props: ReorderableListDropIndicatorProps<T>) => JSX.Element;
