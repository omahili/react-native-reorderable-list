import {FlatListProps} from 'react-native';

export interface ItemOffset {
  length: number;
  offset: number;
}

export interface ItemSeparators {
  highlight: () => void;
  unhighlight: () => void;
  updateProps: (select: 'leading' | 'trailing', newProps: any) => void;
}

export interface CellProps<T> extends FlatListProps<T> {
  index: number;
  children?: React.ReactElement;
  data: T[];
}

export enum ReorderableListState {
  IDLE = 0,
  DRAGGING,
  RELEASING,
  AUTO_SCROLL,
}
