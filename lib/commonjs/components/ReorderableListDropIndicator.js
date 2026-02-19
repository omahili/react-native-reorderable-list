"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReorderableListDropIndicator = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _contexts = require("../contexts");
var _hooks = require("../hooks");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const ReorderableListDropIndicator = exports.ReorderableListDropIndicator = /*#__PURE__*/(0, _react.memo)(({
  item,
  index,
  dropIndicatorTranslationXY,
  animationDuration,
  renderDropIndicator
}) => {
  const {
    draggedSize,
    horizontal
  } = (0, _hooks.useContext)(_contexts.ReorderableListContext);
  const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => ({
    // We set the fixed styles here due to the following issue:
    // https://github.com/software-mansion/react-native-reanimated/issues/6681#issuecomment-2514228447
    // Negative zIndex fixes the drop indicator flickering over
    // the dropped item when its re-rendered on reorder.
    zIndex: -1,
    position: 'absolute',
    [horizontal.value ? 'height' : 'width']: '100%',
    [horizontal.value ? 'width' : 'height']: draggedSize.value,
    transform: [{
      [horizontal.value ? 'translateX' : 'translateY']: (0, _reactNativeReanimated.withTiming)(dropIndicatorTranslationXY.value, {
        duration: animationDuration.value,
        easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.ease)
      })
    }]
  }));
  return /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: animatedStyle
  }, renderDropIndicator({
    item,
    index
  }));
}
// Memo breaks type inference, we cast it to maintain it.
);
//# sourceMappingURL=ReorderableListDropIndicator.js.map