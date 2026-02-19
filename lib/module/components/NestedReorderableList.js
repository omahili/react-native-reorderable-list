function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef } from 'react';
import { ReorderableListCore } from './ReorderableListCore';
import { ScrollViewContainerContext } from '../contexts';
import { useContext } from '../hooks';
const NestedReorderableListWithRef = ({
  scrollable,
  ...rest
}, ref) => {
  const {
    scrollViewContainerRef,
    scrollViewScrollOffsetXY,
    scrollViewPageXY,
    scrollViewSize,
    scrollViewScrollEnabledProp,
    outerScrollGesture,
    setScrollViewForceDisableScroll
  } = useContext(ScrollViewContainerContext);
  return /*#__PURE__*/React.createElement(ReorderableListCore, _extends({}, rest, {
    ref: ref,
    scrollViewContainerRef: scrollViewContainerRef,
    scrollViewScrollOffsetXY: scrollViewScrollOffsetXY,
    scrollViewPageXY: scrollViewPageXY,
    scrollViewSize: scrollViewSize,
    outerScrollGesture: outerScrollGesture,
    scrollViewScrollEnabledProp: scrollViewScrollEnabledProp,
    setScrollViewForceDisableScroll: setScrollViewForceDisableScroll,
    scrollable: scrollable,
    nestedScrollEnabled: true
  }));
};
export const NestedReorderableList = /*#__PURE__*/forwardRef(NestedReorderableListWithRef);
//# sourceMappingURL=NestedReorderableList.js.map