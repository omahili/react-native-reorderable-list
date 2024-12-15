import type {
  FlatListProps,
  NativeScrollEvent,
  ScrollViewProps,
  ViewProps,
} from 'react-native';

import {EasingFunction} from 'react-native-reanimated';

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
   * Event fired after an item is released and the list is reordered.
   */
  onReorder: (event: ReorderableListReorderEvent) => void;
  /**
   * Event fired at most once per frame during scrolling. Needs to be a `worklet`. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.
   */
  onScroll?: (event: NativeScrollEvent) => void;
  /**
   * Event fired when the dragged item is released. Needs to be a `worklet`. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.
   */
  onDragEnd?: (event: ReorderableListDragEndEvent) => void;
}

export interface ReorderableListItemConfig {
  /**
   * Value of the animated style on drag end.
   */
  enabled?: boolean;
  /**
   * Value of the animated style on drag end.
   */
  valueEnd?: number;
  /**
   * Value of the animated style on drag start.
   */
  valueStart?: number;
  /**
   * Easing function for the animation to the end value. Default: `Easing.in(Easing.ease)`.
   */
  easingEnd?: EasingFunction;
  /**
   * Easing function for the animation to the start value. Default: `Easing.out(Easing.ease)`.
   */
  easingStart?: EasingFunction;
  /**
   * Duration of the animations in milliseconds. Default: `200`.
   */
  duration?: number;
}

export interface ReorderableListItemProps extends ViewProps {
  /**
   * Config for the `opacity` animation. Enabled by default with custom default options.
   */
  opacityAnimationConfig?: ReorderableListItemConfig;
  /**
   * Config for the `scale` animation. Enabled by default with custom default options.
   */
  scaleAnimationConfig?: ReorderableListItemConfig;
}

export interface ScrollViewContainerProps
  extends Omit<ScrollViewProps, 'onScroll'> {
  /**
   * Event fired at most once per frame during scrolling. Needs to be a `worklet`. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.
   */
  onScroll?: (event: NativeScrollEvent) => void;
}

export interface NestedReorderableListProps<T> extends ReorderableListProps<T> {
  /**
   * Whether the nested list is scrollable or not. If the nested list has a fixed height and it's scrollable it should be set to `true`, otherwise `false`. Default: `false`.
   */
  scrollable?: boolean;
}
