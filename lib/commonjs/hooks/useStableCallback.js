"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStableCallback = void 0;
var _react = require("react");
// eslint-disable-next-line @typescript-eslint/no-explicit-any

const useStableCallback = value => {
  const callback = (0, _react.useRef)(value);
  (0, _react.useLayoutEffect)(() => {
    callback.current = value;
  });
  return (0, _react.useCallback)((...args) => {
    var _callback$current;
    return (_callback$current = callback.current) === null || _callback$current === void 0 ? void 0 : _callback$current.call(callback, ...args);
  }, []);
};
exports.useStableCallback = useStableCallback;
//# sourceMappingURL=useStableCallback.js.map