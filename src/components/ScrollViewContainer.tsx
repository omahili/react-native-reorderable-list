import React, {forwardRef, useCallback, useMemo} from 'react';
import {LayoutChangeEvent, ScrollView} from 'react-native';

import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useComposedEventHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {ScrollViewContainerContext} from '../contexts/ScrollViewContainerContext';
import type {ScrollViewContainerProps} from '../types';

const ScrollViewContainerWithRef = (
  {onLayout, onScroll, scrollEnabled = true, ...rest}: ScrollViewContainerProps,
  ref: React.ForwardedRef<ScrollView>,
) => {
  const scrollViewScrollEnabled = useSharedValue(scrollEnabled);
  const scrollViewContainerRef = useAnimatedRef<Animated.ScrollView>();
  const scrollViewScrollOffsetY = useSharedValue(0);
  const scrollViewPageY = useSharedValue(0);
  const scrollViewHeightY = useSharedValue(0);

  const handleRef = useCallback(
    (value: Animated.ScrollView) => {
      scrollViewContainerRef(value);

      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    },
    [scrollViewContainerRef, ref],
  );

  const outerScrollGesture = useMemo(() => Gesture.Native(), []);

  const handleScroll = useAnimatedScrollHandler(
    e => {
      scrollViewScrollOffsetY.value = e.contentOffset.y;
    },
    [scrollViewScrollOffsetY],
  );

  const composedScrollHandler = useComposedEventHandler([
    handleScroll,
    onScroll || null,
  ]);

  const contextValue = useMemo(
    () => ({
      scrollViewContainerRef,
      scrollViewPageY,
      scrollViewHeightY,
      scrollViewScrollOffsetY,
      scrollViewScrollEnabled,
      outerScrollGesture,
      initialScrollViewScrollEnabled: scrollEnabled,
    }),
    [
      scrollViewContainerRef,
      scrollViewPageY,
      scrollViewHeightY,
      scrollViewScrollOffsetY,
      scrollViewScrollEnabled,
      outerScrollGesture,
      scrollEnabled,
    ],
  );

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      scrollViewHeightY.value = e.nativeEvent.layout.height;

      // measuring pageY allows wrapping nested lists in other views
      runOnUI(() => {
        const measurement = measure(scrollViewContainerRef);
        if (!measurement) {
          return;
        }

        scrollViewPageY.value = measurement.pageY;
      })();

      onLayout?.(e);
    },
    [onLayout, scrollViewContainerRef, scrollViewHeightY, scrollViewPageY],
  );

  return (
    <ScrollViewContainerContext.Provider value={contextValue}>
      <GestureDetector gesture={outerScrollGesture}>
        <Animated.ScrollView
          {...rest}
          ref={handleRef}
          onScroll={composedScrollHandler}
          onLayout={handleLayout}
          scrollEnabled={scrollEnabled}
        />
      </GestureDetector>
    </ScrollViewContainerContext.Provider>
  );
};

export const ScrollViewContainer = forwardRef(ScrollViewContainerWithRef);
