import {Platform} from 'react-native';

import {Easing, WithTimingConfig} from 'react-native-reanimated';

const IOS_AUTOSCROLL_CONFIG = {
  delay: 80,
  increment: 100,
};

const ANDROID_FABRIC_AUTOSCROLL_CONFIG = {
  delay: 50,
  increment: 80,
};

const ANDROID_PAPER_AUTOSCROLL_CONFIG = {
  delay: 10,
  increment: 4,
};

export const IS_FABRIC =
  global && typeof global === 'object' && 'nativeFabricUIManager' in global;

export const AUTOSCROLL_CONFIG = Platform.select({
  // autoscroll behaves differently with Fabric and Paper on Android
  android: IS_FABRIC
    ? ANDROID_FABRIC_AUTOSCROLL_CONFIG
    : ANDROID_PAPER_AUTOSCROLL_CONFIG,
  ios: IOS_AUTOSCROLL_CONFIG,

  // unsupported platforms
  web: IOS_AUTOSCROLL_CONFIG,
  macos: IOS_AUTOSCROLL_CONFIG,
  windows: IOS_AUTOSCROLL_CONFIG,
  native: IOS_AUTOSCROLL_CONFIG,
});

const DURATION_START = 150;
const DURATION_END = 200;

interface AnimationConfig {
  start: WithTimingConfig & {toValue: number};
  end: WithTimingConfig & {toValue: number};
}

export const SCALE_ANIMATION_CONFIG_DEFAULT: AnimationConfig = {
  start: {
    toValue: 1.025,
    easing: Easing.in(Easing.ease),
    duration: DURATION_START,
  },
  end: {
    toValue: 1,
    easing: Easing.out(Easing.ease),
    duration: DURATION_END,
  },
};

export const OPACITY_ANIMATION_CONFIG_DEFAULT: AnimationConfig = {
  start: {
    toValue: 0.75,
    easing: Easing.in(Easing.ease),
    duration: DURATION_START,
  },
  end: {
    toValue: 1,
    easing: Easing.out(Easing.ease),
    duration: DURATION_END,
  },
};
