"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReorderableDragStart = void 0;
var _reactNativeReanimated = require("react-native-reanimated");
var _useContext = require("./useContext");
var _contexts = require("../contexts");
const useReorderableDragStart = onStart => {
  const {
    draggedIndex,
    index
  } = (0, _useContext.useContext)(_contexts.ReorderableCellContext);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => draggedIndex.value === index, newValue => {
    if (newValue && onStart) {
      onStart(index);
    }
  }, [onStart]);
};
exports.useReorderableDragStart = useReorderableDragStart;
//# sourceMappingURL=useReorderableDragStart.js.map