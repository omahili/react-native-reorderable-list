import React, {useMemo} from 'react';
import {LayoutChangeEvent} from 'react-native';

import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {ScrollViewContainerContext} from '../contexts/ScrollViewContainerContext';
import type {ScrollViewContainerProps} from '../types';

export const ScrollViewContainer: React.FC<ScrollViewContainerProps> = ({
  onLayout,
  onScroll,
  scrollEnabled = true,
  ...rest
}) => {
  const scrollViewScrollEnabled = useSharedValue(scrollEnabled);
  const scrollViewContainerRef = useAnimatedRef<Animated.ScrollView>();
  const scrollViewScrollOffsetY = useSharedValue(0);
  const scrollViewHeightY = useSharedValue(0);

  const outerScrollGesture = useMemo(() => Gesture.Native(), []);

  const handleScroll = useAnimatedScrollHandler(
    e => {
      scrollViewScrollOffsetY.value = e.contentOffset.y;

      onScroll?.(e);
    },
    [scrollViewScrollOffsetY],
  );

  const contextValue = useMemo(
    () => ({
      scrollViewContainerRef,
      scrollViewHeightY,
      scrollViewScrollOffsetY,
      scrollViewScrollEnabled,
      outerScrollGesture,
      initialScrollViewScrollEnabled: scrollEnabled,
    }),
    [
      scrollViewContainerRef,
      scrollViewHeightY,
      scrollViewScrollOffsetY,
      scrollViewScrollEnabled,
      outerScrollGesture,
      scrollEnabled,
    ],
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    scrollViewHeightY.value = e.nativeEvent.layout.height;

    onLayout?.(e);
  };

  return (
    <ScrollViewContainerContext.Provider value={contextValue}>
      <GestureDetector gesture={outerScrollGesture}>
        <Animated.ScrollView
          {...rest}
          ref={scrollViewContainerRef}
          onScroll={handleScroll}
          onLayout={handleLayout}
          scrollEnabled={scrollEnabled}
        />
      </GestureDetector>
    </ScrollViewContainerContext.Provider>
  );
};
