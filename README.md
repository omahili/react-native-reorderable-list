# React Native Reorderable List

A reorderable list for React Native applications, powered by Reanimated 2 🚀

## Install

### Npm

 ```
 npm install --save react-native-reorderable-list@0.1.0
 ```

### Yarn

 ```
 yarn add react-native-reorderable-list@0.1.0
 ```

Then you need to install these two peer dependencies:

  - [**React Reanimated**](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation) >=2.2.0
  - [**React Native Gesture Handler**](https://docs.swmansion.com/react-native-gesture-handler/docs/#installation) >=1.10.0

So head down to their docs and follow their instructions.

## API

This component uses a [FlatList](https://reactnative.dev/docs/flatlist) and it extends its props. See [Known Limitations](#known-limitations) for unsupported props.

Additional props:

| Prop                      | Type                                  | Required   | Default   | Description                                           |
|---------------------------|---------------------------------------|------------|-----------|-------------------------------------------------------|
| onReorder                 | `(from: number, to: number) => void`  | yes        |           | Function called when an item is released and the list is reordered. |
| containerStyle            | `StyleProp<ViewStyle>`                | no         |           | Style for the FlatList container.                     |
| scrollAreaHeight          | `number`                              | no         | `0.1`     | Portion on the bottom and top of the list which triggers scrolling when dragging an item. |
| scrollSpeed               | `number`                              | no         | `1.5`     | Speed ratio at which the list scrolls.                |
| dragScale                 | `number`                              | no         | `1.05`    | Size ratio to which an item scales when dragged.      |

## Known Limitations

At the moment it doesn't support these FlatList props:

  - ```horizontal```
  - ```onScroll```
  - ```scrollEventThrottle```

## Usage

```typescript
import React, {useState} from 'react';
import {
  GestureResponderEvent,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ReorderableList from 'react-native-reorderable-list';

interface CardInfo {
  id: string;
  color: string;
  height: number;
}

interface CardProps extends CardInfo {
  onLongPress?: (event: GestureResponderEvent) => void;
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
  ({id, color, onLongPress, height}) => (
    <Pressable style={[styles.card, {height}]} onLongPress={onLongPress}>
      <Text style={{color}}>Card {id}</Text>
    </Pressable>
  ),
);

const App = () => {
  const [data, setData] = useState(list);

  const renderItem = (
    {item}: ListRenderItemInfo<CardInfo>,
    onLongPress?: (event: GestureResponderEvent) => void,
  ) => <Card {...item} onLongPress={onLongPress} />;

  const handleReorder = (from: number, to: number) => {
    const newData = [...data];
    newData.splice(to, 0, newData.splice(from, 1)[0]);
    setData(newData);
  };

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={(item: CardInfo) => item.id}
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
});

export default App;
```
