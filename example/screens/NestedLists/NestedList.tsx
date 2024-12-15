import React, {memo, useState} from 'react';
import {
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  NestedReorderableList,
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
];

const Card: React.FC<CardProps> = memo(({id, color, height}) => {
  const drag = useReorderableDrag();

  return (
    <ReorderableListItem>
      <Pressable style={[styles.card, {height}]} onLongPress={drag}>
        <Text style={[styles.text, {color}]}>Card {id}</Text>
      </Pressable>
    </ReorderableListItem>
  );
});

interface NestedListProps {
  index: number;
}

export const NestedList: React.FC<NestedListProps> = ({index}) => {
  const [data, setData] = useState(list);

  const renderItem = ({item}: ListRenderItemInfo<CardProps>) => (
    <Card {...item} />
  );

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    const newData = reorderItems(data, from, to);
    setData(newData);
  };

  return (
    <NestedReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      scrollEnabled={false}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.text}>List {index}</Text>
        </View>
      }
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
  header: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
