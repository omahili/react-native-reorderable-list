import React from 'react';

import type {SharedValue} from 'react-native-reanimated';

interface ReorderableListContextData {
  currentIndex: SharedValue<number>;
  draggedHeight: SharedValue<number>;
}

export const ReorderableListContext = React.createContext<
  ReorderableListContextData | undefined
>(undefined);
