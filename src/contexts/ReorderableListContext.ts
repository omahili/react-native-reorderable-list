import React from 'react';

import type {SharedValue} from 'react-native-reanimated';

interface ReorderableListContextData {
  currentIndex: SharedValue<number>;
  draggedHeight: SharedValue<number>;
  dragEndHandlers: SharedValue<((from: number, to: number) => void)[][]>;
  scale: SharedValue<number>;
  opacity: SharedValue<number>;
  activeIndex: number;
  shadow: {
    opacity: SharedValue<number>;
    radius: number;
    color: string;
    elevation: number;
  };
}

export const ReorderableListContext = React.createContext<
  ReorderableListContextData | undefined
>(undefined);
