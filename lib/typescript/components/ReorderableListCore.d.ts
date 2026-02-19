import React, { Dispatch, RefObject, SetStateAction } from 'react';
import { FlatList, ScrollView } from 'react-native';
import { NativeGesture } from 'react-native-gesture-handler';
import { SharedValue } from 'react-native-reanimated';
import { ReorderableListProps } from '../types';
interface ReorderableListCoreProps<T> extends ReorderableListProps<T> {
    scrollViewContainerRef: RefObject<ScrollView> | undefined;
    scrollViewPageXY: SharedValue<number> | undefined;
    scrollViewSize: SharedValue<number> | undefined;
    scrollViewScrollOffsetXY: SharedValue<number> | undefined;
    scrollViewScrollEnabledProp: SharedValue<boolean> | undefined;
    setScrollViewForceDisableScroll: Dispatch<SetStateAction<boolean>> | undefined;
    outerScrollGesture: NativeGesture | undefined;
    scrollable: boolean | undefined;
}
declare const MemoizedReorderableListCore: <T>(props: ReorderableListCoreProps<T> & {
    ref?: React.ForwardedRef<FlatList<T> | null> | undefined;
}) => React.ReactElement;
export { MemoizedReorderableListCore as ReorderableListCore };
//# sourceMappingURL=ReorderableListCore.d.ts.map