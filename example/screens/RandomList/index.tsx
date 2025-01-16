import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {RandomListItem} from './RandomListItem';

interface RandomItemData {
  id: string;
  height: number;
}

const list: RandomItemData[] = Array(500)
  .fill(null)
  .map((_, i) => ({
    id: i.toString(),
    height: Math.max(50, Math.floor(Math.random() * 100)),
  }));

export const RandomListScreen = () => {
  const [data, setData] = useState(list);

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<RandomItemData>) => (
    <RandomListItem {...item} />
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      style={styles.fill}
    />
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
