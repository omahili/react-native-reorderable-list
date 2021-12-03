# React Native Reorderable List

A reorderable list for React Native applications, powered by Reanimated 2 🚀

![Example](https://media.giphy.com/media/EVQOjtGx61QS8s9Y0z/giphy.gif)

## Install

### Npm

 ```
 npm install --save react-native-reorderable-list
 ```

### Yarn

 ```
 yarn add react-native-reorderable-list
 ```

Then you need to install these two peer dependencies:

  - [**React Native Reanimated**](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation) >=2.2.0
  - [**React Native Gesture Handler**](https://docs.swmansion.com/react-native-gesture-handler/docs/#installation) >=1.10.0

So head down to their docs and follow their instructions.

## API

This component uses a [FlatList](https://reactnative.dev/docs/flatlist) and it extends its props. See [Known Limitations](#known-limitations) for unsupported props.

Additional props:

| Prop                      | Type                                  | Required   | Default   | Description                                           |
|---------------------------|---------------------------------------|------------|-----------|-------------------------------------------------------|
| renderItem                | `(info: {item: T, index: number, separators: ItemSeparators, drag?: () => void, isDragged?: boolean}) => ReactElement`  | yes        |           | Renders into the list an item from data. The function `drag` needs to be called when the drag gesture should be enabled, for example `onLongPress` event. The property `isDragged` becomes true for the dragged item. |
| onReorder                 | `(event: {fromIndex: number, toIndex: number}) => void`  | yes        |           | Function called when an item is released and the list is reordered. |
| containerStyle            | `StyleProp<ViewStyle>`                | no         |           | Style for the FlatList container.                     |
| scrollAreaSize            | `number`                              | no         | `0.1`     | Portion at the extremeties of the list which triggers scrolling when dragging an item. Accepts a value between `0` and `0.5`. |
| scrollSpeed               | `number`                              | no         | `2`       | Speed at which the list scrolls.                      |
| dragScale                 | `number`                              | no         | `1`       | Size ratio to which an item scales when dragged.      |

## Known Limitations

At the moment it doesn't support these FlatList props:

  - ```horizontal```
  - ```onScroll```
  - ```scrollEventThrottle```

## Usage

```typescript
import React, {useState} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import ReorderableList, {
  ReorderableListRenderItemInfo,
  ReorderableListReorderEvent,
} from 'react-native-reorderable-list';

interface CardInfo {
  id: string;
  color: string;
  height: number;
}

interface CardProps extends CardInfo {
  drag?: () => void;
  isDragged?: boolean;
}

const list: CardInfo[] = [
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

const Card: React.FC<CardProps> = React.memo(
  ({id, color, height, drag, isDragged}) => (
    <Pressable
      style={[styles.card, isDragged && styles.dragged, {height}]}
      onLongPress={drag}>
      <Text style={[styles.text, {color}]}>Card {id}</Text>
    </Pressable>
  ),
);

const App = () => {
  const [data, setData] = useState(list);

  const renderItem = (
    {item, ...rest}: ReorderableListRenderItemInfo<CardInfo>,
  ) => <Card {...item} {...rest} />;

  const handleReorder = ({fromIndex, toIndex}: ReorderableListReorderEvent) => {
    const newData = [...data];
    newData.splice(toIndex, 0, newData.splice(fromIndex, 1)[0]);
    setData(newData);
  };

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={(item: CardInfo) => item.id}
      dragScale={1.025}
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
  dragged: {
    opacity: 0.7,
  },
  text: {
    fontSize: 20,
  },
});

export default App;
```
