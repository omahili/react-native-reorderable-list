import React, {useState} from 'react';
import {ListRenderItemInfo, Pressable, StyleSheet, Text} from 'react-native';

import ReorderableList, {
  ReorderableListItem,
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

const Card: React.FC<CardProps> = React.memo(({id, color, height}) => {
  const drag = useReorderableDrag();

  return (
    <ReorderableListItem>
      <Pressable style={[styles.card, {height}]} onLongPress={drag}>
        <Text style={[styles.text, {color}]}>Card {id}</Text>
      </Pressable>
    </ReorderableListItem>
  );
});

export const ReadmeScreen = () => {
  const [data, setData] = useState(list);

  const renderItem = ({item}: ListRenderItemInfo<CardProps>) => (
    <Card {...item} />
  );

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    const newData = reorderItems(data, from, to);
    setData(newData);
  };

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
