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
  const scrollViewScrollOffsetXY = useSharedValue(0);
  const scrollViewPageXY = useSharedValue(0);
  const scrollViewSize = useSharedValue(0);
  const horizontalProp = usePropAsSharedValue(!!rest.horizontal);

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
      scrollViewScrollOffsetXY.value = horizontalProp.value
        ? e.contentOffset.x
        : e.contentOffset.y;
    },
    [scrollViewScrollOffsetXY],
  );

  const composedScrollHandler = useComposedEventHandler([
    handleScroll,
    onScroll || null,
  ]);

  const contextValue = useMemo(
    () => ({
      scrollViewContainerRef,
      scrollViewPageXY,
      scrollViewSize,
      scrollViewScrollOffsetXY,
      scrollViewScrollEnabledProp,
      outerScrollGesture,
      setScrollViewForceDisableScroll,
    }),
    [
      scrollViewContainerRef,
      scrollViewPageXY,
      scrollViewSize,
      scrollViewScrollOffsetXY,
      scrollViewScrollEnabledProp,
      outerScrollGesture,
      setScrollViewForceDisableScroll,
    ],
  );

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      scrollViewSize.value = horizontalProp.value
        ? e.nativeEvent.layout.width
        : e.nativeEvent.layout.height;

      // measuring pageY allows wrapping nested lists in other views
      runOnUI(() => {
        const measurement = measure(scrollViewContainerRef);
        if (!measurement) {
          return;
        }

        scrollViewPageXY.value = horizontalProp.value
          ? measurement.pageX
          : measurement.pageY;
      })();

      onLayout?.(e);
    },
    [
      onLayout,
      scrollViewContainerRef,
      scrollViewSize,
      scrollViewPageXY,
      horizontalProp,
    ],
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
