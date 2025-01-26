import {SharedValue} from 'react-native-reanimated';

export enum ReorderableListState {
  IDLE = 0,
  DRAGGED,
  RELEASED,
  AUTOSCROLL,
}

export type SharedValueOrType<T> = {
  [TKey in keyof T]?: SharedValue<T[TKey]> | T[TKey];
};

export type MaximumOneOf<T, K extends keyof T = keyof T> = K extends keyof T
  ? {[P in K]: T[K]} & {[P in Exclude<keyof T, K>]?: never}
  : never;
