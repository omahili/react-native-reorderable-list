function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { measure, runOnUI, useAnimatedRef, useAnimatedScrollHandler, useComposedEventHandler, useSharedValue } from 'react-native-reanimated';
import { ScrollViewContainerContext } from '../contexts';
import { usePropAsSharedValue } from '../hooks';
const ScrollViewContainerWithRef = ({
  onLayout,
  onScroll,
  ...rest
}, ref) => {
  const scrollEnabled = rest.scrollEnabled ?? true;
  const [scrollViewForceDisableScroll, setScrollViewForceDisableScroll] = useState(false);
  const scrollViewScrollEnabledProp = usePropAsSharedValue(scrollEnabled);
  const scrollViewContainerRef = useAnimatedRef();
  const scrollViewScrollOffsetXY = useSharedValue(0);
  const scrollViewPageXY = useSharedValue(0);
  const scrollViewSize = useSharedValue(0);
  const horizontalProp = usePropAsSharedValue(!!rest.horizontal);
  const handleRef = useCallback(value => {
    scrollViewContainerRef(value);
    if (typeof ref === 'function') {
      ref(value);
    } else if (ref) {
      ref.current = value;
    }
  }, [scrollViewContainerRef, ref]);
  const outerScrollGesture = useMemo(() => Gesture.Native(), []);
  const handleScroll = useAnimatedScrollHandler(e => {
    scrollViewScrollOffsetXY.value = horizontalProp.value ? e.contentOffset.x : e.contentOffset.y;
  }, [scrollViewScrollOffsetXY]);
  const composedScrollHandler = useComposedEventHandler([handleScroll, onScroll || null]);
  const contextValue = useMemo(() => ({
    scrollViewContainerRef,
    scrollViewPageXY,
    scrollViewSize,
    scrollViewScrollOffsetXY,
    scrollViewScrollEnabledProp,
    outerScrollGesture,
    setScrollViewForceDisableScroll
  }), [scrollViewContainerRef, scrollViewPageXY, scrollViewSize, scrollViewScrollOffsetXY, scrollViewScrollEnabledProp, outerScrollGesture, setScrollViewForceDisableScroll]);
  const handleLayout = useCallback(e => {
    scrollViewSize.value = horizontalProp.value ? e.nativeEvent.layout.width : e.nativeEvent.layout.height;

    // measuring pageY allows wrapping nested lists in other views
    runOnUI(() => {
      const measurement = measure(scrollViewContainerRef);
      if (!measurement) {
        return;
      }
      scrollViewPageXY.value = horizontalProp.value ? measurement.pageX : measurement.pageY;
    })();
    onLayout === null || onLayout === void 0 || onLayout(e);
  }, [onLayout, scrollViewContainerRef, scrollViewSize, scrollViewPageXY, horizontalProp]);
  return /*#__PURE__*/React.createElement(ScrollViewContainerContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/React.createElement(GestureDetector, {
    gesture: outerScrollGesture
  }, /*#__PURE__*/React.createElement(Animated.ScrollView, _extends({}, rest, {
    ref: handleRef,
    onScroll: composedScrollHandler,
    onLayout: handleLayout
    // We force disable scroll or let the component prop control it.
    ,
    scrollEnabled: scrollViewForceDisableScroll ? false : scrollEnabled
  }))));
};
export const ScrollViewContainer = /*#__PURE__*/forwardRef(ScrollViewContainerWithRef);
//# sourceMappingURL=ScrollViewContainer.js.map