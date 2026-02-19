"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReorderableDragEnd = void 0;
var _react = require("react");
var _useContext = require("./useContext");
var _contexts = require("../contexts");
const useReorderableDragEnd = onEnd => {
  const {
    dragEndHandlers
  } = (0, _useContext.useContext)(_contexts.ReorderableListContext);
  const {
    index
  } = (0, _useContext.useContext)(_contexts.ReorderableCellContext);
  (0, _react.useEffect)(() => {
    dragEndHandlers.modify(value => {
      'worklet';

      if (!Array.isArray(value[index])) {
        value[index] = [];
      }
      value[index].push(onEnd);
      return value;
    });
    return () => {
      dragEndHandlers.modify(value => {
        'worklet';

        if (Array.isArray(value[index])) {
          value[index] = value[index].filter(x => x.name !== onEnd.name);
        }
        return value;
      });
    };
  }, [index, dragEndHandlers, onEnd]);
};
exports.useReorderableDragEnd = useReorderableDragEnd;
//# sourceMappingURL=useReorderableDragEnd.js.map