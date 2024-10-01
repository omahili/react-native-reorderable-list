import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {RandomListItem} from './RandomListItem';

const list = Array(100)
  .fill(null)
  .map((_, i) => ({
    id: i.toString(),
    height: Math.max(50, Math.floor(Math.random() * 100)),
  }));

export const RandomListScreen = () => {
  const [data, setData] = useState(list);

  const renderItem = ({
    item,
  }: ListRenderItemInfo<{id: string; height: number}>) => (
    <RandomListItem {...item} />
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
