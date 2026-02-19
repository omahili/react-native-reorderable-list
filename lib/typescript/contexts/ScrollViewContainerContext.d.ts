import React, { Dispatch, SetStateAction } from 'react';
import { ScrollView } from 'react-native';
import { NativeGesture } from 'react-native-gesture-handler';
import { SharedValue } from 'react-native-reanimated';
interface ScrollViewContainerContextData {
    scrollViewContainerRef: React.RefObject<ScrollView>;
    scrollViewPageXY: SharedValue<number>;
    scrollViewSize: SharedValue<number>;
    scrollViewScrollOffsetXY: SharedValue<number>;
    scrollViewScrollEnabledProp: SharedValue<boolean>;
    outerScrollGesture: NativeGesture;
    setScrollViewForceDisableScroll: Dispatch<SetStateAction<boolean>>;
}
export declare const ScrollViewContainerContext: React.Context<ScrollViewContainerContextData | undefined>;
export {};
//# sourceMappingURL=ScrollViewContainerContext.d.ts.map