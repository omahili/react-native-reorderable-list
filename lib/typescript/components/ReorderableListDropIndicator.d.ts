/// <reference types="react" />
/// <reference types="react" />
import { SharedValue } from 'react-native-reanimated';
import { ReorderableListRenderItem } from '../types';
interface ReorderableListDropIndicatorProps<T> {
    item: T;
    index: number;
    animationDuration: SharedValue<number>;
    dropIndicatorTranslationXY: SharedValue<number>;
    renderDropIndicator: ReorderableListRenderItem<T>;
}
export declare const ReorderableListDropIndicator: <T>(props: ReorderableListDropIndicatorProps<T>) => JSX.Element;
export {};
//# sourceMappingURL=ReorderableListDropIndicator.d.ts.map