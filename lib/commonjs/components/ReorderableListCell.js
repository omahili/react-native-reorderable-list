"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReorderableListCell = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _contexts = require("../contexts");
var _hooks = require("../hooks");
var _helpers = require("./helpers");
var _ReorderableListDropIndicator = require("./ReorderableListDropIndicator");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const ReorderableListCell = exports.ReorderableListCell = /*#__PURE__*/(0, _react.memo)(({
  index,
  startDrag,
  item,
  children,
  onLayout,
  itemOffset,
  itemSize,
  dragXY,
  draggedIndex,
  animationDuration,
  renderDropIndicator
}) => {
  const {
    currentIndex,
    dropIndicatorTranslationXY,
    draggedSize,
    activeIndex,
    cellAnimations,
    itemLayoutAnimation,
    horizontal
  } = (0, _hooks.useContext)(_contexts.ReorderableListContext);
  const dragHandler = (0, _react.useCallback)(() => (0, _reactNativeReanimated.runOnUI)(startDrag)(index), [startDrag, index]);
  const [showDropIndicator, setShowDropIndicator] = (0, _react.useState)(false);
  const isActive = activeIndex === index;
  const contextValue = (0, _react.useMemo)(() => ({
    index,
    dragHandler,
    draggedIndex,
    isActive
  }), [index, dragHandler, draggedIndex, isActive]);

  // Keep separate animated reactions that update itemTranslateXY
  // otherwise animations might stutter if multiple are triggered
  // (even in other cells, e.g. released item and reordering cells)
  const itemTranslateXY = (0, _reactNativeReanimated.useSharedValue)(0);
  const isActiveCell = (0, _reactNativeReanimated.useDerivedValue)(() => {
    const value = draggedIndex.value === index;
    if (renderDropIndicator) {
      if (value) {
        (0, _reactNativeReanimated.runOnJS)(setShowDropIndicator)(true);
      } else if (showDropIndicator) {
        (0, _reactNativeReanimated.runOnJS)(setShowDropIndicator)(false);
      }
    }
    return value;
  });
  (0, _reactNativeReanimated.useAnimatedReaction)(() => dragXY.value, () => {
    if (index === draggedIndex.value && currentIndex.value >= 0 && draggedIndex.value >= 0) {
      itemTranslateXY.value = dragXY.value;
    }
  });
  (0, _reactNativeReanimated.useAnimatedReaction)(() => currentIndex.value, () => {
    if (index !== draggedIndex.value && currentIndex.value >= 0 && draggedIndex.value >= 0) {
      const moveUp = currentIndex.value > draggedIndex.value;
      const startMove = Math.min(draggedIndex.value, currentIndex.value);
      const endMove = Math.max(draggedIndex.value, currentIndex.value);
      let newValue = 0;
      if (index >= startMove && index <= endMove) {
        newValue = moveUp ? -draggedSize.value : draggedSize.value;
      }
      if (newValue !== itemTranslateXY.value) {
        itemTranslateXY.value = (0, _reactNativeReanimated.withTiming)(newValue, {
          duration: animationDuration.value,
          easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.ease)
        });
      }
    }
  });
  const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    const translatePropName = horizontal.value ? 'translateX' : 'translateY';
    if (isActiveCell.value) {
      const transform = [{
        [translatePropName]: itemTranslateXY.value
      }];
      if (Array.isArray(cellAnimations.transform)) {
        const customTransform = cellAnimations.transform.map(x => (0, _helpers.applyAnimatedStyles)({}, x));
        transform.push(...customTransform);
      }
      return (0, _helpers.applyAnimatedStyles)({
        transform,
        zIndex: 999
      }, cellAnimations, ['transform']);
    }
    return {
      transform: [{
        [translatePropName]: itemTranslateXY.value
      }],
      // We set zIndex here due to the following issue:
      // https://github.com/software-mansion/react-native-reanimated/issues/6681#issuecomment-2514228447
      zIndex: 0
    };
  });
  const handleLayout = e => {
    (0, _reactNativeReanimated.runOnUI)((x, y, width, height) => {
      itemOffset.value[index] = horizontal.value ? x : y;
      itemSize.value[index] = horizontal.value ? width : height;
    })(e.nativeEvent.layout.x, e.nativeEvent.layout.y, e.nativeEvent.layout.width, e.nativeEvent.layout.height);
    onLayout === null || onLayout === void 0 || onLayout(e);
  };
  return /*#__PURE__*/_react.default.createElement(_contexts.ReorderableCellContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_reactNativeReanimated.default.View, {
    style: animatedStyle,
    onLayout: handleLayout,
    layout: itemLayoutAnimation.current
  }, children), showDropIndicator && renderDropIndicator && /*#__PURE__*/_react.default.createElement(_ReorderableListDropIndicator.ReorderableListDropIndicator, {
    index: index,
    item: item,
    animationDuration: animationDuration,
    dropIndicatorTranslationXY: dropIndicatorTranslationXY,
    renderDropIndicator: renderDropIndicator
  }));
}
// Memo breaks type inference, we cast it to maintain it.
);
//# sourceMappingURL=ReorderableListCell.js.map