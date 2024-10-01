import React, {useCallback, useMemo} from 'react';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {useReorderableDragEnd, useReorderableDragStart} from '../hooks';
import type {ReorderableListItemProps} from '../types';

const scaleDefaultConfig = {
  enabled: true,
  valueEnd: 1,
  valueStart: 1.025,
  easingStart: Easing.in(Easing.ease),
  easingEnd: Easing.out(Easing.ease),
  duration: 200,
};

const opacityDefaultConfig = {
  enabled: true,
  valueEnd: 1,
  valueStart: 0.75,
  easingStart: Easing.in(Easing.ease),
  easingEnd: Easing.out(Easing.ease),
  duration: 200,
};

export const ReorderableListItem: React.FC<ReorderableListItemProps> = ({
  scaleAnimationConfig = scaleDefaultConfig,
  opacityAnimationConfig = opacityDefaultConfig,
  ...rest
}) => {
  const scaleConfigWithDefaults = useMemo(
    () => ({
      ...scaleDefaultConfig,
      ...scaleAnimationConfig,
    }),
    [scaleAnimationConfig],
  );
  const opacityConfigWithDefaults = useMemo(
    () => ({
      ...opacityDefaultConfig,
      ...opacityAnimationConfig,
    }),
    [opacityAnimationConfig],
  );
  const scale = useSharedValue(
    scaleConfigWithDefaults.enabled ? scaleConfigWithDefaults.valueEnd : 1,
  );
  const opacity = useSharedValue(
    opacityConfigWithDefaults.enabled ? opacityConfigWithDefaults.valueEnd : 1,
  );

  useReorderableDragStart(
    useCallback(() => {
      'worklet';
      if (scaleConfigWithDefaults.enabled) {
        scale.value = withTiming(scaleConfigWithDefaults.valueStart, {
          easing: scaleConfigWithDefaults.easingStart,
          duration: scaleConfigWithDefaults.duration,
        });
      }

      if (opacityConfigWithDefaults.enabled) {
        opacity.value = withTiming(opacityConfigWithDefaults.valueStart, {
          easing: opacityConfigWithDefaults.easingStart,
          duration: opacityConfigWithDefaults.duration,
        });
      }
    }, [opacity, scale, opacityConfigWithDefaults, scaleConfigWithDefaults]),
  );

  useReorderableDragEnd(
    useCallback(() => {
      'worklet';
      if (scaleConfigWithDefaults.enabled) {
        scale.value = withTiming(scaleConfigWithDefaults.valueEnd, {
          easing: scaleConfigWithDefaults.easingEnd,
          duration: scaleConfigWithDefaults.duration,
        });
      }

      if (opacityConfigWithDefaults.enabled) {
        opacity.value = withTiming(opacityConfigWithDefaults.valueEnd, {
          easing: opacityConfigWithDefaults.easingEnd,
          duration: opacityConfigWithDefaults.duration,
        });
      }
    }, [opacity, scale, opacityConfigWithDefaults, scaleConfigWithDefaults]),
  );

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: scale.value,
        },
      ],
      opacity: opacity.value,
    }),
    [scale, opacity],
  );

  return <Animated.View {...rest} style={[animatedStyle, rest.style]} />;
};
