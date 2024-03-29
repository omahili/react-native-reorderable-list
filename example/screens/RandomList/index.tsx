import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
} from 'react-native-reorderable-list';

import RandomListItem from './RandomListItem';

const list = Array(1000)
  .fill(null)
  .map((_, i) => ({
    id: i.toString(),
    height: Math.max(50, Math.floor(Math.random() * 100)),
  }));

const RandomList = () => {
  const [data, setData] = useState(list);

  const renderItem = ({
    item,
  }: ListRenderItemInfo<{id: string; height: number}>) => (
    <RandomListItem {...item} />
  );

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
      style={styles.fill}
      keyExtractor={item => item.id}
    />
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

export default RandomList;
