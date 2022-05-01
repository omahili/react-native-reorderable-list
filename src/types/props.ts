import {
  FlatListProps,
  ListRenderItemInfo,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import Animated from 'react-native-reanimated';

export interface CellProps<T> {
  index: number;
  children?: React.ReactElement;
  data: T[];
  onLayout?: (e: LayoutChangeEvent) => void;
  keyExtractor?: (item: T, index: number) => string;
}

export interface ReorderableListRenderItemInfo<T>
  extends ListRenderItemInfo<T> {
  drag?: () => void;
  isDragged?: boolean;
}

export interface ReorderableListReorderEvent {
  fromIndex: number;
  toIndex: number;
}

type UnsupportedProps =
  | 'horizontal'
  | 'onScroll'
  | 'scrollEventThrottle'
  | 'numColumns';

export interface ReorderableListProps<T>
  extends Omit<FlatListProps<T>, UnsupportedProps> {
  data: T[];
  containerStyle?: StyleProp<Animated.AnimateStyle<StyleProp<ViewStyle>>>;
  scrollAreaSize?: number;
  scrollSpeed?: number;
  dragScale?: number;
  renderItem: (info: ReorderableListRenderItemInfo<T>) => React.ReactElement;
  onReorder: (event: ReorderableListReorderEvent) => void;
}
