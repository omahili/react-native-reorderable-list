"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SCALE_ANIMATION_CONFIG_DEFAULT = exports.OPACITY_ANIMATION_CONFIG_DEFAULT = exports.IS_FABRIC = exports.AUTOSCROLL_CONFIG = void 0;
var _reactNative = require("react-native");
var _reactNativeReanimated = require("react-native-reanimated");
const IOS_AUTOSCROLL_CONFIG = {
  delay: 80,
  increment: 100
};
const ANDROID_FABRIC_AUTOSCROLL_CONFIG = {
  delay: 50,
  increment: 80
};
const ANDROID_PAPER_AUTOSCROLL_CONFIG = {
  delay: 10,
  increment: 4
};
const IS_FABRIC = exports.IS_FABRIC = global && typeof global === 'object' && 'nativeFabricUIManager' in global;
const AUTOSCROLL_CONFIG = exports.AUTOSCROLL_CONFIG = _reactNative.Platform.select({
  // autoscroll behaves differently with Fabric and Paper on Android
  android: IS_FABRIC ? ANDROID_FABRIC_AUTOSCROLL_CONFIG : ANDROID_PAPER_AUTOSCROLL_CONFIG,
  ios: IOS_AUTOSCROLL_CONFIG,
  // unsupported platforms
  web: IOS_AUTOSCROLL_CONFIG,
  macos: IOS_AUTOSCROLL_CONFIG,
  windows: IOS_AUTOSCROLL_CONFIG,
  native: IOS_AUTOSCROLL_CONFIG
});
const DURATION_START = 150;
const DURATION_END = 200;
const SCALE_ANIMATION_CONFIG_DEFAULT = exports.SCALE_ANIMATION_CONFIG_DEFAULT = {
  start: {
    toValue: 1.025,
    easing: _reactNativeReanimated.Easing.in(_reactNativeReanimated.Easing.ease),
    duration: DURATION_START
  },
  end: {
    toValue: 1,
    easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.ease),
    duration: DURATION_END
  }
};
const OPACITY_ANIMATION_CONFIG_DEFAULT = exports.OPACITY_ANIMATION_CONFIG_DEFAULT = {
  start: {
    toValue: 0.75,
    easing: _reactNativeReanimated.Easing.in(_reactNativeReanimated.Easing.ease),
    duration: DURATION_START
  },
  end: {
    toValue: 1,
    easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.ease),
    duration: DURATION_END
  }
};
//# sourceMappingURL=constants.js.map