"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useReorderableDrag = void 0;
var _useContext = require("./useContext");
var _contexts = require("../contexts");
const useReorderableDrag = () => {
  const {
    dragHandler
  } = (0, _useContext.useContext)(_contexts.ReorderableCellContext);
  return dragHandler;
};
exports.useReorderableDrag = useReorderableDrag;
//# sourceMappingURL=useReorderableDrag.js.map