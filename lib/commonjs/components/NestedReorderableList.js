"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NestedReorderableList = void 0;
var _react = _interopRequireWildcard(require("react"));
var _ReorderableListCore = require("./ReorderableListCore");
var _contexts = require("../contexts");
var _hooks = require("../hooks");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  } = (0, _hooks.useContext)(_contexts.ScrollViewContainerContext);
  return /*#__PURE__*/_react.default.createElement(_ReorderableListCore.ReorderableListCore, _extends({}, rest, {
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
const NestedReorderableList = exports.NestedReorderableList = /*#__PURE__*/(0, _react.forwardRef)(NestedReorderableListWithRef);
//# sourceMappingURL=NestedReorderableList.js.map