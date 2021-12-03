export interface ItemOffset {
  length: number;
  offset: number;
}

export interface ItemSeparators {
  highlight: () => void;
  unhighlight: () => void;
  updateProps: (select: 'leading' | 'trailing', newProps: any) => void;
}

export enum ReorderableListState {
  IDLE = 0,
  DRAGGING,
  RELEASING,
  AUTO_SCROLL,
}
