function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import React, { forwardRef } from 'react';
import { ReorderableListCore } from './ReorderableListCore';
const ReorderableListWithRef = (props, ref) => /*#__PURE__*/React.createElement(ReorderableListCore, _extends({}, props, {
  ref: ref,
  scrollViewContainerRef: undefined,
  scrollViewScrollOffsetXY: undefined,
  scrollViewPageXY: undefined,
  scrollViewSize: undefined,
  outerScrollGesture: undefined,
  scrollViewScrollEnabledProp: undefined,
  setScrollViewForceDisableScroll: undefined,
  scrollable: true
}));
export const ReorderableList = /*#__PURE__*/forwardRef(ReorderableListWithRef);
//# sourceMappingURL=ReorderableList.js.map