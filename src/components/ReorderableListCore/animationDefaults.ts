import {Easing, WithTimingConfig} from 'react-native-reanimated';

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

export const SHADOW_OPACITY_ANIMATION_CONFIG_DEFAULT: AnimationConfig = {
  start: {
    toValue: 0.25,
    easing: Easing.in(Easing.ease),
    duration: DURATION_START,
  },
  end: {
    toValue: 0,
    easing: Easing.out(Easing.ease),
    duration: DURATION_END,
  },
};
