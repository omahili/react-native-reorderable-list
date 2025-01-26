import React from 'react';

import type {SharedValue} from 'react-native-reanimated';

import {ReorderableListCellAnimations} from '../types';

interface ReorderableListContextData {
  currentIndex: SharedValue<number>;
  draggedHeight: SharedValue<number>;
  dragEndHandlers: SharedValue<((from: number, to: number) => void)[][]>;
  activeIndex: number;
  cellAnimations: ReorderableListCellAnimations;
}

export const ReorderableListContext = React.createContext<
  ReorderableListContextData | undefined
>(undefined);
