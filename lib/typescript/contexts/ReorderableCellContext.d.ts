import React from 'react';
import type { SharedValue } from 'react-native-reanimated';
interface ReorderableCellContextData {
    index: number;
    dragHandler: () => void;
    draggedIndex: SharedValue<number>;
    isActive: boolean;
}
export declare const ReorderableCellContext: React.Context<ReorderableCellContextData | undefined>;
export {};
//# sourceMappingURL=ReorderableCellContext.d.ts.map