import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItemInfo,
  ViewStyle,
  LayoutChangeEvent,
  StatusBar,
  unstable_batchedUpdates,
} from 'react-native';
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
  useAnimatedStyle,
  useAnimatedRef,
  useAnimatedScrollHandler,
  scrollTo,
  withTiming,
  Easing,
  runOnUI,
} from 'react-native-reanimated';
import composeRefs from '@seznam/compose-react-refs';
import memoize from 'fast-memoize';

import ReorderableListItem from 'components/ReorderableListItem';
import useAnimatedSharedValues from 'hooks/useAnimatedSharedValues';
import {ItemOffset, ItemSeparators, ReorderableListState} from 'types/misc';
import {CellProps, ReorderableListProps} from 'types/props';

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList,
) as unknown as <T>(
  props: FlatListProps<T> & {ref: React.Ref<FlatListProps<T>>},
) => React.ReactElement;

const ReorderableList = <T,>(
  {
    data,
    containerStyle,
    scrollAreaSize = 0.1,
    scrollSpeed = 2,
    dragScale = 1,
    renderItem,
    onLayout,
    onReorder,
    keyExtractor,
    ...rest
  }: ReorderableListProps<T>,
  ref: React.ForwardedRef<FlatListProps<T>>,
) => {
  const container = useAnimatedRef<any>();
  const flatList = useAnimatedRef<any>();
  const nativeHandler = useRef<NativeViewGestureHandler>(null);
  const itemSeparators = useRef<ItemSeparators[]>([]);

  const gestureState = useSharedValue<State>(State.UNDETERMINED);
  const currentY = useSharedValue(0);
  const startY = useSharedValue(0);
  const containerPositionX = useSharedValue(0);
  const containerPositionY = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const itemOffsets = useAnimatedSharedValues<ItemOffset>(
    () => ({length: 0, offset: 0}),
    data.length,
  );
  const topMoveThreshold = useSharedValue(0);
  const bottomMoveThreshold = useSharedValue(0);
  const flatListHeight = useSharedValue(0);
  // position of the drag gesture relative to the item
  const offsetY = useSharedValue(0);
  // TODO: remove nullable when this bug is fixed
  // https://github.com/software-mansion/react-native-reanimated/issues/2019
  const draggedTranslateY = useSharedValue<number | null>(null);
  // keeps track of the new position of the dragged item
  const currentIndex = useSharedValue(-1);
  // keeps track of the dragged item order
  const draggedIndex = useSharedValue(-1);
  // keeps track of the actual rendered item, useful on reorder re-render to
  // avoid element shifted at the new position to be rendered just before it disappears
  const draggedInfoIndex = useSharedValue(-1);
  const state = useSharedValue<ReorderableListState>(ReorderableListState.IDLE);
  const autoScrollOffset = useSharedValue(-1);
  const autoScrollSpeed = useSharedValue(Math.max(0, scrollSpeed));
  const enabledOpacity = useSharedValue(false);
  const draggedItemScale = useSharedValue(1);

  const [dragged, setDragged] = useState(false);

  const relativeToContainer = (y: number, x: number) => {
    'worklet';

    return {
      y: y - containerPositionY.value - (StatusBar.currentHeight || 0),
      x: x - containerPositionX.value,
    };
  };

  const handleGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {startY: number}
  >({
    onStart: (e, ctx) => {
      // prevent new dragging until item is completely released
      if (state.value !== ReorderableListState.RELEASING) {
        const {y} = relativeToContainer(e.absoluteY, e.absoluteX);

        ctx.startY = y;
        startY.value = y;
        currentY.value = y;
        gestureState.value = e.state;
      }
    },
    onActive: (e, ctx) => {
      if (state.value !== ReorderableListState.RELEASING) {
        currentY.value = ctx.startY + e.translationY;
        gestureState.value = e.state;
      }
    },
    onEnd: (e) => (gestureState.value = e.state),
    onFinish: (e) => (gestureState.value = e.state),
    onCancel: (e) => (gestureState.value = e.state),
    onFail: (e) => (gestureState.value = e.state),
  });

  useEffect(() => {
    if (!dragged) {
      runOnUI(() => {
        'worklet';

        state.value = ReorderableListState.IDLE;
      })();
    }
  }, [dragged, state, enabledOpacity]);

  useEffect(() => {
    runOnUI(() => {
      'worklet';

      // enable opacity after dragged item is rendered
      // to avoid flickering effect (if it's done before the item becomes transparent
      // and then the dragged item is rendered on top and so it flickers)
      enabledOpacity.value = dragged;

      if (dragged) {
        draggedItemScale.value = withTiming(dragScale, {
          duration: 100,
          easing: Easing.out(Easing.ease),
        });
      }
    })();
  }, [dragged, draggedItemScale, enabledOpacity, dragScale]);

  const enableDragged = useCallback(
    (enabled: boolean) => {
      flatList.current.setNativeProps({scrollEnabled: !enabled});
      setDragged(enabled);
    },
    [setDragged, flatList],
  );

  const reorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex !== toIndex) {
      unstable_batchedUpdates(() => {
        onReorder({fromIndex, toIndex});
        enableDragged(false);
      });
    } else {
      enableDragged(false);
    }
  };

  const endDrag = () => {
    'worklet';

    const draggedIndexTemp = draggedIndex.value;
    const currentIndexTemp = currentIndex.value;

    draggedIndex.value = -1;
    currentIndex.value = -1;

    // if opacity is disabled after render (on effect), the absolute dragged item is
    // removed while the dragged item in the list is still transparent and so it flickers, so
    // we need to disabled it before removing the dragged item to avoid flickering
    enabledOpacity.value = false;

    // avoid element shifted at the new position
    // to be rendered as dragged item on reorder re-render
    draggedInfoIndex.value = currentIndexTemp;

    runOnJS(reorder)(draggedIndexTemp, currentIndexTemp);
  };

  const getIndexFromY = (y: number, scrollY?: number) => {
    'worklet';

    const maxOffset = itemOffsets[itemOffsets.length - 1].value;
    const relativeY = Math.max(
      0,
      Math.min(
        (scrollY || scrollOffset.value) + y,
        maxOffset.offset + maxOffset.length,
      ),
    );

    const index = itemOffsets.findIndex(
      (x, i) =>
        (x?.value.offset && i === 0 && relativeY < x.value.offset) ||
        (i === itemOffsets.length - 1 && relativeY > x.value.offset) ||
        (relativeY >= x.value.offset &&
          relativeY <= x.value.offset + x.value.length),
    );

    return {index, relativeY};
  };

  useAnimatedReaction(
    () => gestureState.value,
    () => {
      if (
        gestureState.value !== State.ACTIVE &&
        gestureState.value !== State.BEGAN &&
        (state.value === ReorderableListState.DRAGGING ||
          state.value === ReorderableListState.AUTO_SCROLL)
      ) {
        state.value = ReorderableListState.RELEASING;

        // if items have different heights and the dragged item is moved forward
        // then its new offset position needs to be adjusted
        const offsetCorrection =
          currentIndex.value > draggedIndex.value
            ? itemOffsets[currentIndex.value].value.length -
              itemOffsets[draggedIndex.value].value.length
            : 0;
        const newTopPosition =
          itemOffsets[currentIndex.value].value.offset +
          offsetCorrection -
          scrollOffset.value;

        const duration = 100;
        draggedItemScale.value = withTiming(
          1,
          {
            duration,
            easing: Easing.out(Easing.ease),
          },
          () => {
            if (draggedTranslateY.value === newTopPosition) {
              endDrag();
            }
          },
        );

        if (draggedTranslateY.value !== newTopPosition) {
          // animate dragged item to its new position on release
          draggedTranslateY.value = withTiming(
            newTopPosition,
            {
              duration,
              easing: Easing.out(Easing.ease),
            },
            () => {
              endDrag();
            },
          );
        }
      }
    },
  );

  useAnimatedReaction(
    () => currentY.value,
    (y) => {
      if (
        state.value === ReorderableListState.DRAGGING ||
        state.value === ReorderableListState.AUTO_SCROLL
      ) {
        draggedTranslateY.value = y - offsetY.value;

        const {index} = getIndexFromY(y);
        currentIndex.value = index;

        if (y <= topMoveThreshold.value || y >= bottomMoveThreshold.value) {
          state.value = ReorderableListState.AUTO_SCROLL;
          autoScrollOffset.value = scrollOffset.value;
        } else {
          state.value = ReorderableListState.DRAGGING;
          autoScrollOffset.value = -1;
        }
      }
    },
  );

  useAnimatedReaction(
    () => autoScrollOffset.value,
    () => {
      if (state.value === ReorderableListState.AUTO_SCROLL) {
        let speed = 0;
        if (currentY.value <= topMoveThreshold.value) {
          speed = -autoScrollSpeed.value;
        } else if (currentY.value >= bottomMoveThreshold.value) {
          speed = autoScrollSpeed.value;
        }

        if (speed !== 0) {
          scrollTo(flatList, 0, autoScrollOffset.value + speed, true);
          autoScrollOffset.value += speed;
        }

        // when autoscrolling user may not be moving his finger so we need
        // to update the current position of the dragged item here
        const {index} = getIndexFromY(currentY.value, autoScrollOffset.value);
        currentIndex.value = index;
      }
    },
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollOffset.value = e.contentOffset.y;
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleItemLayout = useCallback(
    memoize((index: number) => (e: LayoutChangeEvent) => {
      itemOffsets[index].value = {
        offset: e.nativeEvent.layout.y,
        length: e.nativeEvent.layout.height,
      };
    }),
    [itemOffsets],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const drag = useCallback(
    memoize(
      (index: number) => () =>
        runOnUI(() => {
          'worklet';

          offsetY.value =
            startY.value -
            (itemOffsets[index].value.offset - scrollOffset.value);
          draggedTranslateY.value = startY.value - offsetY.value;
          draggedIndex.value = index;
          draggedInfoIndex.value = index;
          currentIndex.value = index;
          state.value = ReorderableListState.DRAGGING;

          runOnJS(enableDragged)(true);
        })(),
    ),
    [
      offsetY,
      startY,
      scrollOffset,
      draggedTranslateY,
      draggedIndex,
      draggedInfoIndex,
      currentIndex,
      state,
      itemOffsets,
      enableDragged,
    ],
  );

  const renderAnimatedCell = useCallback(
    ({index, children, ...cellProps}: CellProps<T>) => (
      <ReorderableListItem
        // forces remount of components with key change
        key={
          cellProps.keyExtractor
            ? cellProps.keyExtractor(cellProps.data[index], index)
            : index
        }
        index={index}
        currentIndex={currentIndex}
        draggedIndex={draggedIndex}
        itemOffsets={itemOffsets}
        enabledOpacity={enabledOpacity}
        onLayout={handleItemLayout(index)}>
        {children}
      </ReorderableListItem>
    ),
    [currentIndex, draggedIndex, itemOffsets, enabledOpacity, handleItemLayout],
  );

  const renderDraggableItem = useCallback(
    (info: ListRenderItemInfo<T>) => {
      itemSeparators.current[info.index] = info.separators;
      return renderItem({...info, drag: drag(info.index)});
    },
    [renderItem, drag],
  );

  const handleContainerLayout = () => {
    container.current.measureInWindow((x: number, y: number) => {
      containerPositionX.value = x;
      containerPositionY.value = y;
    });
  };

  const handleFlatListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const {height} = e.nativeEvent.layout;
      const portion = height * Math.max(0, Math.min(scrollAreaSize, 0.5));

      topMoveThreshold.value = portion;
      bottomMoveThreshold.value = height - portion;

      flatListHeight.value = height;

      if (onLayout) {
        onLayout(e);
      }
    },
    [
      bottomMoveThreshold,
      topMoveThreshold,
      flatListHeight,
      onLayout,
      scrollAreaSize,
    ],
  );

  const draggedItemStyle = useAnimatedStyle(() => {
    // TODO: remove this condition when this bug is fixed
    // https://github.com/software-mansion/react-native-reanimated/issues/2019
    if (draggedTranslateY.value !== null) {
      return {
        transform: [
          {translateY: draggedTranslateY.value},
          {scale: draggedItemScale.value},
        ],
      };
    }

    return {};
  });

  const draggedItemInfo = {
    index: draggedInfoIndex.value,
    item: data[draggedInfoIndex.value],
    separators: itemSeparators.current[draggedInfoIndex.value],
    isDragged: true,
  };

  // TODO: remove when this bug is fixed
  // https://github.com/software-mansion/react-native-reanimated/issues/2019
  // fallback when animated style is empty
  const draggedItemFallbackStyle = {
    transform: itemOffsets[draggedInfoIndex.value]
      ? [
          {
            translateY:
              itemOffsets[draggedInfoIndex.value].value.offset -
              scrollOffset.value,
          },
        ]
      : undefined,
  };

  return (
    <PanGestureHandler
      maxPointers={1}
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleGestureEvent}
      simultaneousHandlers={nativeHandler}>
      <Animated.View
        ref={container}
        style={containerStyle}
        onLayout={handleContainerLayout}>
        <NativeViewGestureHandler ref={nativeHandler}>
          <AnimatedFlatList
            {...rest}
            ref={composeRefs(flatList, ref)}
            data={data}
            CellRendererComponent={renderAnimatedCell}
            renderItem={renderDraggableItem}
            onLayout={handleFlatListLayout}
            onScroll={scrollHandler}
            keyExtractor={keyExtractor}
            scrollEventThrottle={1}
            horizontal={false}
            numColumns={1}
          />
        </NativeViewGestureHandler>
        {dragged && (
          <Animated.View
            style={[
              styles.draggedItem,
              draggedItemFallbackStyle,
              draggedItemStyle,
            ]}>
            {renderItem(draggedItemInfo)}
          </Animated.View>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = {
  draggedItem: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  } as ViewStyle,
  dragged: {
    opacity: 0,
  },
};

export default React.memo(React.forwardRef(ReorderableList)) as <T>(
  props: ReorderableListProps<T> & {ref?: React.ForwardedRef<FlatListProps<T>>},
) => React.ReactElement;
