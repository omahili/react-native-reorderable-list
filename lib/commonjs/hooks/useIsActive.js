"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIsActive = void 0;
var _useContext = require("./useContext");
var _contexts = require("../contexts");
const useIsActive = () => {
  const {
    isActive
  } = (0, _useContext.useContext)(_contexts.ReorderableCellContext);
  return isActive;
};
exports.useIsActive = useIsActive;
//# sourceMappingURL=useIsActive.js.map