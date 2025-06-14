import React, {forwardRef, useCallback, useMemo, useState} from 'react';
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

import {ScrollViewContainerContext} from '../contexts';
import {usePropAsSharedValue} from '../hooks';
import type {ScrollViewContainerProps} from '../types';

const ScrollViewContainerWithRef = (
  {onLayout, onScroll, ...rest}: ScrollViewContainerProps,
  ref: React.ForwardedRef<ScrollView>,
) => {
  const scrollEnabled = rest.scrollEnabled ?? true;

  const [scrollViewForceDisableScroll, setScrollViewForceDisableScroll] =
    useState(false);
  const scrollViewScrollEnabledProp = usePropAsSharedValue(scrollEnabled);
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
      scrollViewScrollEnabledProp,
      outerScrollGesture,
      setScrollViewForceDisableScroll,
    }),
    [
      scrollViewContainerRef,
      scrollViewPageY,
      scrollViewHeightY,
      scrollViewScrollOffsetY,
      scrollViewScrollEnabledProp,
      outerScrollGesture,
      setScrollViewForceDisableScroll,
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
          // We force disable scroll or let the component prop control it.
          scrollEnabled={scrollViewForceDisableScroll ? false : scrollEnabled}
        />
      </GestureDetector>
    </ScrollViewContainerContext.Provider>
  );
};

export const ScrollViewContainer = forwardRef(ScrollViewContainerWithRef);
