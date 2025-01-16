import type {FlatListProps, ScrollViewProps} from 'react-native';

import {SharedValue, useAnimatedScrollHandler} from 'react-native-reanimated';

export interface ReorderableListReorderEvent {
  /**
   * Index of the dragged item.
   */
  from: number;
  /**
   * Index where the dragged item was released.
   */
  to: number;
}

export interface ReorderableListDragStartEvent {
  /**
   * Index of the dragged item.
   */
  index: number;
}

export interface ReorderableListDragEndEvent {
  /**
   * Index of the dragged item.
   */
  from: number;
  /**
   * Index where the dragged item was released.
   */
  to: number;
}

type OmittedProps =
  | 'horizontal'
  | 'onScroll'
  | 'scrollEventThrottle'
  | 'removeClippedSubviews'
  | 'CellRendererComponent'
  | 'numColumns';

export interface ReorderableListProps<T>
  extends Omit<FlatListProps<T>, OmittedProps> {
  data: T[];
  /**
   * Threshold  at the extremety of the list which triggers autoscroll when an item is dragged to it.
   * A value of 0.1 means that 10% of the area at the top and 10% at the bottom of the list will trigger autoscroll
   * when an item is dragged to it. Min value: `0`. Max value: `0.4`. Default: `0.1`.
   */
  autoscrollThreshold?: number;
  /**
   * Scales the autoscroll spreed at which the list scrolls when an item is dragged to the scroll areas. Default: `1`.
   */
  autoscrollSpeedScale?: number;
  /**
   * Delay in between autoscroll triggers. Can be used to tune the autoscroll smoothness.
   * Default Android: `0`.
   * Default iOS: `100`.
   */
  autoscrollDelay?: number;
  /**
   * Specifies the fraction of an item's size at which it will shift when a dragged item crosses over it.
   * For example, a value of 0.2 means the item shifts when the dragged item passes 20% of its height (vertical list). Default is `0.2`.
   */
  dragReorderThreshold?: number;
  /**
   * Duration of the animations in milliseconds.
   * Be aware that users won't be able to drag a new item until the dragged item is released and
   * its animation to its new position ends.
   * Default: `200`.
   */
  animationDuration?: number;
  /**
   * Allows passing an object with shared values that can animate a cell by using the `onDragStart` and `onDragEnd` events.
   */
  cellAnimations?: ReorderableListCellAnimations;
  /**
   * Event fired after an item is released and the list is reordered.
   */
  onReorder: (event: ReorderableListReorderEvent) => void;
  /**
   * An animated scroll handler created with useAnimatedScrollHandler. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.
   */
  onScroll?: ReturnType<typeof useAnimatedScrollHandler>;
  /**
   * Event fired when an item is dragged. Needs to be a `worklet`. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.
   */
  onDragStart?: (event: ReorderableListDragStartEvent) => void;
  /**
   * Event fired when the dragged item is released. Needs to be a `worklet`. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.
   */
  onDragEnd?: (event: ReorderableListDragEndEvent) => void;
}

export interface ReorderableListCellAnimations {
  /**
   * Shared value to animate the opacity of a dragged item. Set to false to disable default opacity animations.
   */
  opacity?: SharedValue<number> | false;
  /**
   * Shared value to animate the scale of a dragged item. Set to false to disable default scale animations.
   */
  scale?: SharedValue<number> | false;
}

export interface ScrollViewContainerProps
  extends Omit<ScrollViewProps, 'onScroll'> {
  /**
   * An animated scroll handler created with useAnimatedScrollHandler. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.
   */
  onScroll?: ReturnType<typeof useAnimatedScrollHandler>;
}

export interface NestedReorderableListProps<T> extends ReorderableListProps<T> {
  /**
   * Whether the nested list is scrollable or not. If the nested list has a fixed height and it's scrollable it should be set to `true`, otherwise `false`. Default: `false`.
   */
  scrollable?: boolean;
}
