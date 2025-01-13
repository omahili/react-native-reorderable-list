import {Platform} from 'react-native';

const IOS_CONFIG = {
  delay: 80,
  increment: 100,
};

const ANDROID_FABRIC_CONFIG = {
  delay: 50,
  increment: 80,
};

const ANDROID_PAPER_CONFIG = {
  delay: 10,
  increment: 4,
};

export const IS_FABRIC =
  global && typeof global === 'object' && 'nativeFabricUIManager' in global;

export const AUTOSCROLL_CONFIG = Platform.select({
  // autoscroll behaves differently with Fabric and Paper on Android
  android: IS_FABRIC ? ANDROID_FABRIC_CONFIG : ANDROID_PAPER_CONFIG,
  ios: IOS_CONFIG,

  // unsupported platforms
  web: IOS_CONFIG,
  macos: IOS_CONFIG,
  windows: IOS_CONFIG,
  native: IOS_CONFIG,
});
