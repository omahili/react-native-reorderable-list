"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useContext = void 0;
var _react = require("react");
const useContext = context => {
  const value = (0, _react.useContext)(context);
  if (value !== undefined) {
    return value;
  }
  throw 'Please consume ReorderableList context within its provider.';
};
exports.useContext = useContext;
//# sourceMappingURL=useContext.js.map