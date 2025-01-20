[![NPM Downloads](https://img.shields.io/npm/dm/react-native-reorderable-list)](https://www.npmjs.com/package/react-native-reorderable-list)
[![GitHub License](https://img.shields.io/github/license/omahili/react-native-reorderable-list)](https://github.com/omahili/react-native-reorderable-list?tab=MIT-1-ov-file#readme)
[![NPM Version](https://img.shields.io/npm/v/react-native-reorderable-list)](https://www.npmjs.com/package/react-native-reorderable-list?activeTab=versions)
<br />
![iOS](https://img.shields.io/badge/platform-iOS-000.svg?logo=apple)
![Android](https://img.shields.io/badge/platform-Android-3ddc84.svg?logo=android)

# React Native Reorderable List

A reorderable list for React Native applications, powered by Reanimated 🚀

![Playlist](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3JpY200bHoxeDVneGV1YTUxaHIxaGNuNjQ3ZjRlZWZ1NmluYjFlZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/rk5aZKXYVMBktawoTr/giphy.gif)
![Example](https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzBhdWZoM3F4bGlnajB6NGdsbjA3MW54aHk5NGxkZnp3aXJrdDJ6ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/oJhSawgWA1OtR1IPgT/giphy.gif)

## Index

- [Install](#install)
- [Components](#components)
  - [ReorderableList](#reorderablelist)
  - [ScrollViewContainer](#scrollviewcontainer)
  - [NestedReorderableList](#nestedreorderablelist)
- [Hooks](#hooks)
  - [useReorderableDrag](#usereorderabledrag)
  - [useReorderableDragStart](#usereorderabledragstart)
  - [useReorderableDragEnd](#usereorderabledragend)
  - [useIsActive](#useisactive)
- [Utils](#utils)
- [Troubleshooting](#troubleshooting)
  - [RefreshControl](#refreshcontrol)
- [Example](#example)
- [License](#license)

## Install

> **NOTE**: This package follows [semantic versioning](https://semver.org/). Versions 0.X.0 are safe to use but may introduce breaking changes, as the public API is not considered stable yet.

Npm:

```bash
npm install --save react-native-reorderable-list
```

Yarn:

```bash
yarn add react-native-reorderable-list
```

Then you need to install these two peer dependencies:

- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated) >=3.12.0
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler) >=2.12.0

## Components

### ReorderableList

This component uses a [FlatList](https://reactnative.dev/docs/flatlist) and it extends its props:

| Props                     | Type                                                                                                                                                                          | Required | Default                    | Description                                                                                                                                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| autoscrollThreshold       | `number`                                                                                                                                                                      | No       | `0.1`                      | Threshold at the extremity of the list that triggers autoscroll when an item is dragged to it. A value of `0.1` means that 10% of the area at the top and 10% at the bottom will trigger autoscroll. Min value: `0`. Max value: `0.4`.                                                                        |
| autoscrollSpeedScale      | `number`                                                                                                                                                                      | No       | `1`                        | Scales the autoscroll speed at which the list scrolls when an item is dragged to the scroll areas.                                                                                                                                                                                                            |
| autoscrollDelay           | `number`                                                                                                                                                                      | No       | `0` (Android), `100` (iOS) | Delay in between autoscroll triggers. Can be used to tune the autoscroll smoothness. Default values differ between platforms: `0` for Android and `100` for iOS.                                                                                                                                              |
| dragReorderThreshold      | `number`                                                                                                                                                                      | No       | `0.2`                      | Specifies the fraction of an item's size at which it will shift when a dragged item crosses over it. For example, `0.2` means the item shifts when the dragged item passes 20% of its height (in a vertical list).                                                                                            |
| animationDuration         | `number`                                                                                                                                                                      | No       | `200`                      | Duration of the animations in milliseconds. Users won't be able to drag a new item until the dragged item is released and its animation to its new position ends.                                                                                                                                             |
| cellAnimations            | `{ scale: SharedValue<number> \| false, opacity: SharedValue<number> \| false }, shadow: { opacity : SharedValue<number>, color: string, radius: number, elevation: number }` | No       | N/A                        | Allows passing an object with shared values that can animate a cell by using the `onDragStart` and `onDragEnd` events. Set the property in the object to false to disable the animation. Check the [examples](https://github.com/omahili/react-native-reorderable-list/tree/master/example) for more details. |
| shouldUpdateActiveItem    | boolean                                                                                                                                                                       | No       | `false`                    | Whether the active item should be updated. Enables usage of `useIsActive` hook.                                                                                                                                                                                                                               |
| panEnabled                | `boolean`                                                                                                                                                                     | No       | `true`                     | Wether the pan gestures necessary for dragging are enabled.                                                                                                                                                                                                                                                   |
| panActivateAfterLongPress | `number`                                                                                                                                                                      | No       | N/A                        | Duration in milliseconds a the long press on the list before pan gestures, necessary for dragging, are allowed to activate.                                                                                                                                                                                   |
| onReorder                 | `(event: { from: number, to: number  }) => void`                                                                                                                              | Yes      | N/A                        | Event fired after an item is released and the list is reordered.                                                                                                                                                                                                                                              |
| onDragStart               | `(event: { index: number }) => void`                                                                                                                                          | No       | N/A                        | Event fired when an item is dragged. Needs to be a `worklet`. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.                                                                                                                                                     |
| onDragEnd                 | `(event: { from: number, to: number  }) => void`                                                                                                                              | No       | N/A                        | Event fired when the dragged item is released. Needs to be a `worklet`. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.                                                                                                                                           |
| onScroll                  | `ReturnType<typeof useAnimatedScrollHandler>`                                                                                                                                 | No       | N/A                        | An animated scroll handler created with useAnimatedScrollHandler. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info.                                                                                                                                                 |

The following props from FlatList are not supported:

- horizontal
- scrollEventThrottle
- removeClippedSubviews
- CellRendererComponent
- numColumns

### ScrollViewContainer

This component extends the [ScrollView](https://reactnative.dev/docs/scrollview) component and is used for nesting a [NestedReorderableList](#nestedreorderablelist) within a scrollable container:

| Props    | Type                                          | Required | Default | Description                                                                                                                                                   |
| -------- | --------------------------------------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| onScroll | `ReturnType<typeof useAnimatedScrollHandler>` | No       | N/A     | An animated scroll handler created with useAnimatedScrollHandler. See [Reanimated docs](https://docs.swmansion.com/react-native-reanimated) for further info. |

### NestedReorderableList

This component allows nesting a reorderable list within a [ScrollViewContainer](#scrollviewcontainer):

| Props      | Type      | Required | Default | Description                                                                                                                                            |
| ---------- | --------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| scrollable | `boolean` | No       | false   | Whether the nested list is scrollable or not. If the nested list has a fixed height and it's scrollable it should be set to `true`, otherwise `false`. |

## Hooks

### useReorderableDrag

This hook creates a function that triggers the drag of a list item. It's usually called on a long press event. This hook can only be used inside of a list item component.

##### Returns

- `() => void`

### useReorderableDragStart

This hook allows handling the drag start event of a list item. This hook can only be used inside of a list item component. It receives a worklet callback that is called when the drag starts. It's recommended to wrap the handler function in a useCallback as follows:

```typescript
useReorderableDragStart(
  useCallback((index: number) => {
    'worklet';

    // ...
  }, []),
);
```

Using this hook in large lists is discouraged due to performance bottlenecks, prefer `onDragStart` on the ReorderableList instead.

### useReorderableDragEnd

This hook allows handling the drag end event of a list item. This hook can only be used inside of a list item component. It receives a worklet callback that is called when the drag starts. It's recommended to wrap the handler function in a useCallback as follows:

```typescript
useReorderableDragEnd(
  useCallback((from: number, to: number) => {
    'worklet';

    // ...
  }, []),
);
```

Using this hook in large lists is discouraged due to performance bottlenecks, prefer `onDragEnd` on the ReorderableList instead.

### useIsActive

This hook returns a boolean indicating whether the current item is active. It will return true on drag start and false on drag end. This hook can only be used inside of a list item component.

```typescript
const isActive = useIsActive();
```

Additionally this hook requires setting `shouldUpdateActiveItem` to true on the ReorderableList:

```typescript
<ReorderableList
  // ...
  shouldUpdateActiveItem
/>
```

## Utils

- **reorderItems**: `<T>(data: T[], from: number, to: number) => T[]`

  This function receives an array of items, the index of the item to be moved, and the index of the new position and it returns a new array with the items reordered.

## Troubleshooting

### RefreshControl

If you want to use RefreshControl with ReorderableList you might encounter some issues on Android, where gestures are conflicting making one or both of the components non responsive. To overcome this issues you can delay the activation of pan gestures necessary for dragging items by using the `panActivateAfterLongPress` prop. This duration should be slightly longer than the long press delay necessary to drag your items. If you're using Pressable the `delayLongPress` is 500 ms by default.

```typescript
<ReorderableList
  // ...
  panActivateAfterLongPress={Platform.OS === 'android' ? 520 : undefined}
/>
```

If you change `delayLongPress` on your Pressable, update this prop accordingly.

Another issue you'll encounter is that when you drag your items the RefreshControl might animate. To avoid this you can enable and disable it on drag start and drag end like so:

```typescript
const [refreshEnabled, setRefreshEnabled] = useState(true);

const handleDragStart = useCallback(() => {
  'worklet';

  // NOTE: if it's refreshing we don't want the refresh control to disappear
  // and we can keep it enabled since it won't conflict with the drag
  if (Platform.OS === 'android' && !refreshing) {
    runOnJS(setRefreshEnabled)(false);
  }
}, [refreshing]);

const handleDragEnd = useCallback(() => {
  'worklet';

  // NOTE: if it's refreshing we don't want the refresh control to disappear
  // and we can keep it enabled since it won't conflict with the drag
  if (Platform.OS === 'android' && !refreshing) {
    runOnJS(setRefreshEnabled)(true);
  }
}, [refreshing]);

return (
  <ReorderableList
    // ...
    onDragStart={handleDragStart}
    onDragEnd={handleDragEnd}
    refreshControl={
      <RefreshControl
        // ...
        enabled={refreshEnabled}
      />
    }
  />
);
```

## Example

Here is simple example of how to use this component. Examples of nested lists and much more can be found in the [example](https://github.com/omahili/react-native-reorderable-list/tree/feat/nested-lists/example) directory.

```typescript
import React, {memo, useState} from 'react';
import {ListRenderItemInfo, Pressable, StyleSheet, Text} from 'react-native';
import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
  useReorderableDrag,
} from 'react-native-reorderable-list';

interface CardProps {
  id: string;
  color: string;
  height: number;
}

const list: CardProps[] = [
  {id: '0', color: 'red', height: 100},
  {id: '1', color: 'blue', height: 150},
  {id: '2', color: 'green', height: 80},
  {id: '3', color: 'violet', height: 100},
  {id: '4', color: 'orange', height: 120},
  {id: '5', color: 'coral', height: 100},
  {id: '6', color: 'purple', height: 110},
  {id: '7', color: 'chocolate', height: 80},
  {id: '8', color: 'crimson', height: 90},
  {id: '9', color: 'seagreen', height: 90},
];

const Card: React.FC<CardProps> = memo(({id, color, height}) => {
  const drag = useReorderableDrag();

  return (
    <Pressable style={[styles.card, {height}]} onLongPress={drag}>
      <Text style={[styles.text, {color}]}>Card {id}</Text>
    </Pressable>
  );
});

const Example = () => {
  const [data, setData] = useState(list);

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<CardProps>) => (
    <Card {...item} />
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderRadius: 5,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  text: {
    fontSize: 20,
  },
});

export default Example;
```

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
