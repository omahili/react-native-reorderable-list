import React, {useState} from 'react';
import {ListRenderItemInfo, StyleSheet, View} from 'react-native';

import {
  ReorderableListReorderEvent,
  reorderItems,
} from 'react-native-reorderable-list';

import {
  ListItem,
  ReorderableList,
  SeedDataItem,
  useHorizontal,
  usePanGesture,
  useSeedData,
} from './common';

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

export const MultipleListsScreen = () => {
  const {horizontal} = useHorizontal();

  return (
    <View style={[styles.container, horizontal && styles.horizontalContainer]}>
      <List />
      <View
        style={[styles.separator, horizontal && styles.horizontalSeparator]}
      />
      <List />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 2,
  },
  horizontalContainer: {
    flexDirection: 'row',
  },
  list: {
    flex: 1,
    width: '100%',
  },
  separator: {
    height: 10,
    backgroundColor: 'lightblue',
  },
  horizontalSeparator: {
    width: 10,
    height: '100%',
  },
});
