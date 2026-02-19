"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePropAsSharedValue = void 0;
var _react = require("react");
var _reactNativeReanimated = require("react-native-reanimated");
const usePropAsSharedValue = value => {
  const sv = (0, _reactNativeReanimated.useSharedValue)(value);
  (0, _react.useEffect)(() => {
    sv.value = value;
  }, [sv, value]);
  return sv;
};
exports.usePropAsSharedValue = usePropAsSharedValue;
//# sourceMappingURL=usePropAsSharedValue.js.map