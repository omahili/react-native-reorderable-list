import { WithTimingConfig } from 'react-native-reanimated';
export declare const IS_FABRIC: boolean;
export declare const AUTOSCROLL_CONFIG: {
    delay: number;
    increment: number;
};
interface AnimationConfig {
    start: WithTimingConfig & {
        toValue: number;
    };
    end: WithTimingConfig & {
        toValue: number;
    };
}
export declare const SCALE_ANIMATION_CONFIG_DEFAULT: AnimationConfig;
export declare const OPACITY_ANIMATION_CONFIG_DEFAULT: AnimationConfig;
export {};
//# sourceMappingURL=constants.d.ts.map