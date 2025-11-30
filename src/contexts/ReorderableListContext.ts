import React from 'react';

import type {SharedValue} from 'react-native-reanimated';

import {ItemLayoutAnimation, ReorderableListCellAnimations} from '../types';

interface ReorderableListContextData {
  currentIndex: SharedValue<number>;
  draggedSize: SharedValue<number>;
  dragEndHandlers: SharedValue<((from: number, to: number) => void)[][]>;
  activeIndex: number;
  itemLayoutAnimation: React.MutableRefObject<ItemLayoutAnimation | undefined>;
  cellAnimations: ReorderableListCellAnimations;
  horizontal: SharedValue<boolean>;
}

export const ReorderableListContext = React.createContext<
  ReorderableListContextData | undefined
>(undefined);
