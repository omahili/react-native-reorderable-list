import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet, View} from 'react-native';

import ReorderableList, {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {ListItem, SeedDataItem, usePanGesture, useSeedData} from './common';

const List = () => {
  const seedData = useSeedData();
  const [data, setData] = useState(seedData);
  const panGesture = usePanGesture();

  const handleReorder = ({from, to}: ReorderableListReorderEvent) => {
    setData(value => reorderItems(value, from, to));
  };

  const renderItem = ({item}: ListRenderItemInfo<SeedDataItem>) => (
    <ListItem {...item} />
  );

  return (
    <ReorderableList
      data={data}
      onReorder={handleReorder}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      panGesture={panGesture}
      style={styles.list}
    />
  );
};

export const MultipleListsScreen = () => (
  <View style={styles.container}>
    <List />
    <View style={styles.separator} />
    <List />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 2,
  },
  list: {
    flex: 1,
  },
  separator: {
    height: 10,
    backgroundColor: 'lightblue',
  },
});
