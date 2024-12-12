import React from 'react';

import type {SharedValue} from 'react-native-reanimated';

interface ReorderableListContextData {
  currentIndex: SharedValue<number>;
  draggedHeight: SharedValue<number>;
  dragEndHandlers: SharedValue<((from: number, to: number) => void)[][]>;
}

export const ReorderableListContext = React.createContext<
  ReorderableListContextData | undefined
>(undefined);
