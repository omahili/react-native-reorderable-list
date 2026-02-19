"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReorderableListCore = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
var _contexts = require("../contexts");
var _types = require("../types");
var _constants = require("./constants");
var _ReorderableListCell = require("./ReorderableListCell");
var _hooks = require("../hooks");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const AnimatedFlatList = _reactNativeReanimated.default.createAnimatedComponent(_reactNative.FlatList);
const ReorderableListCore = ({
  autoscrollThreshold = 0.1,
  autoscrollThresholdOffset,
  autoscrollSpeedScale = 1,
  autoscrollDelay = _constants.AUTOSCROLL_CONFIG.delay,
  autoscrollActivationDelta = 5,
  animationDuration = 200,
  onLayout,
  onReorder,
  onScroll,
  onDragStart,
  onDragEnd,
  onIndexChange,
  scrollViewContainerRef,
  scrollViewPageXY,
  scrollViewSize,
  scrollViewScrollOffsetXY,
  scrollViewScrollEnabledProp,
  setScrollViewForceDisableScroll,
  scrollable,
  outerScrollGesture,
  cellAnimations,
  dragEnabled = true,
  shouldUpdateActiveItem,
  itemLayoutAnimation,
  panGesture,
  panEnabled = true,
  panActivateAfterLongPress,
  renderDropIndicator,
  data,
  keyExtractor,
  ...rest
}, ref) => {
  const scrollEnabled = rest.scrollEnabled ?? true;
  const flatListRef = (0, _reactNativeReanimated.useAnimatedRef)();
  const markedCellsRef = (0, _react.useRef)();
  const webScrollableNodeStyleRef = (0, _react.useRef)(null);
  const [activeIndex, setActiveIndex] = (0, _react.useState)(-1);
  const prevItemCount = (0, _react.useRef)(data.length);
  const [forceDisableScroll, setForceDisableScroll] = (0, _react.useState)(false);
  const scrollEnabledProp = (0, _hooks.usePropAsSharedValue)(scrollEnabled);
  const currentScrollEnabled = (0, _reactNativeReanimated.useSharedValue)(scrollEnabled);
  const gestureState = (0, _reactNativeReanimated.useSharedValue)(_reactNativeGestureHandler.State.UNDETERMINED);
  const currentXY = (0, _reactNativeReanimated.useSharedValue)(0);
  const currentTranslationXY = (0, _reactNativeReanimated.useSharedValue)(0);
  const currentItemDragCenterXY = (0, _reactNativeReanimated.useSharedValue)(null);
  const startItemDragCenterXY = (0, _reactNativeReanimated.useSharedValue)(0);
  const flatListScrollOffsetXY = (0, _reactNativeReanimated.useSharedValue)(0);
  const flatListSize = (0, _reactNativeReanimated.useSharedValue)(0);
  const flatListPageXY = (0, _reactNativeReanimated.useSharedValue)(0);
  // The scroll x or y translation of the list since drag start
  const dragScrollTranslationXY = (0, _reactNativeReanimated.useSharedValue)(0);
  // The initial scroll offset x or y of the list on drag start
  const dragInitialScrollOffsetXY = (0, _reactNativeReanimated.useSharedValue)(0);
  // The scroll x or y translation of the ScrollViewContainer since drag start
  const scrollViewDragScrollTranslationXY = (0, _reactNativeReanimated.useSharedValue)(0);
  // The initial scroll offset x or y of the ScrollViewContainer on drag start
  const scrollViewDragInitialScrollOffsetXY = (0, _reactNativeReanimated.useSharedValue)(0);
  const draggedSize = (0, _reactNativeReanimated.useSharedValue)(0);
  const itemOffset = (0, _reactNativeReanimated.useSharedValue)([]);
  const itemSize = (0, _reactNativeReanimated.useSharedValue)([]);
  // We need to track data length since itemOffset and itemSize might contain more data than we need.
  // e.g. items are removed from the list, in which case layout data for those items is set to 0.
  const itemCount = (0, _reactNativeReanimated.useSharedValue)(data.length);
  const autoscrollTrigger = (0, _reactNativeReanimated.useSharedValue)(-1);
  const lastAutoscrollTrigger = (0, _reactNativeReanimated.useSharedValue)(-1);
  const dragXY = (0, _reactNativeReanimated.useSharedValue)(0);
  const currentIndex = (0, _reactNativeReanimated.useSharedValue)(-1);
  const draggedIndex = (0, _reactNativeReanimated.useSharedValue)(-1);
  const state = (0, _reactNativeReanimated.useSharedValue)(_types.ReorderableListState.IDLE);
  const dragEndHandlers = (0, _reactNativeReanimated.useSharedValue)([]);
  const startXY = (0, _reactNativeReanimated.useSharedValue)(0);
  const scaleDefault = (0, _reactNativeReanimated.useSharedValue)(1);
  const opacityDefault = (0, _reactNativeReanimated.useSharedValue)(1);
  const dragDirection = (0, _reactNativeReanimated.useSharedValue)(0);
  const lastDragDirectionPivot = (0, _reactNativeReanimated.useSharedValue)(null);
  const dropIndicatorTranslationXY = (0, _reactNativeReanimated.useSharedValue)(0);
  const itemLayoutAnimationPropRef = (0, _react.useRef)(itemLayoutAnimation);
  itemLayoutAnimationPropRef.current = itemLayoutAnimation;
  const keyExtractorPropRef = (0, _react.useRef)(keyExtractor);
  keyExtractorPropRef.current = keyExtractor;
  const animationDurationProp = (0, _hooks.usePropAsSharedValue)(animationDuration);
  const autoscrollActivationDeltaProp = (0, _hooks.usePropAsSharedValue)(autoscrollActivationDelta);
  const dragEnabledProp = (0, _hooks.usePropAsSharedValue)(dragEnabled ?? true);
  const horizontalProp = (0, _hooks.usePropAsSharedValue)(!!rest.horizontal);

  // Position of the list relative to the scroll container
  const nestedFlatListPositionXY = (0, _reactNativeReanimated.useDerivedValue)(() => flatListPageXY.value - ((scrollViewPageXY === null || scrollViewPageXY === void 0 ? void 0 : scrollViewPageXY.value) || 0));
  (0, _react.useEffect)(() => {
    itemCount.value = data.length;

    // This could be done unmount of the removed cell, however it leads to bugs.
    // Surprisingly the unmount gets sometimes called after the onLayout event
    // setting all layout data to 0 and breaking the list. So we solve it like this.
    if (data.length < prevItemCount.current) {
      for (let i = data.length; i < prevItemCount.current; i++) {
        (0, _reactNativeReanimated.runOnUI)(() => {
          itemSize.value[i] = 0;
          itemOffset.value[i] = 0;
        })();
      }
    }
    prevItemCount.current = data.length;
  }, [data.length, itemSize, itemOffset, itemCount]);
  (0, _react.useEffect)(() => {
    if (!markedCellsRef.current ||
    // Clean keys once they surpass by 10% the size of the list itself.
    markedCellsRef.current.size <= data.length + Math.ceil(data.length * 0.1)) {
      return;
    }

    // Can be heavy to loop through all items, defer the task to run after interactions.
    const task = _reactNative.InteractionManager.runAfterInteractions(() => {
      if (!markedCellsRef.current) {
        return;
      }
      const map = new Map();
      for (let i = 0; i < data.length; i++) {
        var _keyExtractorPropRef$;
        const key = ((_keyExtractorPropRef$ = keyExtractorPropRef.current) === null || _keyExtractorPropRef$ === void 0 ? void 0 : _keyExtractorPropRef$.call(keyExtractorPropRef, data[i], i)) || i.toString();
        if (markedCellsRef.current.has(key)) {
          map.set(key, markedCellsRef.current.get(key));
        }
      }
      markedCellsRef.current = map;
    });
    return () => {
      task.cancel();
    };
  }, [data]);
  const createCellKey = (0, _react.useCallback)(cellKey => {
    var _markedCellsRef$curre;
    const mark = ((_markedCellsRef$curre = markedCellsRef.current) === null || _markedCellsRef$curre === void 0 ? void 0 : _markedCellsRef$curre.get(cellKey)) || 0;
    return `${cellKey}#${mark}`;
  }, []);
  const listContextValue = (0, _react.useMemo)(() => ({
    draggedSize,
    currentIndex,
    draggedIndex,
    dragEndHandlers,
    activeIndex,
    dropIndicatorTranslationXY,
    itemLayoutAnimation: itemLayoutAnimationPropRef,
    horizontal: horizontalProp,
    cellAnimations: {
      ...cellAnimations,
      transform: cellAnimations && 'transform' in cellAnimations ? cellAnimations.transform : [{
        scale: scaleDefault
      }],
      opacity: cellAnimations && 'opacity' in cellAnimations ? cellAnimations.opacity : opacityDefault
    }
  }), [draggedSize, currentIndex, dropIndicatorTranslationXY, draggedIndex, dragEndHandlers, activeIndex, cellAnimations, itemLayoutAnimationPropRef, scaleDefault, opacityDefault, horizontalProp]);

  /**
   * Decides the intended drag direction of the user.
   * This is used to to determine if the user intends to autoscroll
   * when within the threshold area.
   *
   * @param e - The payload of the pan gesture update event.
   */
  const setDragDirection = (0, _react.useCallback)(e => {
    'worklet';

    const absoluteXY = horizontalProp.value ? e.absoluteX : e.absoluteY;
    const velocityXY = horizontalProp.value ? e.velocityX : e.velocityY;
    const direction = velocityXY > 0 ? 1 : -1;
    if (direction !== dragDirection.value) {
      if (lastDragDirectionPivot.value === null) {
        lastDragDirectionPivot.value = absoluteXY;
      } else if (Math.abs(absoluteXY - lastDragDirectionPivot.value) >= autoscrollActivationDeltaProp.value) {
        dragDirection.value = direction;
        lastDragDirectionPivot.value = absoluteXY;
      }
    }
  }, [dragDirection, lastDragDirectionPivot, autoscrollActivationDeltaProp, horizontalProp]);
  const setCurrentItemDragCenterXY = (0, _react.useCallback)(e => {
    'worklet';

    const translationXY = horizontalProp.value ? e.translationX : e.translationY;
    if (currentItemDragCenterXY.value === null) {
      if (currentIndex.value >= 0) {
        const itemCenter = itemSize.value[currentIndex.value] * 0.5;
        // the x or y coordinate of the item relative to the list
        const itemXY = itemOffset.value[currentIndex.value] - (flatListScrollOffsetXY.value + scrollViewDragScrollTranslationXY.value);
        const value = itemXY + itemCenter + translationXY;
        startItemDragCenterXY.value = value;
        currentItemDragCenterXY.value = value;
      }
    } else {
      currentItemDragCenterXY.value = startItemDragCenterXY.value + translationXY;
    }
  }, [horizontalProp, currentItemDragCenterXY, currentIndex, startItemDragCenterXY, itemOffset, itemSize, flatListScrollOffsetXY, scrollViewDragScrollTranslationXY]);
  const panGestureHandler = (0, _react.useMemo)(() => (panGesture || _reactNativeGestureHandler.Gesture.Pan()).onBegin(e => {
    'worklet';

    // prevent new dragging until item is completely released
    if (state.value === _types.ReorderableListState.IDLE) {
      const xy = horizontalProp.value ? e.x : e.y;
      const translationXY = horizontalProp.value ? e.translationX : e.translationY;
      startXY.value = xy;
      currentXY.value = xy;
      currentTranslationXY.value = translationXY;
      dragXY.value = translationXY;
      gestureState.value = e.state;
    }
  }).onUpdate(e => {
    'worklet';

    if (state.value === _types.ReorderableListState.DRAGGED) {
      setDragDirection(e);
    }
    if (state.value !== _types.ReorderableListState.RELEASED) {
      setCurrentItemDragCenterXY(e);
      const translationXY = horizontalProp.value ? e.translationX : e.translationY;
      currentXY.value = startXY.value + translationXY;
      currentTranslationXY.value = translationXY;
      dragXY.value = translationXY + dragScrollTranslationXY.value + scrollViewDragScrollTranslationXY.value;
      gestureState.value = e.state;
    }
  }).onEnd(e => {
    'worklet';

    gestureState.value = e.state;
  }).onFinalize(e => {
    'worklet';

    gestureState.value = e.state;
  }), [panGesture, state, startXY, currentXY, currentTranslationXY, dragXY, gestureState, dragScrollTranslationXY, scrollViewDragScrollTranslationXY, setDragDirection, setCurrentItemDragCenterXY, horizontalProp]);
  const panGestureHandlerWithPropOptions = (0, _react.useMemo)(() => {
    if (typeof panActivateAfterLongPress === 'number') {
      panGestureHandler.activateAfterLongPress(panActivateAfterLongPress);
    }
    if (!panEnabled) {
      panGestureHandler.enabled(panEnabled);
    }
    return panGestureHandler;
  }, [panActivateAfterLongPress, panEnabled, panGestureHandler]);
  const isWebTouchDevice = (0, _react.useMemo)(() => {
    if (_reactNative.Platform.OS !== 'web') {
      return false;
    }

    // @ts-expect-error
    if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) {
      return true;
    }

    // @ts-expect-error
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      // @ts-expect-error
      return window.matchMedia('(pointer: coarse)').matches;
    }
    return false;
  }, []);
  const gestureHandler = (0, _react.useMemo)(() => {
    if (isWebTouchDevice) {
      return panGestureHandlerWithPropOptions;
    }
    return _reactNativeGestureHandler.Gesture.Simultaneous(_reactNativeGestureHandler.Gesture.Native(), panGestureHandlerWithPropOptions);
  }, [isWebTouchDevice, panGestureHandlerWithPropOptions]);
  const setScrollEnabled = (0, _react.useCallback)(enabled => {
    currentScrollEnabled.value = enabled;

    // IMPORTANT:
    // On web setNativeProps API is not available, so disabling scroll is controlled by a state.
    // On Android/iOS we can keep using setNativeProps which performs better and doesn't require re-renders.
    if (_reactNative.Platform.OS === 'web') {
      try {
        var _flatListRef$current, _flatListRef$current$;
        const scrollableNode = (_flatListRef$current = flatListRef.current) === null || _flatListRef$current === void 0 || (_flatListRef$current$ = _flatListRef$current.getScrollableNode) === null || _flatListRef$current$ === void 0 ? void 0 : _flatListRef$current$.call(_flatListRef$current);
        const hasStyle = scrollableNode && typeof scrollableNode === 'object' && 'style' in scrollableNode;
        if (hasStyle) {
          const {
            style
          } = scrollableNode;
          if (!enabled) {
            if (!webScrollableNodeStyleRef.current) {
              webScrollableNodeStyleRef.current = {
                overflow: style.overflow || '',
                overflowX: style.overflowX || '',
                overflowY: style.overflowY || '',
                touchAction: style.touchAction || ''
              };
            }
            style.overflow = 'hidden';
            style.overflowX = 'hidden';
            style.overflowY = 'hidden';
            style.touchAction = 'none';
          } else if (webScrollableNodeStyleRef.current) {
            style.overflow = webScrollableNodeStyleRef.current.overflow;
            style.overflowX = webScrollableNodeStyleRef.current.overflowX;
            style.overflowY = webScrollableNodeStyleRef.current.overflowY;
            style.touchAction = webScrollableNodeStyleRef.current.touchAction;
            webScrollableNodeStyleRef.current = null;
          } else {
            style.overflow = '';
            style.overflowX = '';
            style.overflowY = '';
            style.touchAction = '';
          }
        }
      } catch (_) {
        // Keep state-based fallback if DOM manipulation fails.
      }
      setForceDisableScroll(!enabled);
      if (setScrollViewForceDisableScroll) {
        setScrollViewForceDisableScroll(!enabled);
      }
    } else {
      if (!enabled || scrollEnabledProp.value) {
        var _flatListRef$current2;
        // We disable the scroll or when re-enabling the scroll of the container we set it back to the current prop value.
        (_flatListRef$current2 = flatListRef.current) === null || _flatListRef$current2 === void 0 || _flatListRef$current2.setNativeProps({
          scrollEnabled: enabled
        });
      }
      if (!enabled || scrollViewScrollEnabledProp !== null && scrollViewScrollEnabledProp !== void 0 && scrollViewScrollEnabledProp.value) {
        var _scrollViewContainerR;
        // We disable the scroll or when re-enabling the scroll of the container we set it back to the current prop value.
        scrollViewContainerRef === null || scrollViewContainerRef === void 0 || (_scrollViewContainerR = scrollViewContainerRef.current) === null || _scrollViewContainerR === void 0 || _scrollViewContainerR.setNativeProps({
          scrollEnabled: enabled
        });
      }
    }
  }, [currentScrollEnabled, flatListRef, scrollEnabledProp, scrollViewContainerRef, scrollViewScrollEnabledProp, setScrollViewForceDisableScroll]);
  const resetSharedValues = (0, _react.useCallback)(() => {
    'worklet';

    state.value = _types.ReorderableListState.IDLE;
    draggedIndex.value = -1;
    dragXY.value = 0;
    dragScrollTranslationXY.value = 0;
    scrollViewDragScrollTranslationXY.value = 0;
    dragDirection.value = 0;
    lastDragDirectionPivot.value = null;
    currentItemDragCenterXY.value = null;
  }, [state, draggedIndex, dragXY, dragScrollTranslationXY, scrollViewDragScrollTranslationXY, dragDirection, lastDragDirectionPivot, currentItemDragCenterXY]);
  const resetSharedValuesAfterAnimations = (0, _react.useCallback)(() => {
    setTimeout((0, _reactNativeReanimated.runOnUI)(resetSharedValues), animationDurationProp.value);
  }, [resetSharedValues, animationDurationProp]);
  const markCells = (fromIndex, toIndex) => {
    if (!markedCellsRef.current) {
      markedCellsRef.current = new Map();
    }
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    for (let i = start; i <= end; i++) {
      var _keyExtractorPropRef$2;
      const cellKey = ((_keyExtractorPropRef$2 = keyExtractorPropRef.current) === null || _keyExtractorPropRef$2 === void 0 ? void 0 : _keyExtractorPropRef$2.call(keyExtractorPropRef, data[i], i)) || i.toString();
      if (!markedCellsRef.current.has(cellKey)) {
        markedCellsRef.current.set(cellKey, 1);
      } else {
        markedCellsRef.current.delete(cellKey);
      }
    }
  };
  const reorder = (fromIndex, toIndex) => {
    (0, _reactNativeReanimated.runOnUI)(resetSharedValues)();
    if (fromIndex !== toIndex) {
      markCells(fromIndex, toIndex);
      onReorder({
        from: fromIndex,
        to: toIndex
      });
    }
  };
  const recomputeLayout = (0, _react.useCallback)((from, to) => {
    'worklet';

    const itemDirection = to > from;
    const index1 = itemDirection ? from : to;
    const index2 = itemDirection ? to : from;
    const newOffset1 = itemOffset.value[index1];
    const newSize1 = itemSize.value[index2];
    const newOffset2 = itemOffset.value[index2] + itemSize.value[index2] - itemSize.value[index1];
    const newSize2 = itemSize.value[index1];
    itemOffset.value[index1] = newOffset1;
    itemSize.value[index1] = newSize1;
    itemOffset.value[index2] = newOffset2;
    itemSize.value[index2] = newSize2;
  }, [itemOffset, itemSize]);

  /**
   * Computes a potential new drop container for the current dragged item and evaluates
   * whether the dragged item center is nearer to the center of the current container or the new one.
   *
   * @returns The new index if the center of the dragged item is closer to the center of
   * the new drop container or the current index if closer to the current drop container.
   */
  const computeCurrentIndex = (0, _react.useCallback)(() => {
    'worklet';

    if (currentItemDragCenterXY.value === null) {
      return currentIndex.value;
    }

    // Apply scroll offset and scroll container translation.
    const relativeDragCenterXY = flatListScrollOffsetXY.value + scrollViewDragScrollTranslationXY.value + currentItemDragCenterXY.value;
    const currentOffset = itemOffset.value[currentIndex.value];
    const currentSize = itemSize.value[currentIndex.value];
    const currentCenter = currentOffset + currentSize * 0.5;
    const max = itemCount.value;
    const possibleIndex = relativeDragCenterXY < currentCenter ? Math.max(0, currentIndex.value - 1) : Math.min(max - 1, currentIndex.value + 1);
    if (currentIndex.value !== possibleIndex) {
      let possibleOffset = itemOffset.value[possibleIndex];
      if (possibleIndex > currentIndex.value) {
        possibleOffset += itemSize.value[possibleIndex] - currentSize;
      }
      const possibleCenter = possibleOffset + currentSize * 0.5;
      const distanceFromCurrent = Math.abs(relativeDragCenterXY - currentCenter);
      const distanceFromPossible = Math.abs(relativeDragCenterXY - possibleCenter);
      return distanceFromCurrent <= distanceFromPossible ? currentIndex.value : possibleIndex;
    }
    return currentIndex.value;
  }, [currentIndex, currentItemDragCenterXY, itemCount, itemOffset, itemSize, flatListScrollOffsetXY, scrollViewDragScrollTranslationXY]);
  const setCurrentIndex = (0, _react.useCallback)(() => {
    'worklet';

    const newIndex = computeCurrentIndex();
    if (currentIndex.value !== newIndex) {
      recomputeLayout(currentIndex.value, newIndex);
      currentIndex.value = newIndex;
      // After recomputing the layout we can update the drop indicator translation,
      // it now matches the offset for the new index.
      dropIndicatorTranslationXY.value = itemOffset.value[newIndex];
      onIndexChange === null || onIndexChange === void 0 || onIndexChange({
        index: newIndex
      });
    }
  }, [currentIndex, dropIndicatorTranslationXY, itemOffset, computeCurrentIndex, recomputeLayout, onIndexChange]);
  const runDefaultDragAnimations = (0, _react.useCallback)(type => {
    'worklet';

    // if no custom scale run default
    if (!(cellAnimations && 'transform' in cellAnimations)) {
      const scaleConfig = _constants.SCALE_ANIMATION_CONFIG_DEFAULT[type];
      scaleDefault.value = (0, _reactNativeReanimated.withTiming)(scaleConfig.toValue, scaleConfig);
    }

    // If no custom opacity run the default.
    if (!(cellAnimations && 'opacity' in cellAnimations)) {
      const opacityConfig = _constants.OPACITY_ANIMATION_CONFIG_DEFAULT[type];
      opacityDefault.value = (0, _reactNativeReanimated.withTiming)(opacityConfig.toValue, opacityConfig);
    }
  }, [cellAnimations, scaleDefault, opacityDefault]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => gestureState.value, () => {
    if (gestureState.value !== _reactNativeGestureHandler.State.ACTIVE && gestureState.value !== _reactNativeGestureHandler.State.BEGAN && (state.value === _types.ReorderableListState.DRAGGED || state.value === _types.ReorderableListState.AUTOSCROLL)) {
      state.value = _types.ReorderableListState.RELEASED;

      // enable back scroll on releasing
      (0, _reactNativeReanimated.runOnJS)(setScrollEnabled)(true);
      if (shouldUpdateActiveItem) {
        (0, _reactNativeReanimated.runOnJS)(setActiveIndex)(-1);
      }

      // Trigger onDragEnd event.
      let e = {
        from: draggedIndex.value,
        to: currentIndex.value
      };
      onDragEnd === null || onDragEnd === void 0 || onDragEnd(e);
      const handlers = dragEndHandlers.value[draggedIndex.value];
      if (Array.isArray(handlers)) {
        handlers.forEach(fn => fn(e.from, e.to));
      }

      // they are actually swapped on drag translation
      const currentItemOffset = itemOffset.value[draggedIndex.value];
      const currentItemSize = itemSize.value[draggedIndex.value];
      const draggedItemOffset = itemOffset.value[currentIndex.value];
      const draggedItemSize = itemSize.value[currentIndex.value];
      const newPositionXY = currentIndex.value > draggedIndex.value ? draggedItemOffset - currentItemOffset : draggedItemOffset - currentItemOffset + (draggedItemSize - currentItemSize);
      runDefaultDragAnimations('end');
      if (dragXY.value !== newPositionXY) {
        // Animate dragged item to its new position on release.
        dragXY.value = (0, _reactNativeReanimated.withTiming)(newPositionXY, {
          duration: animationDurationProp.value,
          easing: _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.ease)
        }, () => {
          (0, _reactNativeReanimated.runOnJS)(reorder)(draggedIndex.value, currentIndex.value);
        });
      } else {
        // User might drag and release the item without moving it so,
        // since the animation end callback is not executed in that case
        // we need to reset values as the reorder function would do.
        (0, _reactNativeReanimated.runOnJS)(resetSharedValuesAfterAnimations)();
      }
    }
  });
  const computeHiddenArea = (0, _react.useCallback)(() => {
    'worklet';

    if (!scrollViewScrollOffsetXY || !scrollViewSize) {
      return {
        start: 0,
        end: 0
      };
    }

    // hidden area cannot be negative
    const start = Math.max(0, scrollViewScrollOffsetXY.value - nestedFlatListPositionXY.value);
    const end = Math.max(0, nestedFlatListPositionXY.value + flatListSize.value - (scrollViewScrollOffsetXY.value + scrollViewSize.value));
    return {
      start,
      end
    };
  }, [scrollViewScrollOffsetXY, scrollViewSize, nestedFlatListPositionXY, flatListSize]);
  const computeThresholdArea = (0, _react.useCallback)(() => {
    'worklet';

    const hiddenArea = computeHiddenArea();
    const offsetStart = Math.max(0, (autoscrollThresholdOffset === null || autoscrollThresholdOffset === void 0 ? void 0 : autoscrollThresholdOffset.start) || (autoscrollThresholdOffset === null || autoscrollThresholdOffset === void 0 ? void 0 : autoscrollThresholdOffset.top) || 0);
    const offsetEnd = Math.max(0, (autoscrollThresholdOffset === null || autoscrollThresholdOffset === void 0 ? void 0 : autoscrollThresholdOffset.end) || (autoscrollThresholdOffset === null || autoscrollThresholdOffset === void 0 ? void 0 : autoscrollThresholdOffset.bottom) || 0);
    const threshold = Math.max(0, Math.min(autoscrollThreshold, 0.4));
    const visibleSize = flatListSize.value - (hiddenArea.start + hiddenArea.end) - (offsetStart + offsetEnd);
    const area = visibleSize * threshold;
    const start = area + offsetStart;
    const end = flatListSize.value - area - offsetEnd;
    return {
      start,
      end
    };
  }, [computeHiddenArea, autoscrollThreshold, autoscrollThresholdOffset, flatListSize]);
  const computeContainerThresholdArea = (0, _react.useCallback)(() => {
    'worklet';

    if (!scrollViewSize) {
      return {
        start: -Infinity,
        end: Infinity
      };
    }
    const offsetStart = Math.max(0, (autoscrollThresholdOffset === null || autoscrollThresholdOffset === void 0 ? void 0 : autoscrollThresholdOffset.start) || (autoscrollThresholdOffset === null || autoscrollThresholdOffset === void 0 ? void 0 : autoscrollThresholdOffset.top) || 0);
    const offsetEnd = Math.max(0, (autoscrollThresholdOffset === null || autoscrollThresholdOffset === void 0 ? void 0 : autoscrollThresholdOffset.end) || (autoscrollThresholdOffset === null || autoscrollThresholdOffset === void 0 ? void 0 : autoscrollThresholdOffset.bottom) || 0);
    const threshold = Math.max(0, Math.min(autoscrollThreshold, 0.4));
    const visibleSize = scrollViewSize.value - (offsetStart + offsetEnd);
    const area = visibleSize * threshold;
    const start = area + offsetStart;
    const end = visibleSize - area - offsetEnd;
    return {
      start,
      end
    };
  }, [autoscrollThreshold, autoscrollThresholdOffset, scrollViewSize]);
  const shouldScrollContainer = (0, _react.useCallback)(y => {
    'worklet';

    const containerThresholdArea = computeContainerThresholdArea();
    const nestedListHiddenArea = computeHiddenArea();

    // We should scroll the container if there's a hidden part of the nested list.
    // We might have floating errors like 0.0001 which we should ignore.
    return nestedListHiddenArea.start > 0.01 && y <= containerThresholdArea.start || nestedListHiddenArea.end > 0.01 && y >= containerThresholdArea.end;
  }, [computeHiddenArea, computeContainerThresholdArea]);
  const getRelativeContainerXY = (0, _react.useCallback)(() => {
    'worklet';

    return currentXY.value + nestedFlatListPositionXY.value - scrollViewDragInitialScrollOffsetXY.value;
  }, [currentXY, nestedFlatListPositionXY, scrollViewDragInitialScrollOffsetXY]);
  const getRelativeListXY = (0, _react.useCallback)(() => {
    'worklet';

    return currentXY.value + scrollViewDragScrollTranslationXY.value;
  }, [currentXY, scrollViewDragScrollTranslationXY]);
  const scrollDirection = (0, _react.useCallback)(() => {
    'worklet';

    const relativeContainerXY = getRelativeContainerXY();
    if (shouldScrollContainer(relativeContainerXY)) {
      const containerThresholdArea = computeContainerThresholdArea();
      if (relativeContainerXY <= containerThresholdArea.start) {
        return -1;
      }
      if (relativeContainerXY >= containerThresholdArea.end) {
        return 1;
      }
    } else if (scrollable) {
      const relativeListXY = getRelativeListXY();
      const thresholdArea = computeThresholdArea();
      if (relativeListXY <= thresholdArea.start) {
        return -1;
      }
      if (relativeListXY >= thresholdArea.end) {
        return 1;
      }
    }
    return 0;
  }, [shouldScrollContainer, computeThresholdArea, computeContainerThresholdArea, getRelativeContainerXY, getRelativeListXY, scrollable]);
  (0, _reactNativeReanimated.useAnimatedReaction)(() => currentXY.value, () => {
    if (state.value === _types.ReorderableListState.DRAGGED || state.value === _types.ReorderableListState.AUTOSCROLL) {
      setCurrentIndex();

      // Trigger autoscroll when:
      // 1. Within the threshold area (start or end of list)
      // 2. Have dragged in the same direction as the scroll
      // 3. Not already in autoscroll mode
      if (dragDirection.value === scrollDirection()) {
        // When the first two conditions are met and it's already in autoscroll mode,
        // we let it continue (no-op).
        if (state.value !== _types.ReorderableListState.AUTOSCROLL) {
          state.value = _types.ReorderableListState.AUTOSCROLL;
          lastAutoscrollTrigger.value = autoscrollTrigger.value;
          autoscrollTrigger.value *= -1;
        }
      } else if (state.value === _types.ReorderableListState.AUTOSCROLL) {
        state.value = _types.ReorderableListState.DRAGGED;
      }
    }
  });
  (0, _reactNativeReanimated.useAnimatedReaction)(() => autoscrollTrigger.value, () => {
    if (autoscrollTrigger.value !== lastAutoscrollTrigger.value && state.value === _types.ReorderableListState.AUTOSCROLL) {
      const autoscrollIncrement = dragDirection.value * _constants.AUTOSCROLL_CONFIG.increment * autoscrollSpeedScale;
      if (autoscrollIncrement !== 0) {
        let scrollOffset = flatListScrollOffsetXY.value;
        let listRef = flatListRef;

        // Checking on every autoscroll whether to scroll the container,
        // this allows to smoothly pass the scroll from the container to the nested list
        // without any gesture input.
        if (scrollViewScrollOffsetXY && shouldScrollContainer(getRelativeContainerXY())) {
          scrollOffset = scrollViewScrollOffsetXY.value;
          listRef = scrollViewContainerRef;
        }
        const scrollToValue = scrollOffset + autoscrollIncrement;
        (0, _reactNativeReanimated.scrollTo)(listRef, horizontalProp.value ? scrollToValue : 0, horizontalProp.value ? 0 : scrollToValue, true);
      }

      // when autoscrolling user may not be moving his finger so we need
      // to update the current position of the dragged item here
      setCurrentIndex();
    }
  });

  // flatlist scroll handler
  const handleScroll = (0, _reactNativeReanimated.useAnimatedScrollHandler)(e => {
    flatListScrollOffsetXY.value = horizontalProp.value ? e.contentOffset.x : e.contentOffset.y;

    // Checking if the list is not scrollable instead of the scrolling state.
    // Fixes a bug on iOS where the item is shifted after autoscrolling and then
    // moving away from the area.
    if (!currentScrollEnabled.value) {
      dragScrollTranslationXY.value = flatListScrollOffsetXY.value - dragInitialScrollOffsetXY.value;
    }
    if (state.value === _types.ReorderableListState.AUTOSCROLL) {
      dragXY.value = currentTranslationXY.value + dragScrollTranslationXY.value + scrollViewDragScrollTranslationXY.value;
      lastAutoscrollTrigger.value = autoscrollTrigger.value;
      autoscrollTrigger.value = (0, _reactNativeReanimated.withDelay)(autoscrollDelay, (0, _reactNativeReanimated.withTiming)(autoscrollTrigger.value * -1, {
        duration: 0
      }));
    }
  });

  // container scroll handler
  (0, _reactNativeReanimated.useAnimatedReaction)(() => scrollViewScrollOffsetXY === null || scrollViewScrollOffsetXY === void 0 ? void 0 : scrollViewScrollOffsetXY.value, value => {
    if (value) {
      // Checking if the list is not scrollable instead of the scrolling state.
      // Fixes a bug on iOS where the item is shifted, after autoscrolling and then
      // moving away from the area.
      if (!currentScrollEnabled.value) {
        scrollViewDragScrollTranslationXY.value = value - scrollViewDragInitialScrollOffsetXY.value;
      }
      if (state.value === _types.ReorderableListState.AUTOSCROLL) {
        dragXY.value = currentTranslationXY.value + scrollViewDragScrollTranslationXY.value;
        lastAutoscrollTrigger.value = autoscrollTrigger.value;
        autoscrollTrigger.value = (0, _reactNativeReanimated.withDelay)(autoscrollDelay, (0, _reactNativeReanimated.withTiming)(autoscrollTrigger.value * -1, {
          duration: 0
        }));
      }
    }
  });
  const startDrag = (0, _react.useCallback)(index => {
    'worklet';

    if (!dragEnabledProp.value) {
      return;
    }

    // Allow new drag when item is completely released.
    if (state.value === _types.ReorderableListState.IDLE) {
      // Resetting shared values again fixes a flickeing bug in nested lists where
      // after scrolling the parent list it would offset the new dragged item in another nested list.
      resetSharedValues();
      if (shouldUpdateActiveItem) {
        (0, _reactNativeReanimated.runOnJS)(setActiveIndex)(index);
      }
      dragInitialScrollOffsetXY.value = flatListScrollOffsetXY.value;
      scrollViewDragInitialScrollOffsetXY.value = (scrollViewScrollOffsetXY === null || scrollViewScrollOffsetXY === void 0 ? void 0 : scrollViewScrollOffsetXY.value) || 0;
      draggedSize.value = itemSize.value[index];
      dropIndicatorTranslationXY.value = itemOffset.value[index];
      draggedIndex.value = index;
      currentIndex.value = index;
      state.value = _types.ReorderableListState.DRAGGED;
      (0, _reactNativeReanimated.runOnJS)(setScrollEnabled)(false);

      // run animation before onDragStart to avoid potentially waiting for it
      runDefaultDragAnimations('start');
      onDragStart === null || onDragStart === void 0 || onDragStart({
        index
      });
    }
  }, [dragEnabledProp, resetSharedValues, shouldUpdateActiveItem, dragInitialScrollOffsetXY, scrollViewScrollOffsetXY, scrollViewDragInitialScrollOffsetXY, setScrollEnabled, currentIndex, dropIndicatorTranslationXY, itemOffset, draggedSize, draggedIndex, state, flatListScrollOffsetXY, itemSize, onDragStart, runDefaultDragAnimations]);
  const handleFlatListLayout = (0, _react.useCallback)(e => {
    flatListSize.value = horizontalProp.value ? e.nativeEvent.layout.width : e.nativeEvent.layout.height;

    // If nested in a scroll container.
    if (scrollViewScrollOffsetXY) {
      // Timeout fixes a bug where measure returns width or height 0.
      setTimeout(() => {
        (0, _reactNativeReanimated.runOnUI)(() => {
          const measurement = (0, _reactNativeReanimated.measure)(flatListRef);
          if (!measurement) {
            return;
          }
          const pageXY = horizontalProp.value ? measurement.pageX : measurement.pageY;

          // We need to use pageY because the list might be nested into other views,
          // It's important that we take the measurement of the list without any scroll offset
          // from the scroll container.
          flatListPageXY.value = pageXY + ((scrollViewScrollOffsetXY === null || scrollViewScrollOffsetXY === void 0 ? void 0 : scrollViewScrollOffsetXY.value) || 0);
        })();
      }, 100);
    }
    onLayout === null || onLayout === void 0 || onLayout(e);
  }, [flatListRef, flatListPageXY, flatListSize, horizontalProp, scrollViewScrollOffsetXY, onLayout]);
  const handleRef = (0, _react.useCallback)(value => {
    flatListRef(value);
    if (typeof ref === 'function') {
      ref(value);
    } else if (ref) {
      ref.current = value;
    }
  }, [flatListRef, ref]);
  const combinedGesture = (0, _react.useMemo)(() => {
    // Android is able to handle nested scroll view, but not the full size ones like iOS.
    if (outerScrollGesture && !(_reactNative.Platform.OS === 'android' && scrollable)) {
      return _reactNativeGestureHandler.Gesture.Simultaneous(outerScrollGesture, gestureHandler);
    }
    return gestureHandler;
  }, [scrollable, outerScrollGesture, gestureHandler]);
  const composedScrollHandler = (0, _reactNativeReanimated.useComposedEventHandler)([handleScroll, onScroll || null]);
  const renderAnimatedCell = (0, _hooks.useStableCallback)(({
    cellKey,
    ...props
  }) => /*#__PURE__*/_react.default.createElement(_ReorderableListCell.ReorderableListCell, _extends({}, props, {
    // forces remount with key change on reorder
    key: createCellKey(cellKey),
    itemOffset: itemOffset,
    itemSize: itemSize,
    dragXY: dragXY,
    draggedIndex: draggedIndex,
    animationDuration: animationDurationProp,
    startDrag: startDrag,
    renderDropIndicator: renderDropIndicator
  })));
  return /*#__PURE__*/_react.default.createElement(_contexts.ReorderableListContext.Provider, {
    value: listContextValue
  }, /*#__PURE__*/_react.default.createElement(_reactNativeGestureHandler.GestureDetector, {
    gesture: combinedGesture
  }, /*#__PURE__*/_react.default.createElement(AnimatedFlatList, _extends({}, rest, {
    ref: handleRef,
    data: data,
    keyExtractor: keyExtractor,
    CellRendererComponent: renderAnimatedCell,
    onLayout: handleFlatListLayout,
    onScroll: composedScrollHandler,
    scrollEventThrottle: 1,
    removeClippedSubviews: false,
    numColumns: 1
    // We force disable scroll or let the component prop control it.
    ,
    scrollEnabled: forceDisableScroll ? false : scrollEnabled
  }))));
};
const MemoizedReorderableListCore = exports.ReorderableListCore = /*#__PURE__*/_react.default.memo(/*#__PURE__*/_react.default.forwardRef(ReorderableListCore));
//# sourceMappingURL=ReorderableListCore.js.map