/// <reference types="react" />
/// <reference types="react" />
import { CellRendererProps } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { ReorderableListRenderItem } from '../types';
interface ReorderableListCellProps<T> extends Omit<CellRendererProps<T>, 'cellKey'> {
    startDrag: (index: number) => void;
    itemOffset: SharedValue<number[]>;
    itemSize: SharedValue<number[]>;
    dragXY: SharedValue<number>;
    draggedIndex: SharedValue<number>;
    animationDuration: SharedValue<number>;
    renderDropIndicator?: ReorderableListRenderItem<T>;
}
export declare const ReorderableListCell: <T>(props: ReorderableListCellProps<T>) => JSX.Element;
export {};
//# sourceMappingURL=ReorderableListCell.d.ts.map